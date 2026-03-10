"use client";

import { Button } from "@/components/ui/button";
import { UserIcon, Calendar, Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const authStore = useAuthStore();
  const user = authStore.getProfile();
  const [isOpen, setIsOpen] = useState(false);
  const { setIsMobileOpen } = useSidebarStore();

  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMM dd, yyyy");

  const getUserInitials = (name?: string | null) => {
    if (!name) return user?.username?.charAt(0).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="flex h-16 items-center border-b bg-card px-4 sm:px-6 w-full relative">
      {/* Mobile: Menu button + Logo */}
      <div className="flex items-center gap-2 flex-1 lg:flex-none">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <img src="/logo.png" className="h-8 sm:h-10" alt="Logo" />
      </div>

      {/* Desktop: Title next to logo */}
      {title && (
        <h1 className="text-xl font-semibold ml-4 hidden lg:block">{title}</h1>
      )}

      <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
        {/* User Profile */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-2 sm:px-3 py-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getUserInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              {/* User Header */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                    {getUserInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {user?.fullName || user?.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{user?.username}
                  </p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Role:</span>{" "}
                    {user?.role ? formatRole(user.role) : "N/A"}
                  </span>
                </div>

                {user?.email && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 text-muted-foreground">📧</div>
                    <span className="text-sm">
                      <span className="font-medium">Email:</span> {user.email}
                    </span>
                  </div>
                )}

                {user?.nik && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 text-muted-foreground">🆔</div>
                    <span className="text-sm">
                      <span className="font-medium">NIK:</span> {user.nik}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Member since:</span>{" "}
                    {user?.createdAt
                      ? format(new Date(user.createdAt), "MMM dd, yyyy")
                      : formattedDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    authStore.logout();
                    window.location.href = "/login";
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
