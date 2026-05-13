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
    let previousProducts: ProductData[] = [];

    setProducts((currentProducts) => {
      previousProducts = currentProducts;
      return currentProducts.filter((p) => p.id !== id);
    });

    fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product");
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setProducts(previousProducts);
      });
  }, []);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    const url = buildUrl(search, status, sort, order);

    try {
      const response = await fetch(url, { credentials: "include", signal });
      if (!response.ok) {
        let errorMessage = `Server responded with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Fallback to default message if JSON parsing fails
        }
        throw new Error(errorMessage);
      }
      const data: ProductData[] = await response.json();
      if (signal?.aborted) return;
      setProducts(data);
      setIsLoading(false);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Failed to fetch products", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, [search, status, sort, order]);

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

        await response.json();
        await fetchProducts();
      } catch (err) {
        console.error("Add product error:", err);
        throw err;
      }
    },
    [fetchProducts]
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

        await response.json();
        await fetchProducts();
      } catch (err) {
        console.error("Update product error:", err);
        throw err;
      }
    },
    [fetchProducts]
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => fetchProducts(controller.signal));
    return () => controller.abort();
  }, [fetchProducts]);

  return { products, isLoading, error, deleteProduct, addProduct, updateProduct };
};

export default useProducts;
