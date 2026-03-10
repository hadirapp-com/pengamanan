"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  MapPin,
  QrCode,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { superadminMenus, adminMenus } from "@/config/constants";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  MapPin,
  QrCode,
  Bell,
  ScrollText,
};

export function Sidebar() {
  const location = useLocation();
  const authStore = useAuthStore();
  const { logout } = authStore;
  const user = authStore.getProfile();
  const [navigation, setNavigation] = useState<(typeof superadminMenus | typeof adminMenus)>([] as any);
  const {
    isCollapsed,
    isMobile,
    isMobileOpen,
    setIsCollapsed,
    setIsMobile,
    setIsMobileOpen,
  } = useSidebarStore();

  useEffect(() => {
    if (user?.role) {
      if (user?.role === "superadmin") {
        setNavigation(superadminMenus);
      } else {
        setNavigation(adminMenus);
      }
    }
  }, [user]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile, setIsCollapsed]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Mobile overlay
  if (isMobile && isMobileOpen) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />

        {/* Mobile Sidebar */}
        <div className="fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <h6 className="text-xl font-bold">Pengamanan</h6>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileSidebar}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex flex-col space-y-1 p-4">
            {navigation.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive = location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={closeMobileSidebar}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("w-full justify-start")}
                    disabled={item.disabled}
                  >
                    {IconComponent && <IconComponent className="mr-3 h-4 w-4" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "flex h-full flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          "hidden lg:flex",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          {!isCollapsed && (
            <h6 className="text-xl font-bold">Pengamanan</h6>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-col space-y-1 p-4">
          {navigation.map((item) => {
            const IconComponent = iconMap[item.icon];
            const isActive = location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");

            return (
              <Link key={item.title} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2",
                  )}
                  title={isCollapsed ? item.label : undefined}
                  disabled={item.disabled}
                >
                  {IconComponent && (
                    <IconComponent
                      className={cn("h-4 w-4", !isCollapsed && "mr-3")}
                    />
                  )}
                  {!isCollapsed && item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 mt-auto">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed && "justify-center px-2",
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </>
  );
}
