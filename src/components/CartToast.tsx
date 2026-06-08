"use client";

import { useEffect } from "react";
import Link from "next/link";
import CheckIcon from "@/components/icons/CheckIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import styles from "./CartToast.module.css";

interface CartToastProps {
  productName: string;
  onClose: () => void;
}

export default function CartToast({ productName, onClose }: CartToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.icon}>
        <CheckIcon size={16} />
      </span>
      <span className={styles.message}>{productName} added to cart.</span>
      <Link href="/cart" className={styles.link}>
        View Cart
      </Link>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss cart notification">
        <CloseIcon size={16} />
      </button>
    </div>
  );
}

