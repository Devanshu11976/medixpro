"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { StatCardsRow } from "@/components/dashboard/stat-cards";
import { GraphReportCard } from "@/components/dashboard/graph-report-card";
import { TotalSalesOverviewCard } from "@/components/dashboard/total-sales-card";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { StockUpdatesTable } from "@/components/dashboard/stock-updates-table";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { ExpiringMedicinesWidget } from "@/components/dashboard/expiring-medicines-widget";
import { PendingInvoicesWidget } from "@/components/dashboard/pending-invoices-widget";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import api from "@/lib/api";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (!localStorage.getItem("medixpro_access_token")) return;
    api.get("/api/admin/retailers/pending")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPendingCount(res.data.length);
          setShowNotification(true);
        }
      })
      .catch((err) => console.error("Failed to load pending retailers: ", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, Admin! Here's the financial and operational status of your wholesale pharmacy.</p>
          </div>

          {showNotification && (
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm font-bold text-amber-950">Pending Partner Registrations Awaiting Action</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    There {pendingCount === 1 ? "is 1 retailer account" : `are ${pendingCount} retailer accounts`} waiting for administrative validation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/admin/retailers"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Manage Approvals <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-900 px-2 py-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <StatCardsRow />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickActionsPanel />
            <div className="grid grid-cols-1 gap-6">
              <GraphReportCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TotalSalesOverviewCard />
            <div className="space-y-6">
              <LowStockWidget />
              <ExpiringMedicinesWidget />
            </div>
          </div>

          <RecentOrdersTable />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StockUpdatesTable />
            <PendingInvoicesWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
