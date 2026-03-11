export const ADMIN_ROLES = ["admin", "demo"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function canAccessAdmin(role: string | undefined): boolean {
  return role === "admin" || role === "demo";
}

export function canWriteAdmin(role: string | undefined): boolean {
  return role === "admin";
}
