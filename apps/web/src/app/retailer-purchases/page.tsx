"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import {
  Clock,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
} from "lucide-react";

type OrderRecord = {
  orderId: string;
  medicines: string;
  amount: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
};

const DEFAULT_PURCHASES: OrderRecord[] = [
  {
    orderId: "ORD-2026-0042",
    medicines: "Metformin 500mg (x200), Cetirizine 10mg (x50)",
    amount: "$1,480.00",
    status: "Delivered",
    date: "2026-06-18",
  },
  {
    orderId: "ORD-2026-0039",
    medicines: "Paracetamol 500mg (x100)",
    amount: "$500.00",
    status: "Delivered",
    date: "2026-06-10",
  },
];

export default function RetailerPurchasesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [purchases, setPurchases] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medixpro_purchases");
      if (stored) {
        try {
          setPurchases(JSON.parse(stored));
        } catch {
          setPurchases(DEFAULT_PURCHASES);
        }
      } else {
        // Seed default purchases if empty
        localStorage.setItem("medixpro_purchases", JSON.stringify(DEFAULT_PURCHASES));
        setPurchases(DEFAULT_PURCHASES);
      }
    }
  }, []);

  const getStatusIcon = (status: OrderRecord["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-3.5 w-3.5 text-amber-600" />;
      case "Processing":
        return <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />;
      case "Shipped":
        return <Truck className="h-3.5 w-3.5 text-purple-600" />;
      case "Delivered":
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case "Cancelled":
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
    }
  };

  const getStatusStyle = (status: OrderRecord["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
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
            <h1 className="font-display text-2xl font-bold text-gray-900">My Purchase Ledger</h1>
            <p className="mt-1 text-sm text-gray-500">Track current status of orders submitted to the distributor and download invoices.</p>
          </div>

          {/* Ledger Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm max-w-5xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-500">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    <th className="px-6 py-4">Medicines Summary</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.length > 0 ? (
                    purchases.map((p) => (
                      <tr key={p.orderId} className="hover:bg-gray-55">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{p.orderId}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{p.date}</td>
                        <td className="px-6 py-4 text-gray-750 font-medium max-w-sm truncate" title={p.medicines}>
                          {p.medicines}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-950">{p.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              p.status
                            )}`}
                          >
                            {getStatusIcon(p.status)}
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <FileText className="h-10 w-10 text-gray-250 mx-auto mb-3" />
                        No purchase orders logged yet.
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
