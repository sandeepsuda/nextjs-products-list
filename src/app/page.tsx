import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import styles from "./page.module.css";
import LogoutButton from "./logout-button";

export default async function Dashboard() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Hello {session.username}!</h1>
          <p>Welcome to your products list dashboard.</p>
          <div className={styles.ctas}>
            <LogoutButton />
          </div>
        </div>
      </main>
    </div>
  );
}
