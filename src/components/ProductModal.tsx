"use client";

import React, { useState, useEffect } from "react";
import CloseIcon from "@/components/icons/CloseIcon";
import type { ProductData } from "@/lib/types";
import styles from "./ProductModal.module.css";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<ProductData, "id">) => Promise<void>;
  product: ProductData | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSubmit,
  product,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setCategory(product.category);
        setQuantity(product.quantity.toString());
        setPrice(product.price.toString());
      } else {
        setName("");
        setCategory("");
        setQuantity("");
        setPrice("");
      }
      setError(null);
      setIsSaving(false);
    }
  }, [open, product]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseInt(quantity, 10);
    const prc = parseFloat(price);

    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    if (Number.isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative number.");
      return;
    }
    if (Number.isNaN(prc) || prc < 0) {
      setError("Price must be a non-negative number.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), category: category.trim(), quantity: qty, price: prc });
      onClose();
    } catch {
      setError("Failed to save product. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {product ? "Edit Product" : "Add Product"}
          </h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Product name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
              placeholder="Category"
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={styles.input}
                placeholder="0"
                min={0}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.input}
                placeholder="0.00"
                min={0}
                step="0.01"
                required
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
