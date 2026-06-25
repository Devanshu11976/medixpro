"use client";

import { Clock, Calendar } from "lucide-react";
import { expiringMedicines } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExpiringMedicinesWidget() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="font-display text-base font-semibold text-gray-900">Expiring Medicines</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {expiringMedicines.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.medicine}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.expiryDate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.daysRemaining} days
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                  item.daysRemaining <= 20
                    ? "bg-red-100 text-red-700"
                    : item.daysRemaining <= 30
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
                )}
              >
                {item.daysRemaining <= 20 ? "Critical" : item.daysRemaining <= 30 ? "Warning" : "Soon"}
              </span>
              <Button size="sm" className="h-8 rounded-full border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                Action
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
