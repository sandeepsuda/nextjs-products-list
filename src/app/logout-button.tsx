"use client";

import { logoutAction } from "./login/actions";
import styles from "./page.module.css";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className={styles.secondary}
      style={{
        background: "transparent",
        border: "1px solid var(--button-secondary-border)",
        padding: "0.5rem 1rem",
        borderRadius: "128px",
        cursor: "pointer",
        color: "inherit",
      }}
    >
      Log Out
    </button>
  );
}
