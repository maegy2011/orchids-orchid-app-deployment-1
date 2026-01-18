import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient />;
}
