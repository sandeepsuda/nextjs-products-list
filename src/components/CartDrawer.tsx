"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import CartIcon from "@/components/icons/CartIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import QuantityStepper from "@/components/QuantityStepper";
import useCartProducts from "@/hooks/useCartProducts";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/store/cartSlice";
import {
  calculateTax,
  calculateTotal,
  formatCurrency,
} from "@/lib/helpers/cartHelpers";
import styles from "./CartDrawer.module.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { items, itemCount, subtotal, isLoading } = useCartProducts(isOpen);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className={styles.backdrop} aria-hidden="true" />}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-label="Cart"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <CartIcon size={18} />
            <span className={styles.title}>Your Cart ({itemCount})</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonItem}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <CartIcon size={48} />
              </span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven&apos;t added anything yet.</p>
              <Link href="/" className={styles.browseBtn} onClick={onClose}>
                Browse Products
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map(({ product, quantity }) => (
                <li key={product.id} className={styles.item}>
                  <div className={styles.avatar}>{product.name.charAt(0)}</div>
                  <div className={styles.info}>
                    <span className={styles.name}>{product.name}</span>
                    <span className={styles.price}>{formatCurrency(product.price)}</span>
                  </div>
                  <QuantityStepper
                    quantity={quantity}
                    onDecrement={() => dispatch(decrementQuantity(product.id))}
                    onIncrement={() => dispatch(incrementQuantity(product.id))}
                    ariaLabel={`Quantity for ${product.name}`}
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => dispatch(removeFromCart(product.id))}
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax (10%)</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button type="button" className={styles.checkoutBtn}>
              Checkout
            </button>
            <Link href="/cart" className={styles.viewCartBtn} onClick={onClose}>
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

