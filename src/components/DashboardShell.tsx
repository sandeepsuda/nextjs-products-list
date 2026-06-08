"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { logoutAction } from "@/app/login/actions";
import UserIcon from "@/components/icons/UserIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import FavouritesDrawer from "@/components/FavouritesDrawer";
import { selectFavouriteIds } from "@/store/favouritesSlice";
import styles from "./DashboardShell.module.css";

interface DashboardShellProps {
  username: string;
  children: React.ReactNode;
}

export default function DashboardShell({ username, children }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const favouriteIds = useSelector(selectFavouriteIds);
  const favouriteCount = favouriteIds.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.logo}>StockMate</h1>
          <div className={styles.user} ref={menuRef}>
            <div className={styles.heartWrap}>
              <button
                className={styles.profileBtn}
                onClick={() => setDrawerOpen(true)}
                aria-label={`Open favourites${favouriteCount > 0 ? `, ${favouriteCount} saved` : ""}`}
              >
                <HeartIcon size={16} filled={favouriteCount > 0} />
              </button>
              {favouriteCount > 0 && (
                <span className={styles.badge}>{favouriteCount}</span>
              )}
            </div>
            <button
              className={styles.profileBtn}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <UserIcon />
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>{username}</div>
                <button className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  About
                </button>
                <button className={styles.dropdownItem} onClick={() => logoutAction()}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <FavouritesDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
