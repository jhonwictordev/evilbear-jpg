import { beats, getLicense } from "../lib/beat-catalog";

type Env = {
  DB?: D1Database;
  BEAT_FILES?: R2Bucket;
  MERCADO_PAGO_ACCESS_TOKEN?: string;
  MERCADO_PAGO_WEBHOOK_SECRET?: string;
  PUBLIC_SITE_URL?: string;
  ORDER_NOTIFICATION_WEBHOOK_URL?: string;
  ORDER_NOTIFICATION_WEBHOOK_TOKEN?: string;
};
type ItemInput = { beatSlug?: unknown; licenseId?: unknown };
type CustomerInput = { name?: unknown; email?: unknown; contact?: unknown };
const memoryRateLimit = new Map<string, { count: number; resetAt: number }>();

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const safeText = (value: unknown, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";
const mapPaymentStatus = (status: string) => ({ approved: "approved", rejected: "rejected", cancelled: "cancelled", refunded: "refunded" }[status] ?? "pending");
const orderNumber = () => `EVB-${Date.now().toString().slice(-8)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase()}`;

function rateLimit(request: Request, limit = 8, windowMs = 60_000) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const now = Date.now(); const entry = memoryRateLimit.get(ip);
  if (!entry || now > entry.resetAt) { memoryRateLimit.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  entry.count += 1; return entry.count <= limit;
}

function requireDb(env: Env) { if (!env.DB) throw new Error("Banco de pedidos ainda não está configurado."); return env.DB; }
function origin(env: Env, request: Request) { return (env.PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, ""); }
function buildServerItems(items: ItemInput[]) {
  const chosen = new Map<string, { beat: (typeof beats)[number]; license: NonNullable<ReturnType<typeof getLicense>> }>();
  for (const item of items.slice(0, 10)) { const beat = beats.find((candidate) => candidate.slug === safeText(item.beatSlug, 80) && candidate.published); const license = beat && getLicense(beat, safeText(item.licenseId, 40)); if (beat && license) chosen.set(beat.id, { beat, license }); }
  return [...chosen.values()];
}

async function createCheckout(request: Request, env: Env) {
  if (!rateLimit(request)) return json({ message: "Muitas tentativas. Aguarde um minuto." }, 429);
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) return json({ message: "Checkout indisponível. Configure o Mercado Pago no servidor antes de receber pagamentos." }, 503);
  let input: { customer?: CustomerInput; items?: ItemInput[] };
  try { input = await request.json(); } catch { return json({ message: "Dados de checkout inválidos." }, 400); }
  const name = safeText(input.customer?.name); const email = safeText(input.customer?.email, 254).toLowerCase(); const contact = safeText(input.customer?.contact); const selected = buildServerItems(Array.isArray(input.items) ? input.items : []);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !selected.length) return json({ message: "Revise seus dados e itens do carrinho." }, 400);
  const db = requireDb(env); const number = orderNumber(); const id = crypto.randomUUID(); const total = selected.reduce((sum, item) => sum + item.license.priceCents, 0); const now = new Date().toISOString();
  await db.prepare("INSERT INTO orders (id, order_number, customer_name, customer_email, customer_contact, total_cents, payment_provider, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'mercado_pago', 'pending', ?)").bind(id, number, name, email, contact || null, total, now).run();
  await db.batch(selected.map((item) => db.prepare("INSERT INTO order_items (id, order_id, beat_id, beat_name, license_id, license_name, unit_price_cents) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, item.beat.id, item.beat.title, item.license.id, item.license.name, item.license.priceCents)));
  const siteOrigin = origin(env, request); const preference = { items: selected.map(({ beat, license }) => ({ id: `${beat.id}:${license.id}`, title: `${beat.title} — ${license.name}`, quantity: 1, currency_id: "BRL", unit_price: license.priceCents / 100 })), payer: { name, email }, external_reference: number, notification_url: `${siteOrigin}/api/webhooks/mercadopago`, back_urls: { success: `${siteOrigin}/checkout/success?order=${encodeURIComponent(number)}`, pending: `${siteOrigin}/checkout/success?order=${encodeURIComponent(number)}`, failure: `${siteOrigin}/checkout/success?order=${encodeURIComponent(number)}` }, auto_return: "approved", metadata: { order_number: number } };
  const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", { method: "POST", headers: { authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(preference) });
  const mp = await mpResponse.json() as { id?: string; init_point?: string; sandbox_init_point?: string; message?: string };
  if (!mpResponse.ok || !mp.init_point) { await db.prepare("UPDATE orders SET payment_status = 'cancelled' WHERE id = ?").bind(id).run(); return json({ message: "Não foi possível criar o checkout no Mercado Pago." }, 502); }
  await db.prepare("UPDATE orders SET payment_preference_id = ? WHERE id = ?").bind(mp.id ?? null, id).run();
  return json({ orderNumber: number, initPoint: mp.init_point });
}

function signatureParts(header: string | null) { return Object.fromEntries((header ?? "").split(",").map((part) => part.trim().split("=")).filter(([key, value]) => key && value)); }
async function validSignature(request: Request, body: { data?: { id?: string } }, secret?: string) {
  if (!secret) return false; const parts = signatureParts(request.headers.get("x-signature")); const timestamp = parts.ts; const signature = parts.v1; const requestId = request.headers.get("x-request-id") ?? ""; const dataId = body.data?.id ?? "";
  if (!timestamp || !signature || !dataId) return false; const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`; const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest)); const expected = [...new Uint8Array(signed)].map((item) => item.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false; let difference = 0; for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index); return difference === 0;
}

async function notify(env: Env, payload: Record<string, unknown>) { if (!env.ORDER_NOTIFICATION_WEBHOOK_URL) return; await fetch(env.ORDER_NOTIFICATION_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json", ...(env.ORDER_NOTIFICATION_WEBHOOK_TOKEN ? { authorization: `Bearer ${env.ORDER_NOTIFICATION_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify(payload) }); }

async function processWebhook(request: Request, env: Env) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN || !env.MERCADO_PAGO_WEBHOOK_SECRET) return json({ message: "Webhook não configurado." }, 503);
  let body: { id?: string | number; type?: string; data?: { id?: string } }; try { body = await request.json(); } catch { return json({ message: "Payload inválido." }, 400); }
  if (!await validSignature(request, body, env.MERCADO_PAGO_WEBHOOK_SECRET)) return json({ message: "Assinatura inválida." }, 401);
  if (body.type !== "payment" || !body.data?.id) return json({ received: true });
  const db = requireDb(env); const eventId = String(body.id ?? body.data.id); const inserted = await db.prepare("INSERT OR IGNORE INTO webhook_events (id, provider, received_at, payload) VALUES (?, 'mercado_pago', ?, ?)").bind(eventId, new Date().toISOString(), JSON.stringify(body)).run();
  if (!inserted.meta.changes) return json({ received: true, duplicate: true });
  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(body.data.id)}`, { headers: { authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}` } }); if (!paymentResponse.ok) return json({ message: "Pagamento não encontrado." }, 502);
  const payment = await paymentResponse.json() as { id: string | number; status?: string; external_reference?: string }; const number = safeText(payment.external_reference, 100); if (!number) return json({ received: true }); const status = mapPaymentStatus(payment.status ?? "pending"); const now = new Date().toISOString();
  await db.prepare("UPDATE orders SET payment_id = ?, payment_status = ?, approved_at = CASE WHEN ? = 'approved' THEN COALESCE(approved_at, ?) ELSE approved_at END WHERE order_number = ?").bind(String(payment.id), status, status, now, number).run();
  if (status === "approved") { const order = await db.prepare("SELECT id, order_number, customer_name, customer_email, total_cents, email_sent_at FROM orders WHERE order_number = ?").bind(number).first<{ id: string; order_number: string; customer_name: string; customer_email: string; total_cents: number; email_sent_at: string | null }>(); if (order) { const orderItems = await db.prepare("SELECT beat_id, beat_name, license_id, license_name, unit_price_cents FROM order_items WHERE order_id = ?").bind(order.id).all<{ beat_id: string; beat_name: string; license_id: string; license_name: string; unit_price_cents: number }>(); for (const item of orderItems.results) { const token = crypto.randomUUID().replaceAll("-", ""); await db.prepare("INSERT OR IGNORE INTO download_tokens (id, order_id, beat_id, license_id, token, expires_at, max_downloads, download_count, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+14 days'), 5, 0, ?)").bind(crypto.randomUUID(), order.id, item.beat_id, item.license_id, token, now).run(); } if (!order.email_sent_at) { await notify(env, { event: "order.approved", orderNumber: order.order_number, customer: { name: order.customer_name, email: order.customer_email }, totalCents: order.total_cents, items: orderItems.results }); await db.prepare("UPDATE orders SET email_sent_at = ? WHERE id = ?").bind(now, order.id).run(); } } }
  return json({ received: true });
}

