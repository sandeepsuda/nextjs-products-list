"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectCartItems, type CartItem } from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import type { ProductData } from "@/lib/types";

export interface CartProductItem {
  product: ProductData;
  quantity: number;
  lineTotal: number;
}

export default function useCartProducts(enabled = true) {
  const cartItems = useSelector((state: RootState) => selectCartItems(state));
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const productIdsKey = cartItems.map((item) => item.id).join("|");

  useEffect(() => {
    if (!enabled) return;
    if (cartItems.length === 0) {
      Promise.resolve().then(() => {
        setProducts([]);
        setIsLoading(false);
      });
      return;
    }

    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setIsLoading(true);

      fetch("/api/products", { credentials: "include", signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch cart products");
          return response.json() as Promise<ProductData[]>;
        })
        .then((data) => setProducts(data))
        .catch((error) => {
          if (!controller.signal.aborted) {
            console.error("Cart products error:", error);
            setProducts([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    });

    return () => controller.abort();
  }, [enabled, cartItems.length, productIdsKey]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const items = useMemo(
    () =>
      cartItems.reduce<CartProductItem[]>((acc, item: CartItem) => {
        const product = productMap.get(item.id);
        if (product) {
          acc.push({
            product,
            quantity: item.quantity,
            lineTotal: product.price * item.quantity,
          });
        }
        return acc;
      }, []),
    [cartItems, productMap]
  );

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  return { items, itemCount, subtotal, isLoading, rawItems: cartItems };
}
