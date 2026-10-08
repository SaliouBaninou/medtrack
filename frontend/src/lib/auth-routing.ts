export function getDashboardPath(role?: string | null): string {
  if (role === "admin" || role === "superadmin" || !role) return "/admin"
  if (role === "medecin") return "/medecin"
  if (role === "stagiere") return "/stagiere"
  return "/"
}
