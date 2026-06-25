"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, CheckCircle, Save } from "lucide-react";

export default function StaffSettingsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  
  // Settings Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medixpro_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
        } catch {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && user) {
      const updatedUser = { ...user, name, email };
      localStorage.setItem("medixpro_user", JSON.stringify(updatedUser));
      
      // Notify change
      setToastMessage("Settings updated successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="lg:ml-[260px]">
        <DashboardTopbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Configure your personal profile details and password.</p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Settings Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-gray-900">Profile Details</h3>
                    <p className="text-xs text-gray-500">Update your primary identity settings.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input 
                      id="fullname" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="emailaddress">Email Address</Label>
                    <Input 
                      id="emailaddress" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Password / Security Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-gray-900">Security Credentials</h3>
                    <p className="text-xs text-gray-500">Change your sign-in details.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="currpass">Current Password</Label>
                    <Input 
                      id="currpass" 
                      type="password" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newpass">New Password</Label>
                    <Input 
                      id="newpass" 
                      type="password" 
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Account Overview & Save Actions */}
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xl">
                  {name.substring(0, 2).toUpperCase() || "ST"}
                </div>
                <h4 className="font-display font-bold text-gray-900 text-base">{name || "Staff User"}</h4>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role || "Staff"}
                </span>

                <div className="mt-5 border-t border-gray-100 pt-4 text-left space-y-2">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Primary Email</span>
                    <span className="text-xs text-gray-700 font-semibold">{email || "staff@medixpro.com"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Permissions Status</span>
                    <span className="text-xs text-emerald-600 font-bold">Active Operator</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                <Save className="mr-2 h-4.5 w-4.5" />
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Save Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="h-4.5 w-4.5 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
