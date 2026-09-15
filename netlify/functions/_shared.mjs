import { getStore } from "@netlify/blobs";
import { beats, getLicense } from "../../lib/beat-catalog.ts";

const orderStore = () => getStore("evilbear-orders", { consistency: "strong" });
const orderKey = (orderNumber) => `orders/${orderNumber}`;

export const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" },
});

export const safeText = (value, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";

export const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const paymentStatus = (status) => ({
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
}[status] ?? "pending");

export function publicOrigin(request) {
  return (process.env.PUBLIC_SITE_URL || process.env.URL || new URL(request.url).origin).replace(/\/$/, "");
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

export async function saveOrder(order) {
  await orderStore().setJSON(orderKey(order.orderNumber), order);
  return order;
}

export async function findOrder(orderNumber) {
  if (!/^EVB-[A-Z0-9]{20}$/.test(orderNumber)) return null;
  return orderStore().get(orderKey(orderNumber), { type: "json" });
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

export async function hasValidWebhookSignature(request, dataId) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const { ts, v1 } = parseSignature(request.headers.get("x-signature"));
  const requestId = request.headers.get("x-request-id") ?? "";
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
