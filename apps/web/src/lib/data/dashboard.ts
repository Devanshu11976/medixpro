export type StatCard = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  color: "blue" | "green" | "orange" | "red" | "purple";
  icon: "sales" | "orders" | "medicines" | "stock" | "expiring" | "retailers" | "inventory" | "added";
};

export const statCards: StatCard[] = [
  {
    id: "today-sales",
    label: "Today's Sales",
    value: "$24,580",
    change: "+12.5% vs yesterday",
    trend: "up",
    color: "blue",
    icon: "sales",
  },
  {
    id: "pending-orders",
    label: "Pending Orders",
    value: "18",
    change: "+3 vs yesterday",
    trend: "up",
    color: "orange",
    icon: "orders",
  },
  {
    id: "total-medicines",
    label: "Total Medicines",
    value: "2,847",
    change: "+15 this week",
    trend: "up",
    color: "green",
    icon: "medicines",
  },
  {
    id: "low-stock",
    label: "Low Stock Medicines",
    value: "23",
    change: "-5 from yesterday",
    trend: "down",
    color: "red",
    icon: "stock",
  },
  {
    id: "expiring-soon",
    label: "Expiring Medicines",
    value: "12",
    change: "Within 30 days",
    trend: "neutral",
    color: "orange",
    icon: "expiring",
  },
  {
    id: "retailers",
    label: "Active Retailers",
    value: "156",
    change: "+2 this month",
    trend: "up",
    color: "purple",
    icon: "retailers",
  },
  {
    id: "inventory-value",
    label: "Inventory Value",
    value: "$1.2M",
    change: "+3.2% this month",
    trend: "up",
    color: "blue",
    icon: "inventory",
  },
  {
    id: "stock-added",
    label: "Stock Added Today",
    value: "845",
    change: "+120 vs yesterday",
    trend: "up",
    color: "green",
    icon: "added",
  },
];

// Daily Sales Chart Data
export const dailySales = [
  { day: "Mon", value: 24500 },
  { day: "Tue", value: 31200 },
  { day: "Wed", value: 28900 },
  { day: "Thu", value: 35600 },
  { day: "Fri", value: 42100 },
  { day: "Sat", value: 19800 },
  { day: "Sun", value: 24580 },
];

// Monthly Revenue Chart Data
export const monthlyRevenue = [
  { month: "Jan", value: 680000 },
  { month: "Feb", value: 720000 },
  { month: "Mar", value: 890000 },
  { month: "Apr", value: 750000 },
  { month: "May", value: 920000 },
  { month: "Jun", value: 880000 },
];

// Top Selling Medicines
export const topSellingMedicines = [
  { name: "Paracetamol 500mg", sales: 12450, revenue: 62250 },
  { name: "Amoxicillin 250mg", sales: 8920, revenue: 89200 },
  { name: "Omeprazole 20mg", sales: 7650, revenue: 53550 },
  { name: "Metformin 500mg", sales: 6890, revenue: 68900 },
  { name: "Ibuprofen 400mg", sales: 5420, revenue: 27100 },
];

// Order Status Distribution
export const orderStatusDistribution = [
  { status: "Pending", value: 18, color: "#f59e0b" },
  { status: "Processing", value: 24, color: "#3b82f6" },
  { status: "Shipped", value: 32, color: "#8b5cf6" },
  { status: "Delivered", value: 156, color: "#10b981" },
  { status: "Cancelled", value: 5, color: "#ef4444" },
];

// Low Stock Trend
export const lowStockTrend = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 38 },
  { month: "Mar", value: 42 },
  { month: "Apr", value: 35 },
  { month: "May", value: 28 },
  { month: "Jun", value: 23 },
];

// Purchase vs Sales
export const purchaseVsSales = [
  { month: "Jan", purchase: 520000, sales: 680000 },
  { month: "Feb", purchase: 580000, sales: 720000 },
  { month: "Mar", purchase: 650000, sales: 890000 },
  { month: "Apr", purchase: 590000, sales: 750000 },
  { month: "May", purchase: 720000, sales: 920000 },
  { month: "Jun", purchase: 680000, sales: 880000 },
];

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type Order = {
  orderId: string;
  retailer: string;
  medicines: string;
  items: number;
  status: OrderStatus;
  amount: string;
  date: string;
};

