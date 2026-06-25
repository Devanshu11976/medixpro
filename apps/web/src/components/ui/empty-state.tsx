import { Package, ShoppingCart, FileText, AlertCircle, Plus } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type EmptyStateType = "orders" | "medicines" | "invoices" | "stock" | "generic";

const EMPTY_STATE_CONFIG: Record<
  EmptyStateType,
  { icon: any; title: string; description: string; actionLabel?: string }
> = {
  orders: {
    icon: ShoppingCart,
    title: "No Orders Yet",
    description: "You don't have any orders at the moment. Create your first order to get started.",
    actionLabel: "Create Order",
  },
  medicines: {
    icon: Package,
    title: "No Medicines Found",
    description: "Your inventory is empty. Add medicines to start managing your stock.",
    actionLabel: "Add Medicine",
  },
  invoices: {
    icon: FileText,
    title: "No Pending Invoices",
    description: "All invoices have been processed. You're all caught up!",
  },
  stock: {
    icon: AlertCircle,
    title: "No Low Stock Alerts",
    description: "Great! All your medicines are well-stocked. Keep monitoring your inventory.",
  },
  generic: {
    icon: Package,
    title: "No Data Available",
    description: "There's no data to display at the moment.",
  },
};

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  type = "generic",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title || config.title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description || config.description}</p>
      {(actionLabel || config.actionLabel) && onAction && (
        <Button onClick={onAction} className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  );
}
