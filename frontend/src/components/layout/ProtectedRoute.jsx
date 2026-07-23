import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
export function ProtectedRoute({
  requiredRole
}) {
  const {
    isAuthenticated,
    isLoading,
    hasRole
  } = useAuth();
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}