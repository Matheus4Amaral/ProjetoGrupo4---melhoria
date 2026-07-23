import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando sua sessão...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RoleRoute({ allowedRoles }) {
  const { profile, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (!profile || !allowedRoles.includes(profile.papel)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