export const recentOrders: Order[] = [
  {
    orderId: "ORD-2024-0847",
    retailer: "MediCare Pharmacy",
    medicines: "Paracetamol, Amoxicillin, Omeprazole",
    items: 150,
    status: "Pending",
    amount: "$2,450.00",
    date: "2024-06-25",
  },
  {
    orderId: "ORD-2024-0846",
    retailer: "HealthPlus Stores",
    medicines: "Metformin, Ibuprofen, Vitamin C",
    items: 200,
    status: "Processing",
    amount: "$3,120.00",
    date: "2024-06-25",
  },
  {
    orderId: "ORD-2024-0845",
    retailer: "City Drug Mart",
    medicines: "Aspirin, Antacid, Cough Syrup",
    items: 85,
    status: "Shipped",
    amount: "$1,890.00",
    date: "2024-06-24",
  },
  {
    orderId: "ORD-2024-0844",
    retailer: "Wellness Pharmacy",
    medicines: "Antibiotics, Pain Relief",
    items: 120,
    status: "Delivered",
    amount: "$2,780.00",
    date: "2024-06-24",
  },
  {
    orderId: "ORD-2024-0843",
    retailer: "QuickMeds",
    medicines: "Diabetes Kit, Insulin",
    items: 45,
    status: "Delivered",
    amount: "$4,560.00",
    date: "2024-06-23",
  },
];

export type StockUpdate = {
  medicine: string;
  batch: string;
  stockAdded: number;
  supplier: string;
  updatedBy: string;
  time: string;
};

export const recentStockUpdates: StockUpdate[] = [
  {
    medicine: "Paracetamol 500mg",
    batch: "BTH-2024-0892",
    stockAdded: 5000,
    supplier: "PharmaCorp Ltd",
    updatedBy: "John Smith",
    time: "10:30 AM",
  },
  {
    medicine: "Amoxicillin 250mg",
    batch: "BTH-2024-0891",
    stockAdded: 2500,
    supplier: "MediSupply Inc",
    updatedBy: "Sarah Johnson",
    time: "09:45 AM",
  },
  {
    medicine: "Omeprazole 20mg",
    batch: "BTH-2024-0890",
    stockAdded: 1800,
    supplier: "HealthDistributors",
    updatedBy: "Mike Davis",
    time: "08:15 AM",
  },
  {
    medicine: "Metformin 500mg",
    batch: "BTH-2024-0889",
    stockAdded: 3200,
    supplier: "PharmaCorp Ltd",
    updatedBy: "John Smith",
    time: "Yesterday",
  },
  {
    medicine: "Ibuprofen 400mg",
    batch: "BTH-2024-0888",
    stockAdded: 2100,
    supplier: "MediSupply Inc",
    updatedBy: "Sarah Johnson",
    time: "Yesterday",
  },
];

export type LowStockItem = {
  medicine: string;
  stock: number;
  reorderLevel: number;
  status: "Critical" | "Warning";
};

export const lowStockItems: LowStockItem[] = [
  {
    medicine: "Insulin Glargine",
    stock: 15,
    reorderLevel: 50,
    status: "Critical",
  },
  {
    medicine: "Cetirizine 10mg",
    stock: 28,
    reorderLevel: 100,
    status: "Critical",
  },
  {
    medicine: "Azithromycin 500mg",
    stock: 45,
    reorderLevel: 80,
    status: "Warning",
  },
  {
    medicine: "Pantoprazole 40mg",
    stock: 52,
    reorderLevel: 100,
    status: "Warning",
  },
];

export type ExpiringMedicine = {
  medicine: string;
  batch: string;
  expiryDate: string;
  daysRemaining: number;
};

export const expiringMedicines: ExpiringMedicine[] = [
  {
    medicine: "Prednisone 5mg",
    batch: "BTH-2023-0456",
    expiryDate: "2024-07-15",
    daysRemaining: 20,
  },
  {
    medicine: "Diazepam 5mg",
    batch: "BTH-2023-0455",
    expiryDate: "2024-07-20",
    daysRemaining: 25,
  },
  {
    medicine: "Warfarin 5mg",
    batch: "BTH-2023-0454",
    expiryDate: "2024-07-25",
    daysRemaining: 30,
  },
  {
    medicine: "Digoxin 0.25mg",
    batch: "BTH-2023-0453",
    expiryDate: "2024-08-01",
    daysRemaining: 37,
  },
];

export type PendingInvoice = {
  invoiceId: string;
  supplier: string;
  amount: string;
  uploadedDate: string;
  status: "Pending Review" | "Processing";
};

export const pendingInvoices: PendingInvoice[] = [
  {
    invoiceId: "INV-2024-0342",
    supplier: "PharmaCorp Ltd",
    amount: "$45,230.00",
    uploadedDate: "2024-06-25",
    status: "Pending Review",
  },
  {
    invoiceId: "INV-2024-0341",
    supplier: "MediSupply Inc",
    amount: "$28,450.00",
    uploadedDate: "2024-06-25",
    status: "Processing",
  },
  {
    invoiceId: "INV-2024-0340",
    supplier: "HealthDistributors",
    amount: "$32,100.00",
    uploadedDate: "2024-06-24",
    status: "Pending Review",
  },
];
