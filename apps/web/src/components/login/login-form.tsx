"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, User, Loader2, X, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View Mode: "login" | "register" | "pending"
  const [mode, setMode] = useState<"login" | "register" | "pending">("login");

  // Retailer Register State
  const [regShopName, setRegShopName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Pending View Details
  const [pendingShop, setPendingShop] = useState("");
  const [pendingOwner, setPendingOwner] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user && user.status === "PENDING") {
      setPendingShop(user.name || "");
      setPendingOwner(user.name || "");
      setMode("pending");
    }
  }, [user]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const session = await login(values.email, values.password);
      if (session.status === "PENDING") {
        setPendingShop(session.name);
        setPendingOwner(session.name);
        setMode("pending");
      } else if (session.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (session.role === "RETAILER") {
        router.push("/retailer-home");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setFormError(err.message || "We couldn't sign you in. Check your details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!regShopName || !regOwnerName || !regEmail || !regPhone || !regAddress || !regPassword) {
      setFormError("All fields are required for registration.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/auth/register", {
        email: regEmail,
        password: regPassword,
        shop_name: regShopName,
        owner_name: regOwnerName,
        phone: regPhone,
        address: regAddress
      });
      
      // Save details for pending card and show it
      setPendingShop(regShopName);
      setPendingOwner(regOwnerName);
      setMode("pending");
      
      // Save credentials but do not redirect to main layout since status is PENDING
      localStorage.setItem("medixpro_access_token", res.data.access_token);
      localStorage.setItem("medixpro_refresh_token", res.data.refresh_token);
      localStorage.setItem("medixpro_user", JSON.stringify({
        email: regEmail,
        name: regOwnerName,
        role: "RETAILER",
        status: "PENDING"
      }));
      localStorage.setItem("medixpro_role", "RETAILER");
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Registration failed. Try again.";
      setFormError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSsoClick = () => {
    setFormError(null);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      "/login/google-sso",
      "GoogleSSO",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=no`
    );
    
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "GOOGLE_SSO_SUCCESS") {
        window.removeEventListener("message", handleMessage);
        const { email, name, token } = event.data;
        
        try {
          setIsSubmitting(true);
          const { session, profile_complete } = await loginWithGoogle(email, name, token);
          
          if (!profile_complete) {
            router.push("/login/complete-profile");
          } else {
            if (session.status === "PENDING") {
              setPendingShop(session.name);
              setPendingOwner(session.name);
              setMode("pending");
            } else if (session.status === "ACTIVE") {
              router.push("/retailer-home");
            }
          }
        } catch (err: any) {
          setFormError(err.message || "Google authentication failed.");
        } finally {
          setIsSubmitting(false);
        }
      } else if (event.data && event.data.type === "GOOGLE_SSO_ERROR") {
        window.removeEventListener("message", handleMessage);
        setFormError(event.data.error || "Google authentication failed.");
        setIsSubmitting(false);
      }
    };
    
    window.addEventListener("message", handleMessage);
  };

  if (mode === "pending") {
    return (
      <div className="rounded-lg border border-border bg-gradient-to-b from-white to-[#FBFEFE] p-6 pb-5 shadow-[0_16px_34px_-18px_rgba(14,63,76,0.35)] text-center animate-in fade-in">
        <div className="mb-5 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
            <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Awaiting Admin Approval</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            Your retailer registration details have been submitted successfully. An administrator is currently reviewing your application.
          </p>
        </div>
        <div className="rounded-lg bg-amber-50/50 border border-amber-100 p-4 text-xs text-left mb-5 space-y-2 text-amber-800">
          <p><strong>Shop Name:</strong> {pendingShop}</p>
          <p><strong>Owner Name:</strong> {pendingOwner}</p>
          <p><strong>Application:</strong> PENDING</p>
        </div>
        <Button onClick={() => setMode("login")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer h-10">
          Back to Login
        </Button>
      </div>
    );
  }

  if (mode === "register") {
    return (
      <div className="rounded-lg border border-border bg-gradient-to-b from-white to-[#FBFEFE] p-6 pb-5 shadow-[0_16px_34px_-18px_rgba(14,63,76,0.35)] animate-in fade-in">
        <div className="mb-5 flex flex-col items-center">
          <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D7E6E4] to-[#B9CDCB] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]">
            <User className="h-6 w-6 text-[#6E8A87]" strokeWidth={1.8} />
          </div>
          <span className="text-sm font-semibold text-gray-900">Retailer Sign Up</span>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" placeholder="e.g. HealthMed Pharmacy" value={regShopName} onChange={(e) => setRegShopName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" placeholder="e.g. John Doe" value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="regEmail">Email Address</Label>
            <Input id="regEmail" type="email" placeholder="retailer@domain.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="regPhone">Mobile Number</Label>
            <Input id="regPhone" placeholder="e.g. +91 98765 43210" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="regAddress">Shop Address</Label>
            <Input id="regAddress" placeholder="e.g. Street 4, Sector B" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="regPassword">Password</Label>
            <Input id="regPassword" type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
          </div>

          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full h-10 mt-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering…
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have a retailer account?{" "}
          <button onClick={() => setMode("login")} className="font-bold text-primary hover:underline cursor-pointer">
            Sign In
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-gradient-to-b from-white to-[#FBFEFE] p-6 pb-5 shadow-[0_16px_34px_-18px_rgba(14,63,76,0.35)]">
      <div className="mb-5 flex flex-col items-center">
        <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D7E6E4] to-[#B9CDCB] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_6px_14px_rgba(14,63,76,0.18)]">
          <User className="h-6 w-6 text-[#6E8A87]" strokeWidth={1.8} />
        </div>
        <span className="text-sm font-semibold">Sign in to your account</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3.5 space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              className="pl-9"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-1.5 space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-9 pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="mb-4 flex justify-end">
          <a href="#" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        {formError && (
          <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mb-4 w-full h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground mb-1">
          <span className="h-px flex-1 bg-border" />
          Retailer SSO Login
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleGoogleSsoClick} 
          className="w-full text-foreground cursor-pointer flex items-center justify-center gap-2 h-10 border-gray-200 hover:bg-gray-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google (Retailer Only)
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        New to Medixpro?{" "}
        <button onClick={() => setMode("register")} className="font-bold text-primary hover:underline cursor-pointer">
          Create an account
        </button>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H24v7.5h11.3C34 32.9 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.2-1.8 13.9-5l-6.4-5.4C29.5 35.4 26.9 36 24 36c-5.5 0-10.1-3.1-11.4-7.6l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H24v7.5h11.3c-.6 3-2.2 5.4-4.4 7.1l6.4 5.4C40.8 37.4 44 31.6 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
