"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  genericName: string;
  price: number;
  qty: number;
  stock: number;
};

const MEDICINES_POOL = [
  { id: "MED-001", name: "Paracetamol 500mg", genericName: "Acetaminophen", price: 5.0, stock: 1200 },
  { id: "MED-002", name: "Amoxicillin 250mg", genericName: "Amoxicillin Trihydrate", price: 12.5, stock: 45 },
  { id: "MED-003", name: "Omeprazole 20mg", genericName: "Omeprazole", price: 8.2, stock: 850 },
  { id: "MED-005", name: "Ibuprofen 400mg", genericName: "Ibuprofen", price: 4.8, stock: 15 },
  { id: "MED-006", name: "Cetirizine 10mg", genericName: "Cetirizine Dihydrochloride", price: 3.5, stock: 1400 },
];

export default function RetailerCartPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medixpro_cart");
      if (stored) {
        try {
          const rawCart = JSON.parse(stored) as Array<{ id: string; qty: number }>;
          const enriched = rawCart
            .map((item) => {
              const med = MEDICINES_POOL.find((m) => m.id === item.id);
              if (!med) return null;
              return { ...med, qty: item.qty };
            })
            .filter(Boolean) as CartItem[];
          setCart(enriched);
        } catch {}
      }
    }
  }, []);

  const saveCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    const serialized = newCart.map((item) => ({ id: item.id, qty: item.qty }));
    localStorage.setItem("medixpro_cart", JSON.stringify(serialized));
  };

  const updateQty = (id: string, delta: number) => {
    const next = cart
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          if (nextQty > item.stock) return item;
          return { ...item, qty: nextQty };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCartState(next);
  };

  const removeItem = (id: string) => {
    saveCartState(cart.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const ordId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsDescription = cart.map((c) => `${c.name} (x${c.qty})`).join(", ");

    const orderData = {
      orderId: ordId,
      medicines: itemsDescription,
      amount: `$${grandTotal.toFixed(2)}`,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };

    // Load purchases from localstorage
    const storedPurchases = localStorage.getItem("medixpro_purchases");
    let purchases = [];
    if (storedPurchases) {
      try {
        purchases = JSON.parse(storedPurchases);
      } catch {}
    }
    purchases = [orderData, ...purchases];
    localStorage.setItem("medixpro_purchases", JSON.stringify(purchases));

    // Clear cart
    localStorage.removeItem("medixpro_cart");
    setPlacedOrderId(ordId);
    setSuccess(true);
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const tax = subtotal * 0.18; // 18% standard wholesale medicine tax
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15.0; // free shipping above $200
  const grandTotal = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Retailer Cart Checkout</h1>
            <p className="mt-1 text-sm text-gray-500">Confirm purchase quantities, view wholesale discount margins, and checkout.</p>
          </div>

          {success ? (
            <div className="max-w-md rounded-2xl border border-green-200 bg-white p-8 shadow-sm text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
              <div>
                <h2 className="font-display text-xl font-bold text-gray-950">Purchase Order Placed!</h2>
                <p className="text-xs text-gray-500 mt-1">Your order has been logged under ID: <strong className="font-mono text-gray-800">{placedOrderId}</strong></p>
                <p className="text-xs text-gray-400 mt-1">The distributor will review stock allocation and update the shipment queue.</p>
              </div>
              <div className="pt-2">
                <Link href="/retailer-purchases">
                  <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    View Purchases <ArrowRight className="ml-1.5 h-4.5 w-4.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
              {/* Cart item table list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full border-collapse text-left text-sm text-gray-500">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-700">
                      <tr>
                        <th className="px-6 py-4">Medicine</th>
                        <th className="px-6 py-4">Wholesale Price</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Subtotal</th>
                        <th className="px-6 py-4 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cart.length > 0 ? (
                        cart.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900 block">{item.name}</span>
                              <span className="text-xs text-gray-400 italic">{item.genericName}</span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8 w-24">
                                <button
                                  onClick={() => updateQty(item.id, -1)}
                                  className="px-2 hover:bg-gray-100 text-gray-600"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="flex-1 text-center font-mono font-bold text-gray-900 text-xs bg-white">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateQty(item.id, 1)}
                                  className="px-2 hover:bg-gray-100 text-gray-600"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-950">${(item.price * item.qty).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-gray-400">
                            <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            Your shopping cart is empty. Go back to store to shop.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {cart.length === 0 && (
                  <Link href="/retailer-home">
                    <Button variant="outline" className="h-10 text-slate-700 bg-white">
                      Back to Shop Store
                    </Button>
                  </Link>
                )}
              </div>

              {/* Bill Details Summary */}
              {cart.length > 0 && (
                <div className="rounded-xl border border-gray-250 bg-white p-6 shadow-sm space-y-5">
                  <h2 className="font-display font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 flex items-center gap-1.5">
                    <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
                    <span>Purchase Summary</span>
                  </h2>

                  <div className="space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between text-gray-500">
                      <span>Items Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST / VAT (18%):</span>
                      <span>+${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping Fees:</span>
                      <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                    </div>

                    <div className="border-t border-gray-150 pt-3 flex justify-between text-sm font-bold text-gray-950">
                      <span>Payable Total:</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-[10px] text-gray-400 leading-normal">
                    * Orders with totals above $200 qualify for free express shipping. Delivery is dispatched within 24 hours of confirmation.
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Confirm & Place Purchase Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
