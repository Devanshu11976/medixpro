"use client";

import { Search, ChevronDown, ArrowUpDown, Package, Plus } from "lucide-react";
import { recentStockUpdates } from "@/lib/data/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StockUpdatesTable() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-gray-900">Recent Stock Updates</h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search updates..."
              className="h-9 w-40 rounded-full border-gray-200 bg-gray-50 pl-8 text-xs sm:w-52"
            />
          </div>
          <button className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            Filter <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <Button className="h-9 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Stock
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth: "700px" }}>
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500">
              <th className="py-3 pr-4">Medicine</th>
              <th className="py-3 pr-4">Batch</th>
              <th className="py-3 pr-4">Stock Added</th>
              <th className="py-3 pr-4">Supplier</th>
              <th className="py-3 pr-4">Updated By</th>
              <th className="py-3 pr-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentStockUpdates.map((update, index) => (
              <tr key={`${update.batch}-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{update.medicine}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {update.batch}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-semibold text-green-600">+{update.stockAdded.toLocaleString()}</span>
                </td>
                <td className="py-3 pr-4 text-gray-600">{update.supplier}</td>
                <td className="py-3 pr-4 text-gray-600">{update.updatedBy}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{update.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
