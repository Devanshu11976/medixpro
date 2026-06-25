"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { WarehouseRack } from "@/components/warehouse-rack";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, ShieldAlert, ThermometerSnowflake, Layers, CheckCircle } from "lucide-react";

type Zone = {
  id: string;
  name: string;
  category: string;
  occupancy: number;
  capacity: number;
  temp: string;
  alert: boolean;
};

const ZONES: Zone[] = [
  { id: "A", name: "Zone A", category: "Primary & Tablets", occupancy: 72, capacity: 5000, temp: "22°C", alert: false },
  { id: "B", name: "Zone B", category: "Antibiotics & Vials", occupancy: 88, capacity: 3000, temp: "18°C", alert: true },
  { id: "C", name: "Zone C", category: "Cold Chain (Insulin/Vaccines)", occupancy: 45, capacity: 1500, temp: "4°C", alert: false },
  { id: "D", name: "Zone D", category: "OTC & General Syrups", occupancy: 61, capacity: 8000, temp: "24°C", alert: false },
];

export default function InventoryPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone>(ZONES[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-6 py-6 lg:px-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Warehouse Inventory Racks</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor physical rack allocations, storage capacities, and cold chain telemetry.</p>
          </div>

          {/* Grid: 3D Visualization + Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Visualizer Panel */}
            <div className="lg:col-span-2 flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">3D Rack Layout - {selectedZone.name}</h2>
                <p className="text-xs text-gray-500">{selectedZone.category} storage structure</p>
              </div>

              {/* The 3D rack component */}
              <div className="my-8 py-6 relative rounded-xl bg-slate-900/5 overflow-hidden flex items-center justify-center min-h-[260px]">
                <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                  RENDERED ISOMETRIC V1.0
                </div>
                <WarehouseRack zoneId={selectedZone.id} />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${
                      selectedZone.id === zone.id
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-gray-200 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    <span className="font-display text-xs font-bold text-gray-900">{zone.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium truncate">{zone.category}</span>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          zone.occupancy > 85 ? "bg-red-500" : zone.occupancy > 70 ? "bg-amber-500" : "bg-green-500"
                        }`}
                        style={{ width: `${zone.occupancy}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone Telemetry Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Zone Statistics</span>
                    {selectedZone.alert && (
                      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 animate-pulse">
                        <ShieldAlert className="h-3.5 w-3.5" /> High Density Alert
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Realtime sensors inside {selectedZone.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">Occupancy</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedZone.occupancy}%</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ThermometerSnowflake className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">Climate Sensor</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedZone.temp}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">Max Storage Capacity</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedZone.capacity.toLocaleString()} units</span>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Shelf Allocation Guide</h4>
                    <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                      <li>Tiers 1 & 2 support standard lightweight pill packages.</li>
                      <li>Tier 3 with scanning beams is optimized for rapid transit items.</li>
                      <li>Cold Storage (Zone C) logs sensor telemetry direct to auditing panels.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <div className="rounded-xl border border-red-150 bg-red-50/50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-red-950">Immediate Reorder Required</h3>
                    <p className="text-xs text-red-700 mt-0.5">The following batches are dangerously close to zero:</p>
                  </div>
                </div>
                <div className="text-xs space-y-2 pt-1.5">
                  <div className="flex justify-between font-medium text-red-950 bg-white border border-red-200 p-2.5 rounded-lg">
                    <span>Insulin Glargine (Zone C)</span>
                    <span className="text-red-600">15/50 left</span>
                  </div>
                  <div className="flex justify-between font-medium text-red-950 bg-white border border-red-200 p-2.5 rounded-lg">
                    <span>Cetirizine 10mg (Zone D)</span>
                    <span className="text-red-600">28/100 left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
