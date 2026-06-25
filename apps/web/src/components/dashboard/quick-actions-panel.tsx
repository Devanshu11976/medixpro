"use client";

import { Pill, Upload, ShoppingCart, Building2, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export function QuickActionsPanel() {
  const [role, setRole] = useState<string>("staff");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = (localStorage.getItem("medixpro_role") || "staff").toLowerCase();
      setRole(storedRole);
    }
  }, []);

  const actions = [];
  
  if (role === "admin") {
    actions.push(
      { icon: Pill, label: "Add Medicine", href: "/admin/medicines" },
      { icon: Upload, label: "Upload Invoice", href: "/admin/invoices" },
      { icon: Zap, label: "POS Billing", href: "/admin/billing" },
      { icon: Building2, label: "Add Retailer", href: "/admin/retailers" },
      { icon: ShoppingCart, label: "Manage Orders", href: "/admin/orders" }
    );
  } else {
    // Staff/Operator
    actions.push(
      { icon: Pill, label: "Add Medicine", href: "/admin/medicines" },
      { icon: Zap, label: "POS Billing", href: "/admin/billing" },
      { icon: ShoppingCart, label: "Manage Orders", href: "/admin/orders" }
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-display text-base font-semibold text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              asChild
              variant="outline"
              className="flex h-auto flex-col items-center gap-2 rounded-lg border-gray-200 py-4 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 cursor-pointer"
            >
              <Link href={action.href}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
