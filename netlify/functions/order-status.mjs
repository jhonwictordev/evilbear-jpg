import { findOrder, json, publicOrder, safeText } from "./_shared.mjs";

export default async function orderStatus(_request, context) {
  const order = await findOrder(safeText(context.params.order, 80));
  if (!order) return json({ message: "Pedido não encontrado." }, 404);
  return json(publicOrder(order));
}

export const config = { path: "/api/orders/:order", method: "GET" };
