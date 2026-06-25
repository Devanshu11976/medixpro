"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Building2,
  Phone,
  Mail,
  User,
  CreditCard,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import api from "@/lib/api";

type Retailer = {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  balance: number;
  status: "ACTIVE" | "PENDING" | "DISABLED";
};

export default function RetailersPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [pendingRetailers, setPendingRetailers] = useState<Retailer[]>([]);
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const fetchData = async () => {
    if (!localStorage.getItem("medixpro_access_token")) return;
    setLoading(true);
    try {
      // Get all active / disabled retailers
      const resAll = await api.get("/api/retailers");
      // Split them by status
      const all = resAll.data as Retailer[];
      
      const activeList = all.filter(r => r.status === "ACTIVE" || r.status === "DISABLED");
      setRetailers(activeList);
      
      // Get pending retailers from approval queue
      const resPending = await api.get("/api/admin/retailers/pending");
      setPendingRetailers(resPending.data);
    } catch (err) {
      console.error("Failed to load retailers: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      const tab = params.get("tab");
      if (query) setSearch(query);
      if (tab === "pending") setActiveTab("pending");
      else if (tab === "active") setActiveTab("active");
    }
  }, []);

  const handleAddRetailerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRetailer.name || !newRetailer.email || !newRetailer.password) return;

    try {
      // Register a Retailer account (role RETAILER, starts in PENDING status)
      await api.post("/api/auth/register", {
        email: newRetailer.email,
        password: newRetailer.password,
        shop_name: newRetailer.name,
        owner_name: newRetailer.contactPerson,
        phone: newRetailer.phone,
        address: newRetailer.address,
      });

      setToastMessage("Retailer account created and queued for approval!");
      setIsModalOpen(false);
      
      // Reset form
      setNewRetailer({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });
      
      fetchData();
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to create retailer account.";
      alert(detail);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/admin/retailers/${id}/approve`);
      setToastMessage("Retailer approved successfully!");
      fetchData();
    } catch (err) {
      alert("Failed to approve retailer.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/api/admin/retailers/${id}/reject`);
      setToastMessage("Retailer rejected and disabled.");
      fetchData();
    } catch (err) {
      alert("Failed to reject retailer.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.post(`/api/admin/retailers/${id}/toggle-status`);
      setToastMessage("Retailer status toggled successfully!");
      fetchData();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  // Filters
  const filteredActive = retailers.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPending = pendingRetailers.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Partner Retailers</h1>
              <p className="mt-1 text-sm text-gray-500">Manage pharmacy ledgers, verify coordinates, and approve pending registrations.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="h-10 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              <Plus className="mr-1.5 h-4 w-4" /> Add Retailer
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 transition-all ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Active Partners ({filteredActive.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Pending Approvals ({filteredPending.length})
              {pendingRetailers.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {pendingRetailers.length}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by Pharmacy Name or Owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full bg-white border-gray-200"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading retailer registry...</div>
          ) : activeTab === "active" ? (
            /* Active / Disabled Cards */
            filteredActive.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl bg-white text-gray-400">
                No active partner retailers found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredActive.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    {/* Status pill */}
                    <div className="absolute right-4 top-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          r.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {r.status.toLowerCase()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-gray-900 text-base leading-tight">{r.name}</h2>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{r.id}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{r.contact_person}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{r.phone}</span>
                        </div>
                        {r.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{r.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Ledger Balance */}
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-slate-500" />
                          <span className="text-xs text-slate-500 font-medium">Invoice Debt:</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-slate-900">${r.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Suspend Toggle */}
                    <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-end">
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        className={`text-xs font-bold hover:underline cursor-pointer ${
                          r.status === "ACTIVE" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {r.status === "ACTIVE" ? "Suspend Account" : "Authorize Account"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Pending Queue Cards */
            filteredPending.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl bg-white text-gray-400">
                No pending registrations awaiting approval.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in">
                {filteredPending.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-xl border border-amber-200 bg-white p-5 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                          <Building2 className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-gray-900 text-base leading-tight">{r.name}</h2>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{r.id}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{r.contact_person}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{r.phone}</span>
                        </div>
                        {r.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{r.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approval Operations */}
                    <div className="mt-5 border-t border-gray-100 pt-4 flex gap-2.5 justify-end">
                      <button
                        onClick={() => handleReject(r.id)}
                        className="text-xs font-bold text-red-650 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Approve Partner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Add Retailer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-gray-900">Add New Partner Pharmacy</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRetailerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Pharmacy Name *</label>
                <Input
                  required
                  placeholder="e.g. Wellness Drugstore Inc"
                  value={newRetailer.name}
                  onChange={(e) => setNewRetailer({ ...newRetailer, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Contact pharmacist *</label>
                <Input
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={newRetailer.contactPerson}
                  onChange={(e) => setNewRetailer({ ...newRetailer, contactPerson: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. billing@wellness.com"
                  value={newRetailer.email}
                  onChange={(e) => setNewRetailer({ ...newRetailer, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Shop Address</label>
                <Input
                  placeholder="e.g. Sector 5, Greater Noida"
                  value={newRetailer.address}
                  onChange={(e) => setNewRetailer({ ...newRetailer, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Phone Number</label>
                  <Input
                    placeholder="e.g. +91 98765 43210"
                    value={newRetailer.phone}
                    onChange={(e) => setNewRetailer({ ...newRetailer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Set Password *</label>
                  <Input
                    required
                    type="password"
                    placeholder="Set local password"
                    value={newRetailer.password}
                    onChange={(e) => setNewRetailer({ ...newRetailer, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 text-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-10 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                  Save Retailer Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="h-4.5 w-4.5 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
