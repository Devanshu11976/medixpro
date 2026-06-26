"use client";

import { FileText, Eye, Check } from "lucide-react";
import { pendingInvoices } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PendingInvoicesWidget() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="font-display text-base font-semibold text-gray-900">Pending Invoice Reviews</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {pendingInvoices.map((invoice, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{invoice.invoiceId}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                    invoice.status === "Pending Review"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {invoice.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{invoice.supplier}</span>
                <span className="font-semibold text-gray-900">{invoice.amount}</span>
                <span>{invoice.uploadedDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 justify-end">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4 text-gray-500" />
              </Button>
              <Button size="sm" className="h-8 rounded-full bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700">
                <Check className="mr-1 h-3 w-3" />
                Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
