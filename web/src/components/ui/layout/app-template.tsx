import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { useQueryService } from "@/lib/react-query";

import { Header } from "@/components/ui/layout/header";
import { Sidebar } from "@/components/ui/layout/sidebar";
import TableSkeleton from "@/components/ui/fallback-skeleton/table-skeleton";

import { useAuthStore } from "@/store/auth";

import { authEndpoint } from "@/config/endpoints";
import { authRoutes } from "@/config/routes";

export function AppTemplate() {
  const location = useLocation();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const { isError, data, isSuccess } = useQueryService(authEndpoint.me);

  useEffect(() => {
    if (isError === true) navigate(authRoutes.login);
  }, [isError, navigate]);

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  // Don't render until store is hydrated
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <div className="flex w-full flex-1 h-[calc(100vh-6rem)]">
        <Sidebar />
        <main className="flex-1 w-full overflow-auto p-4 sm:p-6 md:p-6 lg:p-8 lg:px-8 xl:px-12 2xl:px-16">
          <Suspense fallback={<TableSkeleton />} key={location.key}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {/* Hadirapp Signature Footer */}
      <footer className="h-8 border-t bg-muted/50 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <span className="font-medium">v{import.meta.env.PACKAGE_VERSION || "1.0.0"}</span>
        <span>
          Supported by{" "}
          <a
            href="http://www.hadirapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            hadirapp.com
          </a>
        </span>
      </footer>
    </div>
  );
}
