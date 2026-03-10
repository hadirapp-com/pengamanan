import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { useQueryService } from "@/lib/react-query";

import { Header } from "@/components/ui/layout/header";
import { Sidebar } from "@/components/ui/layout/sidebar";
import TableSkeleton from "@/components/ui/fallback-skeleton/table-skeleton";

import { useAuthStore } from "@/store/auth";

import { authEndpoint } from "@/config/endpoints";
import { authRoutes } from "@/config/routes";

export default function AppTemplate() {
  const location = useLocation();
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

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <div className="flex w-full flex-1 h-[calc(100vh-6rem)]">
        <Sidebar />
        <main className="flex-1 w-full overflow-auto">
          <Suspense fallback={<TableSkeleton />} key={location.key}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {/* Hadirapp Signature Footer */}
      <footer className="h-8 border-t bg-muted/50 flex items-center justify-end px-4 text-xs text-muted-foreground">
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
