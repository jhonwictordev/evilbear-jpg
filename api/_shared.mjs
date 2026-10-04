import { beats, getLicense } from "../lib/beat-catalog.ts";

const memoryOrders = globalThis.__evilbearOrders ?? new Map();
globalThis.__evilbearOrders = memoryOrders;

const orderKey = (orderNumber) => `evilbear:orders:${orderNumber}`;

export function sendJson(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

export async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export const safeText = (value, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";

export const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const paymentStatus = (status) => ({
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
}[status] ?? "pending");

export function publicOrigin(req) {
  const configured = process.env.PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) return configured.startsWith("http") ? configured.replace(/\/$/, "") : `https://${configured}`.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "evilbear-jpg.vercel.app";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export function createOrderNumber() {
  return `EVB-${crypto.randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
}

export function buildServerItems(items) {
  const chosen = new Map();
  for (const item of Array.isArray(items) ? items.slice(0, 10) : []) {
    const beat = beats.find((candidate) => candidate.published && candidate.slug === safeText(item?.beatSlug, 80));
    const license = beat && getLicense(beat, safeText(item?.licenseId, 80));
    if (beat && license) {
      chosen.set(beat.id, {
        beat: { id: beat.id, slug: beat.slug, title: beat.title },
        license: { id: license.id, name: license.name, priceCents: license.priceCents },
      });
    }
  }
  return [...chosen.values()];
}

async function kvRequest(path, init = {}) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(`${url.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`KV request failed: ${response.status}`);
  return response.json();
}

export async function saveOrder(order) {
  memoryOrders.set(order.orderNumber, order);
  await kvRequest(`/set/${encodeURIComponent(orderKey(order.orderNumber))}`, {
    method: "POST",
    body: JSON.stringify(order),
  });
  return order;
}

export async function findOrder(orderNumber) {
  if (!/^EVB-[A-Z0-9]{20}$/.test(orderNumber)) return null;
  const cached = memoryOrders.get(orderNumber);
  if (cached) return cached;
  const result = await kvRequest(`/get/${encodeURIComponent(orderKey(orderNumber))}`);
  const value = result?.result;
  if (!value) return null;
  return typeof value === "string" ? JSON.parse(value) : value;
}

export function publicOrder(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    totalCents: order.totalCents,
    approvedAt: order.approvedAt ?? null,
    downloads: [],
  };
}

export function webhookManifest({ dataId, requestId, timestamp }) {
  const parts = [];
  if (dataId) parts.push(`id:${dataId};`);
  if (requestId) parts.push(`request-id:${requestId};`);
  if (timestamp) parts.push(`ts:${timestamp};`);
  return parts.join("");
}

export function parseSignature(header) {
  return Object.fromEntries((header ?? "")
    .split(",")
    .map((part) => part.trim().split("="))
    .filter(([key, value]) => key && value));
}

export async function hasValidWebhookSignature(req, dataId) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const { ts, v1 } = parseSignature(req.headers["x-signature"]);
  const requestId = req.headers["x-request-id"] ?? "";
  if (!secret || !ts || !v1 || !dataId) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(webhookManifest({ dataId, requestId, timestamp: ts })),
  );
  const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (expected.length !== v1.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ v1.charCodeAt(index);
  return difference === 0;
}
