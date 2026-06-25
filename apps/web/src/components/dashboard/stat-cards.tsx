import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  Building2,
  Warehouse,
  PlusCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { statCards, type StatCard } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

const ICONS = {
  sales: DollarSign,
  orders: ShoppingCart,
  medicines: Package,
  stock: AlertTriangle,
  expiring: Clock,
  retailers: Building2,
  inventory: Warehouse,
  added: PlusCircle,
};

const COLOR_CLASSES: Record<StatCard["color"], { bg: string; fg: string; chip: string; border: string }> = {
  blue: { bg: "bg-blue-50", fg: "text-blue-700", chip: "bg-blue-100", border: "border-blue-200" },
  green: { bg: "bg-green-50", fg: "text-green-700", chip: "bg-green-100", border: "border-green-200" },
  orange: { bg: "bg-orange-50", fg: "text-orange-700", chip: "bg-orange-100", border: "border-orange-200" },
  red: { bg: "bg-red-50", fg: "text-red-700", chip: "bg-red-100", border: "border-red-200" },
  purple: { bg: "bg-purple-50", fg: "text-purple-700", chip: "bg-purple-100", border: "border-purple-200" },
};

const SPARK_HEIGHTS = [40, 65, 50, 80, 60, 95, 45, 70, 55];

function Sparkline({ fg }: { fg: string }) {
  return (
    <div className="flex items-end gap-[3px]" aria-hidden="true">
      {SPARK_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full opacity-70", fg)}
          style={{ height: `${h * 0.18}px`, backgroundColor: "currentColor" }}
        />
      ))}
    </div>
  );
}

export function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = ICONS[card.icon];
        const colors = COLOR_CLASSES[card.color];
        const TrendIcon = card.trend === "up" ? ArrowUpRight : card.trend === "down" ? ArrowDownRight : Minus;

        return (
          <div
            key={card.id}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md",
              colors.bg,
              colors.border
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.chip)}>
                <Icon className="h-5 w-5" />
              </span>
              <button
                type="button"
                aria-label={`More options for ${card.label}`}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <p className="mb-1 text-sm font-semibold text-gray-600">{card.label}</p>

            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 text-2xl font-bold text-gray-900 leading-none">
                  {card.value}
                  {card.trend !== "neutral" && (
                    <TrendIcon className={cn("h-4 w-4", card.trend === "up" ? "text-green-600" : "text-red-600")} />
                  )}
                </p>
                <p className="mt-1.5 text-xs font-medium text-gray-500">{card.change}</p>
              </div>
              <Sparkline fg={colors.fg} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
