import { findOrder, publicOrder, safeText, sendJson } from "../_shared.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, { message: "Método não permitido." }, 405);
  const orderId = safeText(req.query?.order, 80);
  const order = await findOrder(orderId);
  if (!order) return sendJson(res, { message: "Pedido não encontrado." }, 404);
  return sendJson(res, publicOrder(order));
}
