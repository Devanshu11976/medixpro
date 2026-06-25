"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Clock, Loader2, ArrowRight } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, completeProfile, logout } = useAuth();
  
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user) {
      setOwnerName(user.name || "");
      if (user.status === "PENDING") {
        setIsPending(true);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!shopName || !ownerName || !phone || !address) {
      setError("Please fill in all profile fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completeProfile(shopName, ownerName, phone, address);
      setIsPending(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit profile details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-3 sm:px-5 py-8">
        <div className="w-full max-w-[460px] rounded-2xl bg-white border border-gray-100 p-5 sm:p-8 shadow-xl text-center flex flex-col justify-between min-h-[400px]">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
              <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
            </div>
            <h1 className="font-display text-xl font-bold text-gray-900 leading-tight">Your account is awaiting admin approval</h1>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              We have received your retailer profile details. An administrator is currently verifying your shop parameters. You will receive access once approved.
            </p>
          </div>
          
          <div className="rounded-xl bg-amber-50/50 border border-amber-100/50 p-4 text-xs text-left mb-6 space-y-1.5 text-amber-800">
            <p><strong>Shop Name:</strong> {shopName || "Registered Shop"}</p>
            <p><strong>Owner Name:</strong> {ownerName || "Retailer Partner"}</p>
            <p><strong>Status:</strong> PENDING APPROVAL</p>
          </div>
          
          <Button onClick={logout} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 cursor-pointer">
            Return to Login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-3 sm:px-5 py-8">
      <div className="w-full max-w-[480px] rounded-2xl bg-white border border-gray-100 p-5 sm:p-8 shadow-xl text-left">
        <div className="mb-6 flex flex-col items-start border-b border-gray-100 pb-4">
          <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-xs">
            <User className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">Complete Retailer Profile</h1>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Please provide your wholesale pharmacy coordinates to request access to the wholesaler dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shop">Shop Name</Label>
            <Input id="shop" placeholder="e.g. Apex Pharma Store" value={shopName} onChange={(e) => setShopName(e.target.value)} className="bg-white border-gray-200" />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="owner">Owner / Contact Name</Label>
            <Input id="owner" placeholder="e.g. Devanshu Sharma" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="bg-white border-gray-200" />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile / Phone Number</Label>
            <Input id="mobile" placeholder="e.g. +91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-gray-200" />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="addr">Shop Address</Label>
            <Input id="addr" placeholder="e.g. Sector 5, Industrial Area, Noida" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-white border-gray-200" />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={logout} className="flex-1 cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving…
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
