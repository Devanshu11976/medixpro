"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Pill,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

type Medicine = {
  id: string;
  name: string;
  genericName: string;
  price: number;
  stock: number;
  image: string;
};

const MEDICINES_POOL: Medicine[] = [
  { id: "MED-001", name: "Paracetamol 500mg", genericName: "Acetaminophen", price: 5.0, stock: 1200, image: "💊" },
  { id: "MED-002", name: "Amoxicillin 250mg", genericName: "Amoxicillin Trihydrate", price: 12.5, stock: 45, image: "🧪" },
  { id: "MED-003", name: "Omeprazole 20mg", genericName: "Omeprazole", price: 8.2, stock: 850, image: "💊" },
  { id: "MED-005", name: "Ibuprofen 400mg", genericName: "Ibuprofen", price: 4.8, stock: 15, image: "🧪" },
  { id: "MED-006", name: "Cetirizine 10mg", genericName: "Cetirizine Dihydrochloride", price: 3.5, stock: 1400, image: "💊" },
];

export default function RetailerHomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Array<{ id: string; qty: number }>>([]);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medixpro_cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const addToCart = (medId: string, name: string) => {
    let nextCart = [...cart];
    const existing = nextCart.find((item) => item.id === medId);
    if (existing) {
      existing.qty += 1;
    } else {
      nextCart.push({ id: medId, qty: 1 });
    }
    setCart(nextCart);
    localStorage.setItem("medixpro_cart", JSON.stringify(nextCart));

    // Show transient notification
    setAddedItemName(name);
    setTimeout(() => setAddedItemName(null), 1500);
  };

  const filteredMeds = MEDICINES_POOL.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          {/* Header & Cart Link */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Wholesale Medicines Store</h1>
              <p className="mt-1 text-sm text-gray-500">Order medicines directly from the warehouse catalog. Real-time availability indicators shown.</p>
            </div>
            <Link href="/retailer-cart">
              <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold relative">
                <ShoppingCart className="mr-1.5 h-4.5 w-4.5" /> Shopping Cart
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                    {cartTotalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search catalog by name or generic formulary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full bg-white border-gray-200"
            />
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMeds.map((med) => (
              <div
                key={med.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{med.image}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        med.stock > 100
                          ? "bg-green-50 text-green-700 border-green-200"
                          : med.stock > 0
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {med.stock > 100 ? "In Stock" : med.stock > 0 ? "Limited Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-gray-900 text-base">{med.name}</h2>
                  <p className="text-xs text-gray-500 italic mt-0.5">{med.genericName}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">{med.id}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-bold text-blue-600">${med.price.toFixed(2)}</span>
                  <Button
                    onClick={() => addToCart(med.id, med.name)}
                    disabled={med.stock <= 0}
                    className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  >
                    Add to order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating added notice */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="h-4.5 w-4.5 text-green-400 shrink-0" />
          <span>Added {addedItemName} to order!</span>
        </div>
      )}
    </div>
  );
}
