"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Check,
  Trash2,
  Inbox,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  description: string;
  type: "stock" | "expiry" | "order" | "invoice";
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "NTF-001",
    title: "Critical Low Stock Alert",
    description: "Insulin Glargine is currently at 15 units (Reorder level is 50).",
    type: "stock",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: "NTF-002",
    title: "Medicines Expiring Soon",
    description: "Prednisone 5mg (Batch: BTH-2023-0456) will expire in 20 days.",
    type: "expiry",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "NTF-003",
    title: "New Retailer Purchase Order",
    description: "Medicare Pharmacy has placed a new order ORD-2024-0847 ($2,450.00).",
    type: "order",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "NTF-004",
    title: "Pending OCR Invoice Review",
    description: "New invoice INV-2024-0342 from PharmaCorp Ltd requires layout audit.",
    type: "invoice",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "NTF-005",
    title: "Credit Overdraft Notice",
    description: "Wellness Pharmacy is close to exceeding their $10,000 credit authorization limit.",
    type: "invoice",
    time: "2 days ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("medixpro_access_token")) return;
    const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");

    api.get("/api/notifications")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const formatted = res.data.map((n: any) => ({
            ...n,
            unread: !readIds.includes(n.id)
          }));
          setNotifications(formatted);
        }
      })
      .catch((err) => {
        console.error("Failed to load dynamic notifications: ", err);
      });
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    
    // Save to localStorage
    const readIds = updated.filter(n => !n.unread).map(n => n.id);
    localStorage.setItem("medixpro_read_ids", JSON.stringify(readIds));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const toggleReadStatus = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n));
    setNotifications(updated);
    
    // Save to localStorage
    const readIds = updated.filter(n => !n.unread).map(n => n.id);
    localStorage.setItem("medixpro_read_ids", JSON.stringify(readIds));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    
    // Mark as read in localStorage so it doesn't count towards unread count
    const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
    }
    localStorage.setItem("medixpro_read_ids", JSON.stringify(readIds));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "stock":
        return <AlertTriangle className="h-4.5 w-4.5 text-red-600" />;
      case "expiry":
        return <Clock className="h-4.5 w-4.5 text-amber-600" />;
      case "order":
        return <ShoppingCart className="h-4.5 w-4.5 text-blue-600" />;
      case "invoice":
        return <Bell className="h-4.5 w-4.5 text-purple-600" />;
    }
  };

  const getIconContainerColor = (type: Notification["type"]) => {
    switch (type) {
      case "stock":
        return "bg-red-50 border-red-200";
      case "expiry":
        return "bg-amber-50 border-amber-200";
      case "order":
        return "bg-blue-50 border-blue-200";
      case "invoice":
        return "bg-purple-50 border-purple-200";
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">System Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">View automated inventory warnings, retailer payment triggers, and order confirmations.</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="h-10 text-slate-700 bg-white">
                <Check className="mr-1.5 h-4 w-4" /> Mark all as read
              </Button>
            )}
          </div>

          {/* List panel */}
          <div className="rounded-xl border border-gray-250 bg-white shadow-sm overflow-hidden max-w-4xl">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between p-5 transition-all hover:bg-slate-50/50 ${
                      n.unread ? "bg-blue-50/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getIconContainerColor(n.type)}`}>
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold ${n.unread ? "text-gray-950" : "text-gray-700"}`}>
                            {n.title}
                          </h3>
                          {n.unread && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xl">{n.description}</p>
                        <span className="block text-[10px] text-gray-400 font-semibold">{n.time}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleReadStatus(n.id)}
                        title={n.unread ? "Mark as Read" : "Mark as Unread"}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        title="Delete Alert"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400">
                <Inbox className="h-10 w-10 text-gray-250 mx-auto mb-3" />
                <p className="text-sm font-bold">All clear!</p>
                <p className="text-xs text-gray-450 mt-1">You have handled or dismissed all notifications.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
