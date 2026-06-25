"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from "lucide-react";

type Medicine = {
  id: string;
  name: string;
  genericName: string;
  sku: string;
  stock: number;
  price: string;
  expiryDate: string;
  rackLocation: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "MED-001",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    sku: "PRC-500-100",
    stock: 1200,
    price: "$5.00",
    expiryDate: "2026-12-15",
    rackLocation: "Rack A - Shelf 2",
    status: "In Stock",
  },
  {
    id: "MED-002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin Trihydrate",
    sku: "AMX-250-50",
    stock: 45,
    price: "$12.50",
    expiryDate: "2026-08-20",
    rackLocation: "Rack B - Shelf 1",
    status: "Low Stock",
  },
  {
    id: "MED-003",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    sku: "OMP-20-30",
    stock: 850,
    price: "$8.20",
    expiryDate: "2027-02-10",
    rackLocation: "Rack C - Shelf 4",
    status: "In Stock",
  },
  {
    id: "MED-004",
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    sku: "MTF-500-100",
    stock: 0,
    price: "$6.00",
    expiryDate: "2025-11-30",
    rackLocation: "Rack A - Shelf 1",
    status: "Out of Stock",
  },
  {
    id: "MED-005",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    sku: "IBU-400-60",
    stock: 15,
    price: "$4.80",
    expiryDate: "2026-06-15",
    rackLocation: "Rack B - Shelf 3",
    status: "Low Stock",
  },
  {
    id: "MED-006",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Dihydrochloride",
    sku: "CTR-10-100",
    stock: 1400,
    price: "$3.50",
    expiryDate: "2027-05-18",
    rackLocation: "Rack D - Shelf 2",
    status: "In Stock",
  },
];

export default function MedicinesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) setSearch(query);
    }
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    genericName: "",
    sku: "",
    stock: "",
    price: "",
    expiryDate: "",
    rackLocation: "",
  });

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.name || !newMedicine.price || !newMedicine.stock) return;

    const stockNum = parseInt(newMedicine.stock) || 0;
    let status: Medicine["status"] = "In Stock";
    if (stockNum === 0) status = "Out of Stock";
    else if (stockNum < 50) status = "Low Stock";

    const added: Medicine = {
      id: `MED-00${medicines.length + 1}`,
      name: newMedicine.name,
      genericName: newMedicine.genericName || "N/A",
      sku: newMedicine.sku || `SKU-${Math.random().toString(36).substring(3, 8).toUpperCase()}`,
      stock: stockNum,
      price: newMedicine.price.startsWith("$") ? newMedicine.price : `$${newMedicine.price}`,
      expiryDate: newMedicine.expiryDate || "2027-01-01",
      rackLocation: newMedicine.rackLocation || "General Area",
      status,
    };

    setMedicines([added, ...medicines]);
    setIsModalOpen(false);
    setNewMedicine({
      name: "",
      genericName: "",
      sku: "",
      stock: "",
      price: "",
      expiryDate: "",
      rackLocation: "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      setMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "All" || m.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Medicines Inventory</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your central medicine catalog, track pricing, and check shelf locations.</p>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" className="h-10 text-slate-700 bg-white">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Export CSV
              </Button>
              <Button onClick={() => setIsModalOpen(true)} className="h-10 bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="mr-1.5 h-4 w-4" /> Add Medicine
              </Button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by medicine name, generic name, or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              {(["All", "In Stock", "Low Stock", "Out of Stock"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-500">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Medicine ID / SKU</th>
                    <th className="px-6 py-4">Name / Generic</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Unit Price</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Rack Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{med.id}</span>
                          <span className="block text-xs text-gray-400">{med.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 block">{med.name}</span>
                          <span className="text-xs text-gray-500 italic">{med.genericName}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-950">
                          {med.stock.toLocaleString()} units
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{med.price}</td>
                        <td className="px-6 py-4 text-gray-600">{med.expiryDate}</td>
                        <td className="px-6 py-4 text-gray-600">{med.rackLocation}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              med.status === "In Stock"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : med.status === "Low Stock"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {med.status === "In Stock" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {med.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(med.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No medicines matched your query. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-gray-900">Add New Medicine</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Medicine Name *</label>
                  <Input
                    required
                    placeholder="e.g. Lipitor 10mg"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Generic Name</label>
                  <Input
                    placeholder="e.g. Atorvastatin"
                    value={newMedicine.genericName}
                    onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">SKU / Code</label>
                  <Input
                    placeholder="e.g. LPT-10-100"
                    value={newMedicine.sku}
                    onChange={(e) => setNewMedicine({ ...newMedicine, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Initial Stock *</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 500"
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Unit Price ($) *</label>
                  <Input
                    required
                    placeholder="e.g. 15.00"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Expiry Date</label>
                  <Input
                    type="date"
                    value={newMedicine.expiryDate}
                    onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Warehouse Rack Location</label>
                <Input
                  placeholder="e.g. Rack C - Shelf 3"
                  value={newMedicine.rackLocation}
                  onChange={(e) => setNewMedicine({ ...newMedicine, rackLocation: e.target.value })}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 text-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-10 bg-blue-600 text-white hover:bg-blue-700">
                  Save Medicine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
