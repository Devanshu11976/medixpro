"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { MoreHorizontal } from "lucide-react";
import { orderStatusDistribution } from "@/lib/data/dashboard";

export function GraphReportCard() {
  const total = orderStatusDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-gray-900">Order Status Distribution</h3>
        <button type="button" aria-label="More options" className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mx-auto h-[220px] w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={orderStatusDistribution}
              dataKey="value"
              nameKey="status"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
            >
              {orderStatusDistribution.map((entry) => (
                <Cell key={entry.status} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">Total Orders</span>
          <span className="font-display text-2xl font-bold text-gray-900">{total}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600">
        {orderStatusDistribution.map((entry) => (
          <span key={entry.status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.status} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}
