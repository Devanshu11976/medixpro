"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Building2,
  DollarSign,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  purchaseVsSales,
  topSellingMedicines,
  orderStatusDistribution,
} from "@/lib/data/dashboard";

export default function ReportsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("This Month");

  // Recharts color codes
  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Reports & Ledger Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Track company profit margins, high-performing retailers, and inventory turnovers.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-10 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="This Month">This Month</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="This Year">This Year</option>
              </select>
              <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                <Download className="mr-1.5 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Revenue Highlight Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total Sales Revenue</span>
                  <p className="text-2xl font-bold text-gray-900">$88,420.00</p>
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last month
                  </span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Restock Purchases</span>
                  <p className="text-2xl font-bold text-gray-900">$64,150.00</p>
                  <span className="text-[10px] text-slate-500 font-semibold">Includes OCR processed invoices</span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Retailer Net Accounts</span>
                  <p className="text-2xl font-bold text-gray-900">156 Pharmacies</p>
                  <span className="text-[10px] text-purple-600 font-bold">+5 new accounts this quarter</span>
                </div>
                <div className="h-11 w-11 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Purchase vs Sales chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Purchase vs Sales Margins</CardTitle>
                <CardDescription>Monthly layout comparing capital expenses vs revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={purchaseVsSales}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(val) => `$${val / 1000}k`} />
                      <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : ""} />
                      <Legend verticalAlign="top" height={36} />
                      <Area name="Sales Revenue" type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2.5} />
                      <Area name="Inventory Cost" type="monotone" dataKey="purchase" stroke="#10b981" fillOpacity={1} fill="url(#purchGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Medicines bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Top Medicine Revenue Generators</CardTitle>
                <CardDescription>Highest selling formulations based on invoice ledger</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingMedicines} layout="vertical">
                      <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(val) => `$${val / 1000}k`} />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={130} tick={{ fontSize: 10, fontWeight: 600 }} />
                      <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : ""} />
                      <Bar name="Sales Value" dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order status Distribution pie chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Order Fulfillment Distribution</CardTitle>
                <CardDescription>Breakdown of retail order statuses inside queue</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center sm:flex-row sm:justify-around gap-6">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {orderStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="space-y-2 text-xs font-semibold">
                  {orderStatusDistribution.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color || COLORS[idx] }} />
                      <span className="text-gray-500 font-medium">{entry.status}:</span>
                      <span className="text-gray-900">{entry.value} orders</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Latest audits summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Ledger Export Center</CardTitle>
                <CardDescription>Download tax sheets and custom CSV inventory statements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between border border-gray-150 p-3.5 rounded-xl bg-white hover:bg-gray-55 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Q2 Financial Audit Statement.pdf</span>
                      <span className="text-[10px] text-gray-400">PDF Document • 4.2 MB • Generated Yesterday</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <Download className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between border border-gray-150 p-3.5 rounded-xl bg-white hover:bg-gray-55 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Medicine Turnover Audit.csv</span>
                      <span className="text-[10px] text-gray-400">CSV Spreadsheet • 820 KB • Generated 2 days ago</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <Download className="h-4.5 w-4.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
