"use client";

import { useState, useActionState } from "react";
import { loginAction } from "./actions";
import styles from "./page.module.css";
import UserIcon from "@/components/icons/UserIcon";
import LockIcon from "@/components/icons/LockIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import EyeOffIcon from "@/components/icons/EyeOffIcon";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>Welcome Back!!</h1>

      <form className={styles.form} action={formAction}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Username</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <UserIcon />
            </span>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Password</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <LockIcon />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={isPending}
        >
          {isPending ? "Logging in..." : "Login"}
        </button>

        {state?.error && <p className={styles.error}>{state.error}</p>}
      </form>
    </div>
  );
}
