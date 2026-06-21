import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("bitestoque_user");
    if (!user) {
      setIsAuthenticated(false);
      // Save current pathname to session storage so we can redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath && currentPath !== "/login") {
        sessionStorage.setItem("auth_redirect", currentPath);
      }
      navigate({ to: "/login" });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
