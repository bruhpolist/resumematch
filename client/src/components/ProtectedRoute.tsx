import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { useAppContext } from "../contexts/AppContext";

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { isAuthenticated, isBootstrapping } = useAppContext();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
}