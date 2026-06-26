"use client";

import { Search, ChevronDown, ArrowUpDown, Eye, MoreVertical } from "lucide-react";
import { recentOrders, type OrderStatus } from "@/lib/data/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<OrderStatus, { bg: string; text: string }> = {
  Pending: { bg: "bg-orange-100", text: "text-orange-700" },
  Processing: { bg: "bg-blue-100", text: "text-blue-700" },
  Shipped: { bg: "bg-purple-100", text: "text-purple-700" },
  Delivered: { bg: "bg-green-100", text: "text-green-700" },
  Cancelled: { bg: "bg-red-100", text: "text-red-700" },
};

export function RecentOrdersTable() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-gray-900">Recent Orders</h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search orders..."
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
            {recentOrders.map((order) => (
              <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-gray-900">{order.orderId}</td>
                <td className="py-3 pr-4 text-gray-600">{order.retailer}</td>
                <td className="py-3 pr-4 text-gray-600 max-w-[200px] truncate">{order.medicines}</td>
                <td className="py-3 pr-4 text-gray-600">{order.items}</td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_CLASSES[order.status].bg,
                      STATUS_CLASSES[order.status].text
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium text-gray-900">{order.amount}</td>
                <td className="py-3 pr-4 text-gray-600">{order.date}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
