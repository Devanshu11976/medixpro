"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Database,
  Shield,
  FileSpreadsheet,
  Key,
  ShieldAlert,
} from "lucide-react";

type Activity = {
  id: string;
  timestamp: string;
  actor: string;
  category: "Auth" | "Inventory" | "Billing" | "Retailer" | "Orders";
  details: string;
  ip: string;
};

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "LOG-0192",
    timestamp: "2026-06-25 10:30:15",
    actor: "john.smith@medixpro.com",
    category: "Inventory",
    details: "Approved OCR Invoice INV-2024-0342 (+5000 units Paracetamol 500mg, +2500 Amoxicillin).",
    ip: "192.168.1.104",
  },
  {
    id: "LOG-0191",
    timestamp: "2026-06-25 09:45:20",
    actor: "sarah.j@medixpro.com",
    category: "Billing",
    details: "Generated counter quick-billing receipt INV-TX-105948 ($480.00).",
    ip: "192.168.1.112",
  },
  {
    id: "LOG-0190",
    timestamp: "2026-06-25 08:15:10",
    actor: "system@medixpro.com",
    category: "Inventory",
    details: "Automated trigger: Low Stock Alert sent for Cetirizine 10mg (28 units remaining).",
    ip: "localhost",
  },
  {
    id: "LOG-0189",
    timestamp: "2026-06-24 16:40:02",
    actor: "admin@medixpro.com",
    category: "Retailer",
    details: "Suspended QuickMeds Solutions account (RET-005) due to pending past-due balances.",
    ip: "192.168.1.100",
  },
  {
    id: "LOG-0188",
    timestamp: "2026-06-24 14:22:18",
    actor: "retailer@medixpro.com",
    category: "Orders",
    details: "Placed purchase order ORD-2024-0845 containing Omeprazole and Cetirizine.",
    ip: "204.85.12.92",
  },
  {
    id: "LOG-0187",
    timestamp: "2026-06-24 09:00:45",
    actor: "admin@medixpro.com",
    category: "Auth",
    details: "Successful administrator console sign-in (HS256 session issued).",
    ip: "192.168.1.100",
  },
];

export default function ActivityLogsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Activity["category"] | "All">("All");

  const filteredLogs = activities.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || log.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: Activity["category"]) => {
    switch (category) {
      case "Auth":
        return <Key className="h-4 w-4 text-amber-600" />;
      case "Inventory":
        return <Database className="h-4 w-4 text-emerald-600" />;
      case "Billing":
        return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
      case "Retailer":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "Orders":
        return <ShieldAlert className="h-4 w-4 text-purple-600" />;
    }
  };

  const getCategoryStyle = (category: Activity["category"]) => {
    switch (category) {
      case "Auth":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Inventory":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Billing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Retailer":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Orders":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">ERP System Auditing</h1>
            <p className="mt-1 text-sm text-gray-500">Perform regulatory audits on database adjustments, inventory logs, and system actions.</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search audit trail by actor email or log keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(["All", "Auth", "Inventory", "Billing", "Retailer", "Orders"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-500">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Audit ID</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Transaction Details</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-55">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{log.id}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{log.actor}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getCategoryStyle(
                              log.category
                            )}`}
                          >
                            {getCategoryIcon(log.category)}
                            {log.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium leading-relaxed">{log.details}</td>
                        <td className="px-6 py-4 text-gray-400 font-mono">{log.ip}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        No activity records matched your filter settings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
