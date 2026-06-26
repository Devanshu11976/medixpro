"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ArrowUpDown, Eye, MoreVertical, Loader2 } from "lucide-react";
import { type OrderStatus } from "@/lib/data/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const STATUS_CLASSES: Record<OrderStatus, { bg: string; text: string }> = {
  Pending: { bg: "bg-orange-100", text: "text-orange-700" },
  Processing: { bg: "bg-blue-100", text: "text-blue-700" },
  Shipped: { bg: "bg-purple-100", text: "text-purple-700" },
  Delivered: { bg: "bg-green-100", text: "text-green-700" },
  Cancelled: { bg: "bg-red-100", text: "text-red-700" },
};

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/orders");
        
        // Sort by created_at desc (newest first)
        const sorted = res.data.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const formatted = sorted.slice(0, 5).map((order: any) => ({
          orderId: order.id,
          retailer: order.retailer_name,
          medicines: order.items.map((i: any) => i.medicine_name).join(", "),
          items: order.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0),
          status: order.status,
          amount: `$${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          date: order.created_at.split("T")[0]
        }));
        
        setOrders(formatted);
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.retailer.toLowerCase().includes(search.toLowerCase()) ||
      o.medicines.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-gray-900">Recent Orders</h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-40 rounded-full border-gray-200 bg-gray-50 pl-8 text-xs sm:w-52"
            />
          </div>
          <button className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            Filter <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="hidden h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex">
            Sort By Date <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth: "800px" }}>
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500">
              <th className="py-3 pr-4">Order ID</th>
              <th className="py-3 pr-4">Retailer</th>
              <th className="py-3 pr-4">Medicines</th>
              <th className="py-3 pr-4">Items</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Amount</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading recent orders...
                  </div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((order) => (
                <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900">{order.orderId}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.retailer}</td>
                  <td className="py-3 pr-4 text-gray-600 max-w-[200px] truncate">{order.medicines}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.items}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        STATUS_CLASSES[order.status as OrderStatus].bg,
                        STATUS_CLASSES[order.status as OrderStatus].text
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{order.amount}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.date}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.location.href = `/admin/orders?search=${encodeURIComponent(order.orderId)}`}
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No recent orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
