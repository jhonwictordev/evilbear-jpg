import {
  findOrder,
  hasValidWebhookSignature,
  paymentStatus,
  readBody,
  safeText,
  saveOrder,
  sendJson,
} from "../_shared.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, { message: "Método não permitido." }, 405);
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    return sendJson(res, { message: "Webhook não configurado." }, 503);
  }

  let notification;
  try {
    notification = await readBody(req);
  } catch {
    return sendJson(res, { message: "Payload inválido." }, 400);
  }

  const url = new URL(req.url || "/api/webhooks/mercadopago", `https://${req.headers.host || "evilbear-jpg.vercel.app"}`);
  const dataId = safeText(url.searchParams.get("data.id") ?? notification?.data?.id, 80);
  if (!await hasValidWebhookSignature(req, dataId)) return sendJson(res, { message: "Assinatura inválida." }, 401);
  if (notification?.type !== "payment" || !dataId) return sendJson(res, { received: true });

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
    headers: { authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
  });
  const payment = await paymentResponse.json().catch(() => null);
  if (!paymentResponse.ok || !payment) return sendJson(res, { message: "Pagamento não encontrado." }, 502);

  const orderNumber = safeText(payment.external_reference, 80);
  const order = await findOrder(orderNumber);
  if (!order) return sendJson(res, { received: true, matched: false });

  const paidCents = Math.round(Number(payment.transaction_amount) * 100);
  const paymentMatchesOrder = payment.currency_id === "BRL"
    && Number.isSafeInteger(paidCents)
    && paidCents === order.totalCents
    && payment.metadata?.order_number === order.orderNumber;
  if (!paymentMatchesOrder) return sendJson(res, { message: "Pagamento não corresponde ao pedido." }, 409);

  order.status = paymentStatus(payment.status);
  order.paymentId = String(payment.id);
  order.updatedAt = new Date().toISOString();
  if (order.status === "approved") order.approvedAt ??= order.updatedAt;
  await saveOrder(order);
  return sendJson(res, { received: true, matched: true });
}
