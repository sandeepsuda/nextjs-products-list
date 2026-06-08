"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFavouriteIds, toggleFavourite } from "@/store/favouritesSlice";
import type { RootState } from "@/store/store";
import type { ProductData } from "@/lib/types";
import HeartIcon from "@/components/icons/HeartIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import { getStatus } from "@/lib/helpers/productHelpers";
import styles from "./FavouritesDrawer.module.css";

interface FavouritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavouritesDrawer({ isOpen, onClose }: FavouritesDrawerProps) {
  const dispatch = useDispatch();
  const favouriteIds = useSelector((state: RootState) => selectFavouriteIds(state));
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch all products and filter by favouriteIds whenever drawer opens or ids change
  useEffect(() => {
    if (!isOpen) return;
    if (favouriteIds.length === 0) { setProducts([]); return; }
    setIsLoading(true);
    fetch("/api/products", { credentials: "include" })
      .then((r) => r.json())
      .then((all: ProductData[]) => setProducts(all.filter((p) => favouriteIds.includes(p.id))))
      .finally(() => setIsLoading(false));
  }, [isOpen, favouriteIds]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className={styles.backdrop} aria-hidden="true" />}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-label="Favourites"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <HeartIcon size={18} filled />
            <span className={styles.title}>Favourites</span>
            {favouriteIds.length > 0 && (
              <span className={styles.count}>{favouriteIds.length}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close favourites">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonItem}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} style={{ width: "60%" }} />
                  <div className={styles.skeletonLine} style={{ width: "40%" }} />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <HeartIcon size={40} />
              <p className={styles.emptyText}>No favourites yet.</p>
              <p className={styles.emptyHint}>Tap the heart on any product to save it here.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {products.map((product) => {
                const status = getStatus(product.quantity);
                const statusClass =
                  status.class === "status-low" ? styles.low
                  : status.class === "status-med" ? styles.med
                  : styles.high;
                return (
                  <li key={product.id} className={styles.item}>
                    <div className={styles.avatar}>{product.name.charAt(0)}</div>
                    <div className={styles.info}>
                      <span className={styles.name}>{product.name}</span>
                      <span className={styles.meta}>
                        {product.category} · <span className={`${styles.chip} ${statusClass}`}>{status.label}</span>
                      </span>
                    </div>
                    <div className={styles.right}>
                      <span className={styles.price}>
                        ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => dispatch(toggleFavourite(product.id))}
                        title="Remove from favourites"
                        aria-label={`Remove ${product.name} from favourites`}
                      >
                        <HeartIcon size={16} filled />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
