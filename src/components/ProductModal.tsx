"use client";

import React, { useState } from "react";
import CloseIcon from "@/components/icons/CloseIcon";
import type { ProductData } from "@/lib/types";
import styles from "./ProductModal.module.css";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<ProductData, "id">) => Promise<void>;
  product: ProductData | null;
}

const ProductModalForm: React.FC<Omit<ProductModalProps, "open">> = ({
  onClose,
  onSubmit,
  product,
}) => {
  const [name, setName] = useState(product ? product.name : "");
  const [category, setCategory] = useState(product ? product.category : "");
  const [quantity, setQuantity] = useState(
    product ? product.quantity.toString() : ""
  );
  const [price, setPrice] = useState(product ? product.price.toString() : "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    const prc = Number(price);

    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    if (!Number.isInteger(qty) || qty < 0) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }
    if (!Number.isFinite(prc) || prc < 0) {
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
    <div className={styles.backdrop} onClick={() => !isSaving && onClose()}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className={styles.header}>
          <h3 id="product-modal-title" className={styles.title}>
            {product ? "Edit Product" : "Add Product"}
          </h3>
          <button aria-label="Close product modal" className={styles.closeBtn} onClick={() => !isSaving && onClose()} type="button" disabled={isSaving} aria-disabled={isSaving}>
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="product-name" className={styles.label}>Name</label>
            <input
             id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Product name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="product-category" className={styles.label}>Category</label>
            <input
              id="product-category"
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
              <label htmlFor="product-quantity" className={styles.label}>Quantity</label>
              <input
                id="product-quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={styles.input}
                placeholder="0"
                min={0}
                step={1}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="product-price" className={styles.label}>Price</label>
              <input
               id="product-price"
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
              onClick={() => !isSaving && onClose()}
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

const ProductModal: React.FC<ProductModalProps> = (props) => {
  if (!props.open) return null;
  return <ProductModalForm key={props.product?.id ?? "new"} {...props} />;
};

export default ProductModal;
