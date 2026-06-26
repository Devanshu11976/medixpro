"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Pill,
  Boxes,
  ShoppingCart,
  Building2,
  FileText,
  Zap,
  Bell,
  Activity,
  Settings,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isMobileOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("staff");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("medixpro_user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      try {
        const session = JSON.parse(storedUser);
        const userRole = (session.role || "staff").toLowerCase();
        setRole(userRole);

        const updateCounts = () => {
          const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");

          if (localStorage.getItem("medixpro_access_token")) {
            if (userRole === "admin") {
              api.get("/api/admin/retailers/pending")
                .then((res) => {
                  if (Array.isArray(res.data)) {
                    setPendingCount(res.data.length);
                  }
                })
                .catch((err) => console.error("Failed to load pending retailers count: ", err));
            }

            api.get("/api/notifications")
              .then((res) => {
                if (Array.isArray(res.data)) {
                  const unread = res.data.filter((n: any) => !readIds.includes(n.id)).length;
                  setUnreadNotificationsCount(unread);
                } else {
                  setUnreadNotificationsCount(0);
                }
              })
              .catch((err) => {
                console.error("Failed to load notifications count: ", err);
                setUnreadNotificationsCount(0);
              });
          } else {
            setUnreadNotificationsCount(0);
          }
        };

        updateCounts();

        window.addEventListener("notifications-updated", updateCounts);
        const cleanupListener = () => {
          window.removeEventListener("notifications-updated", updateCounts);
        };

        // Enforce route-level authorization
        const path = window.location.pathname;
        
        if (session.status === "PENDING") {
          if (path !== "/login" && path !== "/login/complete-profile") {
            router.push("/login");
            cleanupListener();
            return;
          }
        }

        if (userRole === "staff" || userRole === "worker") {
          const adminOnlyPaths = [
            "/admin/dashboard",
            "/admin/retailers",
            "/admin/invoices",
            "/admin/reports",
            "/admin/activity",
            "/admin/settings"
          ];
          if (adminOnlyPaths.some(p => path.startsWith(p)) || path.startsWith("/retailer")) {
            router.push("/dashboard");
            cleanupListener();
            return;
          }
        } else if (userRole === "retailer") {
          if (!path.startsWith("/retailer")) {
            router.push("/retailer-home");
            cleanupListener();
            return;
          }
        } else if (userRole === "admin") {
          if (path.startsWith("/dashboard") || path.startsWith("/retailer") || path === "/") {
            router.push("/admin/dashboard");
            cleanupListener();
            return;
          }
        }

        return cleanupListener;
      } catch (err) {
        localStorage.removeItem("medixpro_user");
        localStorage.removeItem("medixpro_role");
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("medixpro_role");
    localStorage.removeItem("medixpro_user");
    router.push("/login");
  };

  // Determine navigation based on role
  const navigation: NavItem[] = [];

  if (role === "admin") {
    navigation.push(
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Medicines", href: "/admin/medicines", icon: Pill },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Retailers", href: "/admin/retailers", icon: Building2 },
      { label: "Invoices", href: "/admin/invoices", icon: FileText },
      { label: "Quick Billing", href: "/admin/billing", icon: Zap },
      { label: "Reports", href: "/admin/reports", icon: Activity },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Activity Logs", href: "/admin/activity", icon: Activity }
    );
  } else if (role === "retailer") {
    navigation.push(
      { label: "Shop Medicines", href: "/retailer-home", icon: Pill },
      { label: "Shopping Cart", href: "/retailer-cart", icon: ShoppingCart },
      { label: "My Purchases", href: "/retailer-purchases", icon: FileText }
    );
  } else {
    // Staff/Operator
    navigation.push(
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Medicines", href: "/admin/medicines", icon: Pill },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Quick Billing", href: "/admin/billing", icon: Zap },
      { label: "Notifications", href: "/admin/notifications", icon: Bell }
    );
  }

  const settingsHref = role === "admin" ? "/admin/settings" : "/dashboard/settings";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300",
          "lg:flex lg:translate-x-0",
          isMobileOpen ? "flex translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Fixed Top Section: Logo + Search */}
        <div className="shrink-0 border-b border-slate-800">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">MedixPro</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search..."
                className="h-9 w-full rounded-lg border-slate-700 bg-slate-800 pl-9 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Middle Section: Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.label === "Retailers" && pendingCount > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                    {item.label === "Notifications" && unreadNotificationsCount > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Fixed Bottom Section: Settings + Logout */}
        <div className="shrink-0 border-t border-slate-800 p-3 space-y-1">
          <Link
            href={settingsHref}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
              pathname === settingsHref
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            )}
          >
            {pathname === settingsHref && (
              <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
            )}
            <Settings className="h-[18px] w-[18px] shrink-0" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-600/10 hover:text-red-400 hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Logout
          </button>
          <div className="pt-2.5 mt-2 border-t border-slate-800/60 text-center">
            <span className="text-[10.5px] text-slate-500 font-medium tracking-wide">
              Made with <span className="text-rose-500 animate-pulse inline-block">❤️</span> by <span className="text-slate-400 hover:text-blue-400 transition-colors duration-200 font-semibold cursor-default">Devanshu Sharma</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
