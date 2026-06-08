"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import CartIcon from "@/components/icons/CartIcon";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import LockIcon from "@/components/icons/LockIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import CheckIcon from "@/components/icons/CheckIcon";
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
import styles from "./CartPage.module.css";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, itemCount, subtotal, isLoading } = useCartProducts(true);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  if (isLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.layout}>
          <div className={styles.card}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonRow}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            ))}
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLineShort} />
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.emptyCard}>
        <span className={styles.emptyIcon}>
          <CartIcon size={56} />
        </span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/" className={styles.primaryBtn}>
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Cart</span>
      </nav>

      <h2 className={styles.title}>Your Cart</h2>

      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col" className={styles.right}>Price</th>
                    <th scope="col" className={styles.center}>Quantity</th>
                    <th scope="col" className={styles.right}>Total</th>
                    <th scope="col" className={styles.right}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ product, quantity, lineTotal }) => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productCell}>
                          <div className={styles.avatar}>{product.name.charAt(0)}</div>
                          <div>
                            <span className={styles.name}>{product.name}</span>
                            <span className={styles.stock}>In Stock</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.right}>{formatCurrency(product.price)}</td>
                      <td className={styles.center}>
                        <QuantityStepper
                          quantity={quantity}
                          onDecrement={() => dispatch(decrementQuantity(product.id))}
                          onIncrement={() => dispatch(incrementQuantity(product.id))}
                          ariaLabel={`Quantity for ${product.name}`}
                        />
                      </td>
                      <td className={styles.right}>{formatCurrency(lineTotal)}</td>
                      <td className={styles.right}>
                        <button
                          className={styles.removeBtn}
                          onClick={() => dispatch(removeFromCart(product.id))}
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Link href="/" className={styles.continueBtn}>
            <ChevronLeftIcon size={16} />
            Continue Shopping
          </Link>
        </div>

        <aside className={styles.summaryCard} aria-label="Order summary">
          <h3>Order Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax (10%)</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button type="button" className={styles.checkoutBtn}>
            Checkout
          </button>
          <div className={styles.assurance}>
            <span>
              <LockIcon />
              Secure Checkout
            </span>
            <span>
              <CheckIcon size={18} />
              30-day return policy
            </span>
            <span>{itemCount} item{itemCount === 1 ? "" : "s"} in cart</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

