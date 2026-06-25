"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { StockUpdatesTable } from "@/components/dashboard/stock-updates-table";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { ExpiringMedicinesWidget } from "@/components/dashboard/expiring-medicines-widget";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { statCards, type StatCard } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

// Staff-only stat icons mapping
const ICONS = {
  orders: ShoppingCart,
  medicines: Package,
  stock: AlertTriangle,
  expiring: Clock,
  added: PlusCircle,
};

const COLOR_CLASSES = {
  blue: { bg: "bg-blue-50", fg: "text-blue-700", chip: "bg-blue-100", border: "border-blue-200" },
  green: { bg: "bg-green-50", fg: "text-green-700", chip: "bg-green-100", border: "border-green-200" },
  orange: { bg: "bg-orange-50", fg: "text-orange-700", chip: "bg-orange-100", border: "border-orange-200" },
  red: { bg: "bg-red-50", fg: "text-red-700", chip: "bg-red-100", border: "border-red-200" },
  purple: { bg: "bg-purple-50", fg: "text-purple-700", chip: "bg-purple-100", border: "border-purple-200" },
};

export default function StaffDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter out financial stats for staff view
  const staffStats = statCards.filter(
    (card) => !["today-sales", "retailers", "inventory-value"].includes(card.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here are the daily operations, inventory updates, and order workflows.
            </p>
          </div>

          {/* Render operational-only cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staffStats.slice(0, 3).map((card) => {
              const Icon = ICONS[card.icon as keyof typeof ICONS] || Package;
              const colors = COLOR_CLASSES[card.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.blue;
              const TrendIcon = card.trend === "up" ? ArrowUpRight : card.trend === "down" ? ArrowDownRight : Minus;

              return (
                <div
                  key={card.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md bg-white",
                    colors.border
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.chip)}>
                      <Icon className={cn("h-5 w-5", colors.fg)} />
                    </span>
                  </div>

                  <p className="mb-1 text-sm font-semibold text-gray-600">{card.label}</p>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-2xl font-bold text-gray-900 leading-none">
                        {card.value}
                        {card.trend !== "neutral" && (
                          <TrendIcon className={cn("h-4 w-4", card.trend === "up" ? "text-green-600" : "text-red-600")} />
                        )}
                      </p>
                      <p className="mt-1.5 text-xs font-medium text-gray-500">{card.change}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <QuickActionsPanel />
            </div>
            <div className="space-y-6">
              <LowStockWidget />
              <ExpiringMedicinesWidget />
            </div>
          </div>

          <RecentOrdersTable />

          <div className="grid grid-cols-1 gap-6">
            <StockUpdatesTable />
          </div>
        </div>
      </main>
    </div>
  );
}
