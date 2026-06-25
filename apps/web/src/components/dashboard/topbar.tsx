"use client";

import { Search, Bell, Sun, Moon, User, ChevronDown, Plus, Menu, Pill, Zap, ShoppingCart, FileText, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useMemo } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardTopbarProps {
  onMobileMenuToggle: () => void;
}

export function DashboardTopbar({ onMobileMenuToggle }: DashboardTopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasFetchedSearchData, setHasFetchedSearchData] = useState(false);

  // Sync user and theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load user
      const stored = localStorage.getItem("medixpro_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }

      // Load and apply theme
      const savedTheme = localStorage.getItem("medixpro_theme");
      const prefersDark = savedTheme === "dark";
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const loadNotifications = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("medixpro_access_token");
      if (!token) return;
      
      const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");
      
      const base = [
        {
          id: "NTF-001",
          title: "Critical Low Stock Alert",
          description: "Insulin Glargine is currently at 15 units.",
          unread: !readIds.includes("NTF-001"),
        },
        {
          id: "NTF-002",
          title: "Medicines Expiring Soon",
          description: "Prednisone 5mg will expire in 20 days.",
          unread: !readIds.includes("NTF-002"),
        },
        {
          id: "NTF-003",
          title: "New Retailer Purchase Order",
          description: "Medicare Pharmacy placed order ORD-2024-0847.",
          unread: !readIds.includes("NTF-003"),
        },
      ];

      api.get("/api/admin/retailers/pending")
        .then((res) => {
          if (Array.isArray(res.data)) {
            const pending = res.data.map((r: any) => ({
              id: `PEND-${r.id}`,
              title: "Pending Retailer Registration",
              description: `Pharmacy "${r.name}" awaits approval.`,
              unread: !readIds.includes(`PEND-${r.id}`),
            }));
            setNotifications([...pending, ...base]);
          } else {
            setNotifications(base);
          }
        })
        .catch((err) => {
          console.error("Failed to load pending in topbar: ", err);
          setNotifications(base);
        });
    }
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener("notifications-updated", loadNotifications);
    return () => {
      window.removeEventListener("notifications-updated", loadNotifications);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchData = async () => {
    if (hasFetchedSearchData || isLoadingSearch) return;
    setIsLoadingSearch(true);
    try {
      const [medsRes, ordersRes, retailersRes] = await Promise.all([
        api.get("/api/medicines"),
        api.get("/api/orders"),
        api.get("/api/retailers")
      ]);
      setMedicines(Array.isArray(medsRes.data) ? medsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setRetailers(Array.isArray(retailersRes.data) ? retailersRes.data : []);
      setHasFetchedSearchData(true);
    } catch (err) {
      console.error("Failed to fetch search data:", err);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { medicines: [], orders: [], retailers: [] };
    }
    const query = searchQuery.toLowerCase().trim();

    // 1. Medicines
    const matchedMeds = medicines.filter((m: any) => {
      const name = (m.name || "").toLowerCase();
      const generic = (m.generic_name || m.genericName || "").toLowerCase();
      const sku = (m.sku || "").toLowerCase();
      const id = (m.id || "").toLowerCase();
      return name.includes(query) || generic.includes(query) || sku.includes(query) || id.includes(query);
    });

    // 2. Orders (lookup retailer name)
    const retailerMap = new Map(retailers.map((r: any) => [r.id, r.name || ""]));
    const matchedOrders = orders.filter((o: any) => {
      const orderId = (o.id || "").toLowerCase();
      const retailerName = (o.retailer || retailerMap.get(o.retailer_id) || "").toLowerCase();
      return orderId.includes(query) || retailerName.includes(query);
    });

    // 3. Retailers
    const matchedRetailers = retailers.filter((r: any) => {
      const name = (r.name || "").toLowerCase();
      const contact = (r.contact_person || r.contactPerson || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const id = (r.id || "").toLowerCase();
      return name.includes(query) || contact.includes(query) || email.includes(query) || id.includes(query);
    });

    return {
      medicines: matchedMeds.slice(0, 4),
      orders: matchedOrders.slice(0, 4),
      retailers: matchedRetailers.slice(0, 4)
    };
  }, [searchQuery, medicines, orders, retailers]);

  const handleLogout = () => {
    localStorage.removeItem("medixpro_user");
    localStorage.removeItem("medixpro_role");
    window.location.href = "/login";
  };

  const handleNotificationClick = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("medixpro_read_ids", JSON.stringify(readIds));
      window.dispatchEvent(new Event("notifications-updated"));
    }
  };

  const markAllAsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("medixpro_read_ids") || "[]");
    notifications.forEach((n) => {
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem("medixpro_read_ids", JSON.stringify(readIds));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (typeof window !== "undefined") {
      if (nextMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("medixpro_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("medixpro_theme", "light");
      }
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-10 w-10 rounded-full"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        <div ref={searchContainerRef} className="relative max-w-md hidden sm:block">
          <div className="relative">
            {isLoadingSearch ? (
              <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 animate-spin" />
            ) : (
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            )}
            <Input
              placeholder="Search medicines, orders, retailers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                fetchSearchData();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsSearchFocused(false);
                  window.location.href = `/admin/medicines?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="h-10 w-64 rounded-full border-gray-200 bg-gray-50 pl-11 text-sm sm:w-80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          {isSearchFocused && (
            <div className="absolute left-0 top-12 z-50 w-80 sm:w-96 md:w-[450px] rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-left animate-in fade-in slide-in-from-top-2 duration-150 max-h-[450px] overflow-y-auto">
              {isLoadingSearch ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Syncing database records...</p>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="py-4 px-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Guidance</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Type a query to search across catalog inventory, retailer accounts, and purchase orders instantly.
                  </p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Try Searching For</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSearchQuery("Paracetamol")}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50/50 font-medium transition-colors cursor-pointer"
                    >
                      "Paracetamol" (Medicine)
                    </button>
                    <button
                      onClick={() => setSearchQuery("ORD-2024")}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50/50 font-medium transition-colors cursor-pointer"
                    >
                      "ORD-2024" (Order ID)
                    </button>
                    <button
                      onClick={() => setSearchQuery("Medicare")}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50/50 font-medium transition-colors cursor-pointer"
                    >
                      "Medicare" (Retailer Shop)
                    </button>
                  </div>
                </div>
              ) : filteredResults.medicines.length === 0 &&
                filteredResults.orders.length === 0 &&
                filteredResults.retailers.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No results found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">No records matched "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-gray-100">
                  {/* Medicines Group */}
                  {filteredResults.medicines.length > 0 && (
                    <div className="pt-0">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <Pill className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medicines</span>
                      </div>
                      <div className="space-y-0.5">
                        {filteredResults.medicines.map((m: any) => {
                          const medPrice = typeof m.price === "number" ? `$${m.price.toFixed(2)}` : m.price;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setIsSearchFocused(false);
                                window.location.href = `/admin/medicines?search=${encodeURIComponent(m.name)}`;
                              }}
                              className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs flex justify-between items-center"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-gray-900 truncate">{m.name}</p>
                                <p className="text-[10px] text-gray-400 truncate italic">
                                  {m.generic_name || m.genericName || "No generic name"} • {m.sku}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-gray-950">{medPrice}</p>
                                <p className={cn(
                                  "text-[10px] font-medium",
                                  m.stock > 100 ? "text-green-600" : m.stock > 0 ? "text-amber-600" : "text-red-600"
                                )}>
                                  {m.stock} left
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Retailers Group */}
                  {filteredResults.retailers.length > 0 && (
                    <div className="pt-3">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <Building2 className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retailers</span>
                      </div>
                      <div className="space-y-0.5">
                        {filteredResults.retailers.map((r: any) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              window.location.href = `/admin/retailers?search=${encodeURIComponent(r.name)}`;
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs flex justify-between items-center"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-gray-900 truncate">{r.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">
                                Owner: {r.contact_person || r.contactPerson || "N/A"} • {r.email}
                              </p>
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0",
                              r.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" :
                              r.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Group */}
                  {filteredResults.orders.length > 0 && (
                    <div className="pt-3">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</span>
                      </div>
                      <div className="space-y-0.5">
                        {filteredResults.orders.map((o: any) => {
                          const retailerName = retailers.find((r: any) => r.id === o.retailer_id)?.name || "Retailer";
                          const orderAmt = typeof o.total_amount === "number" ? `$${o.total_amount.toFixed(2)}` : o.total_amount;
                          return (
                            <div
                              key={o.id}
                              onClick={() => {
                                setIsSearchFocused(false);
                                window.location.href = `/admin/orders?search=${encodeURIComponent(o.id)}`;
                              }}
                              className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs flex justify-between items-center"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-gray-900 truncate">{o.id}</p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {retailerName}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-gray-950">{orderAmt}</p>
                                <span className={cn(
                                  "text-[10px] font-semibold",
                                  o.status === "Delivered" ? "text-green-600" :
                                  o.status === "Cancelled" ? "text-red-600" :
                                  "text-blue-600"
                                )}>
                                  {o.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 text-center text-[10px] text-gray-400 font-medium">
                    Press <span className="font-bold text-gray-500">Enter</span> to search all medicines
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex">
          <span className="font-medium">{currentDate}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full hidden sm:flex cursor-pointer"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
        </Button>

        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="h-10 w-10 rounded-full relative cursor-pointer animate-in fade-in"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </Button>

          {isNotificationsOpen && (
            <div 
              ref={notificationsRef}
              className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-250 bg-white p-2.5 shadow-lg text-left animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-2">
                <span className="text-xs font-bold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors cursor-pointer text-xs space-y-0.5 mb-1",
                        n.unread ? "bg-blue-50/20 hover:bg-blue-50/40" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("font-bold", n.unread ? "text-gray-950" : "text-gray-700")}>{n.title}</span>
                        {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <p className="text-gray-500 leading-relaxed truncate">{n.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No notifications.
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 mt-2 pt-2 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    const isUserAdmin = user?.role?.toLowerCase() === "admin";
                    window.location.href = isUserAdmin ? "/admin/notifications" : "/admin/notifications";
                  }}
                  className="w-full text-xs font-bold text-blue-600 hover:underline py-1 block cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className="hidden sm:flex h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Quick Action
        </Button>

        {isQuickActionOpen && (
          <div 
            ref={quickActionRef}
            className="absolute right-48 top-14 z-50 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg text-left animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Shortcuts</p>
            </div>
            <button 
              onClick={() => {
                setIsQuickActionOpen(false);
                window.location.href = "/admin/medicines";
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <Pill className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Add Medicine</span>
            </button>
            <button 
              onClick={() => {
                setIsQuickActionOpen(false);
                window.location.href = "/admin/billing";
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Quick Billing (POS)</span>
            </button>
            <button 
              onClick={() => {
                setIsQuickActionOpen(false);
                window.location.href = "/admin/orders";
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Manage Orders</span>
            </button>
            {user?.role?.toLowerCase() === "admin" && (
              <>
                <button 
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    window.location.href = "/admin/invoices";
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Upload Invoice</span>
                </button>
                <button 
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    window.location.href = "/admin/retailers";
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Building2 className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Add Retailer</span>
                </button>
              </>
            )}
          </div>
        )}

        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="hidden items-center gap-3 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-4 sm:flex hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="pr-1 text-left">
            <p className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">{user?.name || "Admin User"}</p>
            <p className="text-xs text-gray-500 max-w-[120px] truncate">{user?.email || "admin@medixpro.com"}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg text-left"
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Role</p>
              <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5 capitalize">
              {user?.role?.toLowerCase() || "Staff"}
              </p>
            </div>
            <button 
              onClick={() => window.location.href = user?.role?.toLowerCase() === "admin" ? "/admin/settings" : "/dashboard/settings"} 
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Account Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
