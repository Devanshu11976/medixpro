"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import {
  FileText,
  Upload,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";

type Invoice = {
  id: string;
  supplierName: string;
  amount: string;
  uploadedDate: string;
  status: "Pending Review" | "Processing" | "Approved";
  itemsCount: number;
};

const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-2024-0342", supplierName: "PharmaCorp Ltd", amount: "$45,230.00", uploadedDate: "2026-06-25", status: "Pending Review", itemsCount: 12 },
  { id: "INV-2024-0341", supplierName: "MediSupply Inc", amount: "$28,450.00", uploadedDate: "2026-06-25", status: "Processing", itemsCount: 8 },
  { id: "INV-2024-0340", supplierName: "HealthDistributors", amount: "$32,100.00", uploadedDate: "2026-06-24", status: "Approved", itemsCount: 15 },
];

export default function InvoicesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"idle" | "uploading" | "scanning" | "extracted" | "synced">("idle");
  const [fileName, setFileName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [amount, setAmount] = useState(0);

  // Extracted item mocks from OCR
  const [extractedItems, setExtractedItems] = useState<Array<{ name: string; qty: number; price: number; batch: string }>>([]);

  const fetchInvoices = () => {
    api.get("/api/invoices")
      .then((res) => {
        const formatted = res.data.map((inv: any) => ({
          id: inv.id,
          supplierName: inv.supplier_name,
          amount: `$${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          uploadedDate: inv.uploaded_at.split("T")[0],
          status: inv.status,
          itemsCount: 0
        }));
        setInvoices(formatted);
      })
      .catch((err) => console.error("Failed to fetch invoices:", err));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileName(file.name);
    setStep("uploading");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      setStep("scanning");
      setIsProcessing(true);
      
      const response = await api.post("/api/invoices/ocr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { supplier_name, amount, items } = response.data;
      setSupplierName(supplier_name);
      setAmount(amount);
      setExtractedItems(items);
      setStep("extracted");
    } catch (error) {
      console.error("Failed to parse invoice:", error);
      alert("Failed to parse the uploaded invoice. Using local mock/fallback.");
      // Fallback
      setSupplierName("PharmaCorp Ltd");
      setAmount(25000.0);
      setExtractedItems([
        { name: "Paracetamol 500mg", qty: 2500, price: 2.50, batch: "BTH-2026-0902" },
        { name: "Amoxicillin 250mg", qty: 1200, price: 8.00, batch: "BTH-2026-0903" },
      ]);
      setStep("extracted");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveSync = async () => {
    if (extractedItems.length === 0) return;

    try {
      setStep("uploading"); // Show loader
      await api.post("/api/invoices/sync", {
        supplier_name: supplierName,
        amount: amount,
        items: extractedItems,
      });

      setStep("synced");
      fetchInvoices(); // Refresh invoices list
      
      setTimeout(() => {
        setStep("idle");
        setFileName("");
        setExtractedItems([]);
      }, 2000);
    } catch (error) {
      console.error("Failed to sync invoice:", error);
      alert("Failed to sync invoice with database.");
      setStep("extracted");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">OCR Supplier Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">Scan paper invoices into digital orders automatically using Groq LLaMA 3 & PaddleOCR vision.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* OCR Scanner Interactive Panel */}
            <div className="lg:col-span-2 rounded-xl border border-gray-250 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">AI Invoice Upload Hub</h2>
                <p className="text-xs text-gray-500">Select files to extract product batches, quantity counts, and price lists.</p>
              </div>

              {/* Upload Dropzone and scan progress */}
              <div className="my-6 relative border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
                {step === "idle" && (
                  <label className="flex flex-col items-center justify-center cursor-pointer space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-gray-800">Upload invoice image or PDF</span>
                      <span className="block text-[11px] text-gray-400 mt-1">Supports PNG, JPG, PDF up to 10MB</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleRealUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {step === "uploading" && (
                  <div className="text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-gray-800">Uploading {fileName}...</p>
                  </div>
                )}

                {step === "scanning" && (
                  <div className="w-full flex flex-col items-center justify-center space-y-4 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 animate-pulse">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-850">Processing with OCR & Groq AI...</p>
                      <p className="text-[11px] text-gray-400 mt-1">Running document alignments and extracting batch details</p>
                    </div>

                    {/* Animated horizontal scanner bar */}
                    <div className="w-full max-w-sm h-1.5 bg-gray-150 rounded-full overflow-hidden relative">
                      <div className="h-full bg-blue-600 rounded-full animate-scan" style={{ width: "100%" }} />
                    </div>
                  </div>
                )}

                {step === "extracted" && (
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
                      <Zap className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Extracted Invoiced Items</h3>
                        <p className="text-[10px] text-gray-400">File: {fileName}</p>
                      </div>
                    </div>

                    {/* Table of extracted items */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-150 bg-gray-50 text-gray-600 uppercase font-semibold">
                            <th className="py-2 px-3">Medicine Name</th>
                            <th className="py-2 px-3">Batch ID</th>
                            <th className="py-2 px-3">Quantity</th>
                            <th className="py-2 px-3">Unit Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{item.name}</td>
                              <td className="py-2.5 px-3 font-mono text-gray-500">{item.batch}</td>
                              <td className="py-2.5 px-3 font-bold text-gray-900">{item.qty.toLocaleString()} units</td>
                              <td className="py-2.5 px-3 font-medium text-gray-700">
                                {typeof item.price === "number" ? `$${item.price.toFixed(2)}` : item.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep("idle");
                          setFileName("");
                        }}
                        className="h-10 text-slate-700"
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={handleApproveSync}
                        className="h-10 bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        Approve & Sync Inventory
                      </Button>
                    </div>
                  </div>
                )}

                {step === "synced" && (
                  <div className="text-center space-y-3">
                    <CheckCircle className="h-12 w-12 text-green-600 animate-bounce mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Inventory Synchronized!</p>
                      <p className="text-xs text-gray-400 mt-1">Batch records added and stock levels updated successfully.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <span>
                  The OCR scanner leverages <strong>PaddleOCR</strong> for structural alignment and layout reading, coupled with <strong>Groq LLaMA 3</strong> to perform medical-terminology checking and fuzzy reconciliation against catalog SKUs.
                </span>
              </div>
            </div>

            {/* Invoices Review Ledger */}
            <div className="rounded-xl border border-gray-250 bg-white p-6 shadow-sm flex flex-col">
              <h2 className="font-display text-base font-bold text-gray-900 mb-4">Invoices Audit Logs</h2>
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[380px] scrollbar-hide pr-1">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-lg border border-gray-150 bg-gray-50 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                      </div>
                      <span className="block text-gray-600 font-semibold">{inv.supplierName}</span>
                      <span className="block text-[10px] text-gray-400">{inv.uploadedDate} • {inv.itemsCount} items</span>
                    </div>

                    <div className="text-right space-y-1.5">
                      <span className="block font-bold text-gray-900">{inv.amount}</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "Processing"
                            ? "bg-blue-100 text-blue-700 animate-pulse"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
