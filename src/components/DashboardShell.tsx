"use client";

import { useState, useEffect, useRef } from "react";
import { logoutAction } from "@/app/login/actions";
import UserIcon from "@/components/icons/UserIcon";
import styles from "./DashboardShell.module.css";

interface DashboardShellProps {
  username: string;
  children: React.ReactNode;
}

export default function DashboardShell({ username, children }: DashboardShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.logo}>StockMate</h1>
          <div className={styles.user} ref={menuRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <UserIcon />
            </button>
            {isOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>{username}</div>
                <button
                  className={styles.dropdownItem}
                  onClick={() => setIsOpen(false)}
                >
                  About
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => logoutAction()}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
