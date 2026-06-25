import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/login/login-form";
import {
  BrandChip,
  FeaturePills,
  WarehouseScene,
} from "@/components/login/warehouse-scene";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure sign-in to Medixpro wholesale medical ERP system. Manage your inventory, orders, and retailer accounts.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <div className="grid w-full max-w-[1180px] overflow-hidden rounded-[22px] bg-card shadow-[0_1px_1px_rgba(14,63,76,0.04),0_8px_24px_rgba(14,63,76,0.10),0_30px_60px_-20px_rgba(14,63,76,0.28)] md:grid-cols-[1.05fr_1fr]">
        {/* Left: illustrated scene */}
        <div className="relative flex min-h-[660px] flex-col justify-between bg-[linear-gradient(160deg,#0E3F4C_0%,#136D7F_58%,#1A8B96_100%)] p-7 pb-7">
          <div
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.5)_40%,transparent_90%)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <BrandChip />
          </div>

          <div className="relative z-10">
            <WarehouseScene />
          </div>

          <div className="relative z-10 text-white">
            <h1 className="mb-1.5 font-display text-[27px] font-bold leading-tight tracking-tight">
              Run your wholesale floor from one screen.
            </h1>
            <p className="mb-4.5 max-w-[380px] text-[14.5px] leading-relaxed text-white/80">
              Track stock by batch and expiry, scan invoices straight into
              orders, and keep every retailer account in sync.
            </p>
            <FeaturePills />
          </div>
        </div>

        {/* Right: login form */}
        <div className="flex flex-col p-8 pb-7 md:p-10 md:pb-8">
          <div className="mb-4 flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal-mid/20 bg-brand-mint px-3 py-1.5 text-xs font-semibold text-brand-teal-mid">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure sign-in
            </span>
          </div>

          <h2 className="mb-1.5 font-display text-2xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in to manage stock, orders, and your retailer network.
          </p>

          <LoginForm />

          <div className="mt-5 text-center">
            <a href="#" className="text-xs font-semibold text-primary hover:underline">
              Help center
            </a>
            <p className="mt-2 text-[11.5px] text-muted-foreground/70">
              © 2026 MedLogix ERP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
