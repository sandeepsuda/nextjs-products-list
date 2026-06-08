import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import CartPage from "@/components/CartPage";

export default async function CartRoute() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell username={session.username}>
      <CartPage />
    </DashboardShell>
  );
}