async function orderStatus(number: string, env: Env) { const db = requireDb(env); const order = await db.prepare("SELECT order_number, payment_status, total_cents FROM orders WHERE order_number = ?").bind(number).first<{ order_number: string; payment_status: string; total_cents: number }>(); if (!order) return json({ message: "Pedido não encontrado." }, 404); const downloads = order.payment_status === "approved" ? await db.prepare("SELECT token, expires_at, max_downloads, download_count FROM download_tokens WHERE order_id = (SELECT id FROM orders WHERE order_number = ?)").bind(number).all<{ token: string; expires_at: string; max_downloads: number; download_count: number }>() : { results: [] }; return json({ orderNumber: order.order_number, status: order.payment_status, totalCents: order.total_cents, downloads: downloads.results.map((item) => ({ url: `/api/download/${item.token}`, expiresAt: item.expires_at, remaining: item.max_downloads - item.download_count })) }); }

async function download(token: string, env: Env) { const db = requireDb(env); if (!env.BEAT_FILES) return json({ message: "Armazenamento privado não configurado." }, 503); const item = await db.prepare("SELECT dt.id, dt.beat_id, dt.license_id FROM download_tokens dt JOIN orders o ON o.id = dt.order_id WHERE dt.token = ? AND o.payment_status = 'approved' AND dt.expires_at > datetime('now') AND dt.download_count < dt.max_downloads").bind(token).first<{ id: string; beat_id: string; license_id: string }>(); if (!item) return json({ message: "Link indisponível ou expirado." }, 403); const objectKey = `deliveries/${item.beat_id}/${item.license_id}.zip`; const file = await env.BEAT_FILES.get(objectKey); if (!file) return json({ message: "Arquivo ainda não foi enviado pelo administrador." }, 404); const updated = await db.prepare("UPDATE download_tokens SET download_count = download_count + 1, last_download_at = ? WHERE id = ? AND download_count < max_downloads").bind(new Date().toISOString(), item.id).run(); if (!updated.meta.changes) return json({ message: "Limite de downloads atingido." }, 403); return new Response(file.body, { headers: { "content-type": file.httpMetadata?.contentType ?? "application/zip", "content-disposition": `attachment; filename="evilbear-${item.beat_id}-${item.license_id}.zip"`, "cache-control": "private, no-store" } }); }

export async function handleBeatStoreApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url); if (!url.pathname.startsWith("/api/")) return null;
  try { if (url.pathname === "/api/checkout" && request.method === "POST") return createCheckout(request, env); if (url.pathname === "/api/webhooks/mercadopago" && request.method === "POST") return processWebhook(request, env); if (url.pathname.startsWith("/api/orders/") && request.method === "GET") return orderStatus(decodeURIComponent(url.pathname.slice("/api/orders/".length)), env); if (url.pathname.startsWith("/api/download/") && request.method === "GET") return download(url.pathname.slice("/api/download/".length), env); return json({ message: "Rota não encontrada." }, 404); } catch (error) { console.error("Beat Store API error", error); return json({ message: "Não foi possível processar sua solicitação." }, 500); }
}
