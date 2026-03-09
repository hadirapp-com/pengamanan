"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  BarChart3,
  LogOut,
  Menu,
  History,
  X,
  ChevronDown,
  ChevronRight,
  Package,
  Dot,
  Printer,
  SquareUser,
  Tag,
  ShieldCheck,
  MonitorCheck,
  Settings,
  Truck,
  Video,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";

const allMenu = [
  {
    name: "Dashboard",
    href: "/app",
    icon: BarChart3,
    hasChildren: false,
  },
  {
    name: "Master Data Label",
    href: "/app/parts",
    icon: Tag,
    hasChildren: true,
    children: [
      {
        name: "Parts",
        href: "/app/parts",
        icon: Package,
      },
      {
        name: "Print History",
        href: "/app/parts-print-history",
        icon: Printer,
      },
    ],
  },
  {
    name: "Master Data Pokayoke",
    href: "/app/delivery",
    icon: ShieldCheck,
    hasChildren: true,
    children: [
      {
        name: "HPM",
        href: "/app/delivery/HPM",
        icon: Package,
      },
      {
        name: "MMKI",
        href: "/app/delivery/MMKI",
        icon: Package,
      },
    ],
  },
  {
    name: "Log Scanner",
    href: "/app/logs",
    icon: History,
    hasChildren: true,
    children: [
      {
        name: "HPM",
        href: "/app/logs/HPM",
        icon: History,
      },
      {
        name: "MMKI",
        href: "/app/logs/MMKI",
        icon: History,
      },
    ],
  },
  {
    name: "Scan Monitoring",
    href: "/app/scan-monitoring",
    icon: MonitorCheck,
    hasChildren: false,
  },
  {
    name: "Delivery Order",
    href: "/app/delivery-order",
    icon: Truck,
    hasChildren: true,
    children: [
      {
        name: "HPM",
        href: "/app/delivery-order/HPM",
        icon: Truck,
      },
      {
        name: "MMKI",
        href: "/app/delivery-order/MMKI",
        icon: Truck,
      },
    ],
  },
  {
    name: "Customer",
    href: "/app/customer",
    icon: SquareUser,
    hasChildren: false,
  },
  {
    name: "Config",
    href: "/app/config",
    icon: Settings,
    hasChildren: false,
  },
  {
    name: "WhatsApp",
    href: "/app/whatsapp",
    icon: MessageCircle,
    hasChildren: false,
  },
  {
    name: "User",
    href: "/app/user",
    icon: Users,
    hasChildren: false,
  },
  {
    name: "User Guide",
    href: "/app/user-guide",
    icon: Video,
    hasChildren: false,
  },
];

export function Sidebar() {
  const location = useLocation();
  const authStore = useAuthStore();
  const { logout } = authStore;
  const user = authStore.getProfile();
  const [navigation, setNavigation] = useState<typeof allMenu>([]);
  const {
    expandedMenus,
    isCollapsed,
    isMobile,
    isMobileOpen,
    toggleMenu,
    collapseMenu,
    expandMenu,
    setIsCollapsed,
    setIsMobile,
    setIsMobileOpen,
  } = useSidebarStore();

  useEffect(() => {
    if (user?.role) {
      if (user?.role === "production") {
        const data = allMenu.filter(
          (item) => item.name === "Master Data Label" || item.name === "Dashboard" || item.name === "User Guide",
        );
        setNavigation(data);
      } else {
        // For admin, show all menus (including WhatsApp)
        setNavigation(allMenu);
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

  // Auto-expand parent menus when child is active on page load
  useEffect(() => {
    const activeParentMenus = navigation
      .filter((item) => item.hasChildren && isChildActive(item.children))
      .map((item) => item.name);

    // Only expand menus that aren't already expanded
    activeParentMenus.forEach((menuName) => {
      if (!expandedMenus.includes(menuName)) {
        expandMenu(menuName);
      }
    });
  }, [location.pathname, expandedMenus, expandMenu]);

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

  const isMenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName);
  };

  const isChildActive = (children: any[] | undefined) => {
    if (!children) return false;
    return children.some(
      (child) =>
        location.pathname === child.href ||
        location.pathname.startsWith(child.href + "/"),
    );
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
            <h6 className="text-xl font-bold">Admin Pokayoke</h6>
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
              if (!item.hasChildren) {
                let isActive = location.pathname === item.href;
                const splittedPath = location.pathname.split("/").slice(1);
                if (!isActive && splittedPath.length >= 4) {
                  isActive =
                    `/${splittedPath.slice(0, -1).join("/")}` === item.href;
                }
                if (!isActive && splittedPath.length >= 3) {
                  isActive =
                    `/${splittedPath.slice(0, -1).join("/")}` === item.href;
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileSidebar}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn("w-full justify-start")}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              }

              // Handle items with children
              const hasActiveChild = isChildActive(item.children);
              const expanded = isMenuExpanded(item.name);

              return (
                <div key={item.name} className="space-y-1">
                  <Button
                    variant={hasActiveChild ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => toggleMenu(item.name)}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </div>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {expanded && item.children && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const isActive =
                          location.pathname === child.href ||
                          location.pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            onClick={() => {
                              closeMobileSidebar();
                              collapseMenu(item.name);
                            }}
                          >
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                            >
                              {child.name}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
            <h6 className="text-xl font-bold">Admin Pokayoke</h6>
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
            if (!item.hasChildren) {
              let isActive = location.pathname === item.href;
              const splittedPath = location.pathname.split("/").slice(1);
              if (!isActive && splittedPath.length >= 4) {
                isActive =
                  `/${splittedPath.slice(0, -1).join("/")}` === item.href;
              }
              if (!isActive && splittedPath.length >= 3) {
                isActive =
                  `/${splittedPath.slice(0, -1).join("/")}` === item.href;
              }
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2",
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn("h-4 w-4", !isCollapsed && "mr-3")}
                    />
                    {!isCollapsed && item.name}
                  </Button>
                </Link>
              );
            }

            // Handle items with children
            const hasActiveChild = isChildActive(item.children);
            const expanded = isMenuExpanded(item.name);

            if (isCollapsed) {
              // In collapsed mode, show a tooltip with children
              return (
                <div key={item.name} className="relative group">
                  <Button
                    variant={hasActiveChild ? "default" : "ghost"}
                    className="w-full justify-center px-2"
                    title={item.name}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>

                  {/* Tooltip submenu for collapsed sidebar */}
                  <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                    <div className="bg-popover border border-border rounded-md shadow-lg p-2 min-w-[200px]">
                      <div className="font-medium text-sm mb-2 px-2">
                        {item.name}
                      </div>
                      <div className="space-y-1">
                        {item.children?.map((child) => {
                          const isActive =
                            location.pathname === child.href ||
                            location.pathname.startsWith(child.href + "/");
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => collapseMenu(item.name)}
                            >
                              <Button
                                variant={isActive ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                              >
                                {child.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.name} className="space-y-1">
                <Button
                  variant={hasActiveChild ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => toggleMenu(item.name)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-5 h-4 w-4" />
                    {item.name}
                  </div>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {expanded && item.children && (
                  <div className="ml-4">
                    {item.children.map((child) => {
                      const isActive =
                        location.pathname === child.href ||
                        location.pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={() => collapseMenu(item.name)}
                        >
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                          >
                            <Dot className="h-4 w-4" />
                            {child.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
