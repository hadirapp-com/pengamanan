import { useAuthStore } from "@/store/auth";
import { ProductionDashboard } from "./dashboard/production-dashboard";
import { AdminDashboard } from "./dashboard/admin-dashboard";

export default function Dashboard() {
  const authStore = useAuthStore();
  const user = authStore.getProfile();
  const userRole = user?.role;

  // Show production dashboard for production role, admin dashboard for others
  if (userRole === "production") {
    return <ProductionDashboard />;
  }

  return <AdminDashboard />;
}
