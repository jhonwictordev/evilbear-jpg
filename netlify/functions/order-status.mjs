import { findOrder, json, publicOrder, safeText } from "./_shared.mjs";

export default async function orderStatus(request, context) {
  const url = new URL(request.url);
  const orderFromPath = url.pathname.match(/\/api\/orders\/([^/]+)$/)?.[1];
  const orderId = context.params?.order ?? url.searchParams.get("order") ?? orderFromPath;
  const order = await findOrder(safeText(orderId, 80));
  if (!order) return json({ message: "Pedido não encontrado." }, 404);
  return json(publicOrder(order));
}

export const config = { path: "/api/orders/:order", method: "GET" };
