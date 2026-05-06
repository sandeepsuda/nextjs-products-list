"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProductData } from "@/lib/types";

interface UseProductsParams {
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
}

interface UseProductsResult {
  products: ProductData[];
  isLoading: boolean;
  error: string | null;
  deleteProduct: (id: string) => void;
  addProduct: (product: Omit<ProductData, "id">) => Promise<void>;
  updateProduct: (id: string, product: Omit<ProductData, "id">) => Promise<void>;
}

const buildUrl = (search?: string, status?: string, sort?: string, order?: string) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (status && status !== "all") queryParams.append("status", status);
  if (sort) queryParams.append("sort", sort);
  if (order) queryParams.append("order", order);
  const queryString = queryParams.toString();
  return queryString ? `/api/products?${queryString}` : "/api/products";
};

const useProducts = (params: UseProductsParams = {}): UseProductsResult => {
  const { search, status, sort, order } = params;

  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback((id: string) => {
    setProducts((currentProducts) => currentProducts.filter((p) => p.id !== id));

    fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product");
      })
      .catch((err) => {
        console.error("Delete error:", err);
        window.location.reload();
      });
  }, []);

  const addProduct = useCallback(
    async (newProductData: Omit<ProductData, "id">) => {
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProductData),
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to add product");

        const savedProduct = await response.json();
        setProducts((prev) => [savedProduct, ...prev]);
      } catch (err) {
        console.error("Add product error:", err);
        throw err;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, updatedData: Omit<ProductData, "id">) => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to update product");

        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
      } catch (err) {
        console.error("Update product error:", err);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const url = buildUrl(search, status, sort, order);

    fetch(url, { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
      })
      .then((data: ProductData[]) => {
        if (!active) return;
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error("Failed to fetch products", err);
        setError(err.message ?? "Unknown error");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, sort, order]);

  return { products, isLoading, error, deleteProduct, addProduct, updateProduct };
};

export default useProducts;
