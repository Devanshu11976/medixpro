"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  X,
  CheckCircle,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
};

const MEDICINES_POOL = [
  { id: "MED-001", name: "Paracetamol 500mg", price: 5.0, stock: 1200 },
  { id: "MED-002", name: "Amoxicillin 250mg", price: 12.5, stock: 45 },
  { id: "MED-003", name: "Omeprazole 20mg", price: 8.2, stock: 850 },
  { id: "MED-005", name: "Ibuprofen 400mg", price: 4.8, stock: 15 },
  { id: "MED-006", name: "Cetirizine 10mg", price: 3.5, stock: 1400 },
];

export default function BillingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("Walk-in Retailer");
  const [discountPercent, setDiscountPercent] = useState(5); // default 5%
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");

  const addToCart = (med: typeof MEDICINES_POOL[0]) => {
    const existing = cart.find((item) => item.id === med.id);
    if (existing) {
      if (existing.qty >= med.stock) return; // limit stock
      setCart(
        cart.map((item) => (item.id === med.id ? { ...item, qty: item.qty + 1 } : item))
      );
    } else {
      setCart([...cart, { ...med, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.stock) return item;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setInvoiceId(`INV-TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowReceiptModal(true);
  };

  const resetCart = () => {
    setCart([]);
    setShowReceiptModal(false);
  };

  const filteredMeds = MEDICINES_POOL.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // Financial calculations
  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxRate = 0.18; // 18% GST/VAT standard medical rate
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + taxAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Counter Quick Billing</h1>
            <p className="mt-1 text-sm text-gray-500">Initiate immediate counter transactions, allocate bills, and print credit slips.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            {/* Catalog / Search & Select */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-250 bg-white p-5 shadow-sm space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search catalog by medicine name to add to cart..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 w-full bg-white border-gray-250"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {filteredMeds.map((med) => (
                    <div
                      key={med.id}
                      className="border border-gray-200 hover:border-blue-400 rounded-lg p-3 flex justify-between items-center transition-all bg-white"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 text-xs block">{med.name}</span>
                        <span className="text-[10px] text-gray-500 block">Stock: {med.stock} units</span>
                        <span className="text-xs font-bold text-blue-600">${med.price.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={() => addToCart(med)}
                        disabled={med.stock <= 0}
                        size="sm"
                        className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart & Billing Ledger */}
            <div className="rounded-xl border border-gray-250 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-4.5 w-4.5 text-blue-600" />
                  <span className="font-display font-bold text-gray-900 text-sm">Billing Cart</span>
                </div>
                <span className="text-xs text-gray-500 font-semibold">{cart.length} items</span>
              </div>

              {/* Retailer Select */}
              <div className="space-y-1.5">
                <Label htmlFor="retailer-select" className="text-[10px] font-bold text-gray-600 uppercase">Retailer Pharmacy</Label>
                <div className="relative flex items-center">
                  <User className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
                  <select
                    id="retailer-select"
                    value={selectedRetailer}
                    onChange={(e) => setSelectedRetailer(e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg pl-9 pr-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Walk-in Retailer">Walk-in Retailer</option>
                    <option value="Medicare Pharmacy">Medicare Pharmacy</option>
                    <option value="HealthPlus Stores">HealthPlus Stores</option>
                    <option value="City Drug Mart">City Drug Mart</option>
                  </select>
                </div>
              </div>

              {/* Cart List */}
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2 text-xs">
                      <div className="space-y-1 flex-1">
                        <span className="font-semibold text-gray-900 block">{item.name}</span>
                        <span className="text-[10px] text-gray-500">${item.price.toFixed(2)} each</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-250 rounded-lg overflow-hidden h-7">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="px-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-gray-900 text-xs bg-white">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="px-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    Cart is empty. Select medicines to build an invoice.
                  </div>
                )}
              </div>

              {/* Discount selection */}
              <div className="space-y-1.5 border-t border-gray-150 pt-4">
                <Label className="text-[10px] font-bold text-gray-600 uppercase">Wholesale Discount</Label>
                <div className="flex gap-2">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`flex-1 h-8 rounded-lg border text-xs font-bold transition-all ${
                        discountPercent === d
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtotals & Taxes */}
              <div className="space-y-2 border-t border-gray-150 pt-4 text-xs font-semibold">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (18% GST):</span>
                  <span>+${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 border-t border-gray-100 pt-2 font-bold text-sm">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Receipt className="mr-2 h-4.5 w-4.5" /> Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Generated Receipt Invoice Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between border-b border-gray-150 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <h2 className="font-display text-base font-bold text-gray-900">Purchase Receipt</h2>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Invoice ID:</span>
                <span className="font-mono font-bold text-gray-900">{invoiceId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Retailer Account:</span>
                <span className="font-semibold text-gray-950">{selectedRetailer}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Billing Date:</span>
                <span className="text-gray-900">{new Date().toISOString().split("T")[0]}</span>
              </div>

              {/* Items List */}
              <div className="space-y-2 py-2">
                <p className="font-bold text-gray-800 text-[10px] uppercase">Itemized Products</p>
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-600 font-medium">
                      <span>
                        {item.name} <span className="text-gray-400">x{item.qty}</span>
                      </span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-150 pt-3 space-y-1.5 font-semibold text-right">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Tax (18%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-900 font-bold border-t border-gray-100 pt-1">
                  <span>Amount Paid / Due:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center text-green-800 font-semibold flex items-center justify-center gap-2 mt-4">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Invoice printed and stock deducted.</span>
              </div>

              <Button
                onClick={resetCart}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
