"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Beat, beats, getLicense } from "@/lib/beat-catalog";

export type CartItem = { beatSlug: string; licenseId: string };
type CartContextValue = { items: CartItem[]; add: (beat: Beat, licenseId: string) => void; remove: (beatSlug: string) => void; changeLicense: (beat: Beat, licenseId: string) => void; clear: () => void; count: number; totalCents: number; };
const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "evilbear-beat-cart-v1";

function readStoredCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => typeof item === "object" && item !== null && typeof item.beatSlug === "string" && typeof item.licenseId === "string");
  } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { setItems(readStoredCart()); setReady(true); }); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (ready) localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, ready]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    add: (beat, licenseId) => { if (!getLicense(beat, licenseId)) return; setItems((current) => [...current.filter((item) => item.beatSlug !== beat.slug), { beatSlug: beat.slug, licenseId }]); },
    remove: (beatSlug) => setItems((current) => current.filter((item) => item.beatSlug !== beatSlug)),
    changeLicense: (beat, licenseId) => { if (!getLicense(beat, licenseId)) return; setItems((current) => current.map((item) => item.beatSlug === beat.slug ? { ...item, licenseId } : item)); },
    clear: () => setItems([]),
    count: items.length,
    totalCents: items.reduce((total, item) => {
      const beat = beats.find((candidate) => candidate.slug === item.beatSlug);
      return total + (beat ? getLicense(beat, item.licenseId)?.priceCents ?? 0 : 0);
    }, 0),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be inside CartProvider"); return context; }
