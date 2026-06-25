export type UserRole = "admin" | "staff" | "retailer";

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

export function getSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("medixpro_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function saveSession(email: string, password?: string): UserSession {
  let role: UserRole = "staff";
  let name = "Warehouse Staff";

  const lowerEmail = email.toLowerCase();
  if (lowerEmail === "devanshusharmagsp@gmail.com") {
    if (password && password !== "123") {
      throw new Error("Invalid password");
    }
    role = "admin";
    name = "Devanshu Sharma (Admin)";
  } else if (lowerEmail.includes("admin")) {
    role = "admin";
    name = "Distributor Admin";
  } else if (lowerEmail.includes("retailer")) {
    role = "retailer";
    name = "Retailer Account";
  }

  const session: UserSession = {
    email,
    name,
    role,
    token: `mock-jwt-token-for-${role}`,
  };

  localStorage.setItem("medixpro_user", JSON.stringify(session));
  localStorage.setItem("medixpro_role", role);
  return session;
}

export function clearSession() {
  localStorage.removeItem("medixpro_user");
  localStorage.removeItem("medixpro_role");
}
