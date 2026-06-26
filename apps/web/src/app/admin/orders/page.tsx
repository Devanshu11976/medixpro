"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
} from "lucide-react";

type Order = {
  id: string;
  retailer: string;
  items: Array<{ name: string; qty: number; price: string }>;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  amount: string;
  date: string;
};

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2024-0847",
    retailer: "Medicare Pharmacy",
    items: [
      { name: "Paracetamol 500mg", qty: 100, price: "$5.00" },
      { name: "Amoxicillin 250mg", qty: 50, price: "$12.50" },
    ],
    status: "Pending",
    amount: "$1,125.00",
    date: "2026-06-25",
  },
  {
    id: "ORD-2024-0846",
    retailer: "HealthPlus Stores",
    items: [
      { name: "Metformin 500mg", qty: 200, price: "$6.00" },
      { name: "Ibuprofen 400mg", qty: 100, price: "$4.80" },
    ],
    status: "Processing",
    amount: "$1,680.00",
    date: "2026-06-24",
  },
  {
    id: "ORD-2024-0845",
    retailer: "City Drug Mart",
    items: [
      { name: "Omeprazole 20mg", qty: 150, price: "$8.20" },
      { name: "Cetirizine 10mg", qty: 50, price: "$3.50" },
    ],
    status: "Shipped",
    amount: "$1,405.00",
    date: "2026-06-24",
  },
  {
    id: "ORD-2024-0844",
    retailer: "Wellness Pharmacy",
    items: [
      { name: "Paracetamol 500mg", qty: 500, price: "$5.00" },
    ],
    status: "Delivered",
    amount: "$2,500.00",
    date: "2026-06-22",
  },
  {
    id: "ORD-2024-0843",
    retailer: "QuickMeds Solutions",
    items: [
      { name: "Amoxicillin 250mg", qty: 80, price: "$12.50" },
    ],
    status: "Cancelled",
    amount: "$1,000.00",
    date: "2026-06-21",
  },
];

export default function OrdersPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Order["status"] | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) setSearch(query);
    }
  }, []);

  const handleStatusChange = (orderId: string, nextStatus: Order["status"]) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.retailer.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "Processing":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case "Shipped":
        return <Truck className="h-4 w-4 text-purple-600" />;
      case "Delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusStyle = (status: Order["status"]) => {
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

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Retailer Purchase Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Track and fulfill incoming inventory requests from partner retail pharmacies.</p>
          </div>

          {/* Grid Layout: Main Orders List + Side Inspect Panel */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by Order ID or Retailer Pharmacy..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 w-full"
                  />
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all border whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-gray-500" style={{ minWidth: "850px" }}>
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-700">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Retailer</th>
                        <th className="px-6 py-4">Ordered Date</th>
                        <th className="px-6 py-4">Items count</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${
                              selectedOrder?.id === order.id ? "bg-blue-50/20" : ""
                            }`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <td className="px-6 py-4 font-mono font-bold text-gray-900">{order.id}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{order.retailer}</td>
                            <td className="px-6 py-4 text-gray-600">{order.date}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {order.items.reduce((acc, curr) => acc + curr.qty, 0)} units
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{order.amount}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                              >
                                Inspect <Eye className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-400">
                            No orders in this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Inspect Panel */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {selectedOrder ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Active Audit</span>
                    <h2 className="font-display text-lg font-bold text-gray-900 mt-1">{selectedOrder.id}</h2>
                    <p className="text-xs text-gray-500">{selectedOrder.retailer}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Ordered Products</h3>
                    <div className="divide-y divide-gray-100 max-h-[160px] overflow-y-auto">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-xs">
                          <div>
                            <span className="font-semibold text-gray-900">{item.name}</span>
                            <span className="block text-gray-400">Qty: {item.qty} units</span>
                          </div>
                          <span className="font-medium text-gray-900">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="text-xs font-semibold text-gray-600">Total Purchase Value:</span>
                    <span className="text-base font-bold text-gray-950">{selectedOrder.amount}</span>
                  </div>

                  {/* Flow Action Center */}
                  <div className="border-t border-gray-100 pt-4 space-y-2.5">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Fulfillment Actions</h3>

                    {selectedOrder.status === "Pending" && (
                      <Button
                        onClick={() => handleStatusChange(selectedOrder.id, "Processing")}
                        className="w-full h-10 bg-blue-600 text-white hover:bg-blue-700 font-bold"
                      >
                        Approve & Start Processing <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {selectedOrder.status === "Processing" && (
                      <Button
                        onClick={() => handleStatusChange(selectedOrder.id, "Shipped")}
                        className="w-full h-10 bg-purple-600 text-white hover:bg-purple-700 font-bold"
                      >
                        Mark as Shipped <Truck className="h-4 w-4" />
                      </Button>
                    )}

                    {selectedOrder.status === "Shipped" && (
                      <Button
                        onClick={() => handleStatusChange(selectedOrder.id, "Delivered")}
                        className="w-full h-10 bg-green-600 text-white hover:bg-green-700 font-bold"
                      >
                        Confirm Delivery <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                      <Button
                        onClick={() => handleStatusChange(selectedOrder.id, "Cancelled")}
                        variant="destructive"
                        className="w-full h-10"
                      >
                        Cancel Order
                      </Button>
                    )}

                    {selectedOrder.status === "Delivered" && (
                      <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-xs font-semibold text-green-800">
                        This order has been completed and archived.
                      </div>
                    )}

                    {selectedOrder.status === "Cancelled" && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center text-xs font-semibold text-red-800">
                        This order has been cancelled.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-gray-400">
                  <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  Select an order from the list to view items and initiate shipping/processing actions.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
