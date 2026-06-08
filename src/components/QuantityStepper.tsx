"use client";

import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  ariaLabel: string;
}

export default function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  ariaLabel,
}: QuantityStepperProps) {
  return (
    <div className={styles.stepper} aria-label={ariaLabel}>
      <button type="button" className={styles.stepBtn} onClick={onDecrement} aria-label="Decrease quantity">
        <MinusIcon size={14} />
      </button>
      <span className={styles.quantity}>{quantity}</span>
      <button type="button" className={styles.stepBtn} onClick={onIncrement} aria-label="Increase quantity">
        <PlusIcon size={14} />
      </button>
    </div>
  );
}

