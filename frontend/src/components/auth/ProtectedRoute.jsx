import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-void">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep shadow-[0_0_24px_rgba(245,200,66,0.35)] animate-pulse">
          <Crown size={24} className="text-void" strokeWidth={2} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
