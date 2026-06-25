"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { lowStockItems } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LowStockWidget() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <h3 className="font-display text-base font-semibold text-gray-900">Low Stock Medicines</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.medicine}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span>Stock: {item.stock}</span>
                <span>Reorder Level: {item.reorderLevel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                  item.status === "Critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                )}
              >
                {item.status}
              </span>
              <Button size="sm" className="h-8 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">
                <RefreshCw className="mr-1 h-3 w-3" />
                Reorder
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
