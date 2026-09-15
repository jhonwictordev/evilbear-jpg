import {
  buildServerItems,
  createOrderNumber,
  json,
  publicOrigin,
  safeText,
  saveOrder,
  validEmail,
} from "./_shared.mjs";

const attempts = new Map();

function withinRateLimit(request) {
  const key = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.expiresAt) {
    attempts.set(key, { count: 1, expiresAt: now + 60_000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 8;
}

export default async function checkout(request) {
  if (!withinRateLimit(request)) return json({ message: "Muitas tentativas. Aguarde um minuto." }, 429);
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return json({ message: "Checkout indisponível. A integração de pagamentos ainda não foi ativada." }, 503);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ message: "Dados de checkout inválidos." }, 400);
  }

  const name = safeText(input?.customer?.name);
  const email = safeText(input?.customer?.email, 254).toLowerCase();
  const contact = safeText(input?.customer?.contact);
  const items = buildServerItems(input?.items);
  if (name.length < 2 || !validEmail(email) || items.length === 0) {
    return json({ message: "Revise seus dados e itens do carrinho." }, 400);
  }

  const totalCents = items.reduce((total, item) => total + item.license.priceCents, 0);
  const order = {
    orderNumber: createOrderNumber(),
    customer: { name, email, contact: contact || null },
    items,
    totalCents,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await saveOrder(order);

  const siteUrl = publicOrigin(request);
  const preference = {
    items: items.map(({ beat, license }) => ({
      id: `${beat.id}:${license.id}`,
      title: `${beat.title} — ${license.name}`,
      quantity: 1,
      currency_id: "BRL",
      unit_price: license.priceCents / 100,
    })),
    payer: { name, email },
    external_reference: order.orderNumber,
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${siteUrl}/checkout/success?order=${encodeURIComponent(order.orderNumber)}`,
      pending: `${siteUrl}/checkout/success?order=${encodeURIComponent(order.orderNumber)}`,
      failure: `${siteUrl}/checkout/success?order=${encodeURIComponent(order.orderNumber)}`,
    },
    auto_return: "approved",
    metadata: { order_number: order.orderNumber },
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(preference),
  });
  const payment = await response.json().catch(() => null);
  if (!response.ok || !payment?.init_point) {
    order.status = "cancelled";
    order.updatedAt = new Date().toISOString();
    await saveOrder(order);
    return json({ message: "Não foi possível iniciar o pagamento. Tente novamente." }, 502);
  }

  order.preferenceId = payment.id;
  order.updatedAt = new Date().toISOString();
  await saveOrder(order);
  return json({ orderNumber: order.orderNumber, initPoint: payment.init_point });
}

export const config = { path: "/api/checkout", method: "POST" };
