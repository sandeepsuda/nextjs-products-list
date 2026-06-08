"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import CartIcon from "@/components/icons/CartIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import useCartProducts from "@/hooks/useCartProducts";
import { removeFromCart } from "@/store/cartSlice";
import { formatCurrency } from "@/lib/helpers/cartHelpers";
import styles from "./CartDropdown.module.css";

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawer: () => void;
}

export default function CartDropdown({ isOpen, onClose, onOpenDrawer }: CartDropdownProps) {
  const dispatch = useDispatch();
  const { items, itemCount, subtotal, isLoading } = useCartProducts(isOpen);

  if (!isOpen) return null;

  return (
    <div className={styles.dropdown} role="dialog" aria-label="Cart preview">
      <div className={styles.header}>
        <span>Your Cart ({itemCount})</span>
        <Link href="/cart" className={styles.headerLink} onClick={onClose}>
          View Cart
        </Link>
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
            <CartIcon size={34} />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {items.slice(0, 4).map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className={styles.item}>
                <div className={styles.avatar}>{product.name.charAt(0)}</div>
                <div className={styles.info}>
                  <span className={styles.name}>{product.name}</span>
                  <span className={styles.meta}>Qty: {quantity}</span>
                </div>
                <div className={styles.right}>
                  <span className={styles.price}>{formatCurrency(lineTotal)}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => dispatch(removeFromCart(product.id))}
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal ({itemCount} items)</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <button
            type="button"
            className={styles.drawerBtn}
            onClick={() => {
              onClose();
              onOpenDrawer();
            }}
          >
            Review Cart
          </button>
          <Link href="/cart" className={styles.cartLink} onClick={onClose}>
            Go to Cart
          </Link>
        </div>
      )}
    </div>
  );
}

