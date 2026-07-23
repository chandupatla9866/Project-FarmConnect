export function resolveDashboardPath(roles) {
  if (roles.includes("ROLE_ADMIN")) return "/admin/dashboard";
  if (roles.includes("ROLE_DELIVERY")) return "/delivery/dashboard";
  if (roles.includes("ROLE_BUYER")) return "/buyer/dashboard";
  return "/farmer/dashboard";
}