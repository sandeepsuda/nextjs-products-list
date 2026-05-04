import LoginForm from "./login-form";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <LoginForm />
      </div>
      <div className={styles.archSection}>
        <div className={styles.arch} />
      </div>
    </div>
  );
}
