import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import ProductsPage from "@/components/ProductsPage";

export default async function Dashboard() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell username={session.username}>
      <ProductsPage />
    </DashboardShell>
  );
}
