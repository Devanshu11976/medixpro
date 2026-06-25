export type UserRole = "admin" | "staff" | "retailer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  sku: string;
  stock: number;
  price: number;
  expiryDate: string;
  rackLocation: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Retailer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  balance: number;
  totalOrders: number;
  status: "Active" | "Suspended";
}

export interface OrderItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  retailerName: string;
  items: OrderItem[];
  amount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  amount: number;
  uploadedDate: string;
  status: "Pending Review" | "Processing" | "Approved";
  itemsCount: number;
}
