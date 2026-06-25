"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export interface UserSession {
  email: string;
  name: string;
  role: "ADMIN" | "WORKER" | "RETAILER";
  status: "ACTIVE" | "PENDING" | "DISABLED";
  token?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Set default auth headers on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("medixpro_access_token");
    const storedUser = localStorage.getItem("medixpro_user");
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Background verify session
        api.get("/api/auth/me")
          .then((res) => {
            const freshUser = {
              email: res.data.email,
              name: res.data.name,
              role: res.data.role,
              status: res.data.status
            };
            setUser(freshUser);
            localStorage.setItem("medixpro_user", JSON.stringify(freshUser));
            localStorage.setItem("medixpro_role", res.data.role);
          })
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              logout();
            }
          });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { access_token, refresh_token, role, status, name } = response.data;
      
      localStorage.setItem("medixpro_access_token", access_token);
      localStorage.setItem("medixpro_refresh_token", refresh_token);
      
      const session: UserSession = { email, name, role, status };
      localStorage.setItem("medixpro_user", JSON.stringify(session));
      localStorage.setItem("medixpro_role", role);
      
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      setUser(session);
      setLoading(false);
      return session;
    } catch (err: any) {
      setLoading(false);
      const detail = err.response?.data?.detail || "Invalid email or password";
      throw new Error(detail);
    }
  };

  const loginWithGoogle = async (email: string, name: string, googleToken: string) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/google", { email, name, google_token: googleToken });
      const { access_token, refresh_token, role, status, profile_complete } = response.data;
      
      localStorage.setItem("medixpro_access_token", access_token);
      localStorage.setItem("medixpro_refresh_token", refresh_token);
      
      const session: UserSession = { email, name, role, status };
      localStorage.setItem("medixpro_user", JSON.stringify(session));
      localStorage.setItem("medixpro_role", role);
      
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      setUser(session);
      setLoading(false);
      
      return { session, profile_complete };
    } catch (err: any) {
      setLoading(false);
      const detail = err.response?.data?.detail || "Google authentication failed";
      throw new Error(detail);
    }
  };

  const completeProfile = async (shopName: string, ownerName: string, phone: string, address: string) => {
    setLoading(true);
    try {
      await api.post("/api/auth/complete-profile", {
        shop_name: shopName,
        owner_name: ownerName,
        phone,
        address
      });
      
      // Update local status to PENDING
      if (user) {
        const updated = { ...user, status: "PENDING" as const };
        setUser(updated);
        localStorage.setItem("medixpro_user", JSON.stringify(updated));
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      const detail = err.response?.data?.detail || "Failed to complete profile details";
      throw new Error(detail);
    }
  };

  const logout = () => {
    localStorage.removeItem("medixpro_access_token");
    localStorage.removeItem("medixpro_refresh_token");
    localStorage.removeItem("medixpro_user");
    localStorage.removeItem("medixpro_role");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    role: user?.role || null,
    status: user?.status || null,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithGoogle,
    completeProfile,
    logout,
  };
}
