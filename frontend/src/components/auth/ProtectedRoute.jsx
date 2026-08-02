import React from "react";
import { Navigate } from "react-router-dom";
import { Radar } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-abyss">
        <Radar className="animate-radar-pulse text-sonar" size={32} strokeWidth={1.75} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
