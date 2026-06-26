"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { dailySales } from "@/lib/data/dashboard";

export function TotalSalesOverviewCard() {
  return (
    <div className="relative flex flex-col rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-gray-900">Daily Sales</h3>
      </div>

      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailySales} barCategoryGap={18} margin={{ top: 20, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Sales"]}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
