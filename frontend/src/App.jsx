import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import RequireAdmin from "./components/admin/requireAdmin.jsx";

// Pages
import LoginPage       from "./pages/LoginPage.jsx";
import RegisterPage    from "./pages/RegisterPage.jsx";
import DashboardPage   from "./pages/DashboardPage.jsx";
import MinesGamePage   from "./pages/MinesGamePage.jsx";
import CrashGamePage   from "./pages/CrashGamePage.jsx";
import DragonTigerPage from "./pages/DragonTigerPage.jsx";
import TeenPattiLobbyPage from "./pages/TeenPattiLobbyPage.jsx";
import TeenPattiTablePage from "./pages/TeenPattiTablePage.jsx";
import WalletPage      from "./pages/WalletPage.jsx";
import ProfilePage     from "./pages/ProfilePage.jsx";
import PromotionsPage  from "./pages/PromotionsPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";

// Admin pages (unchanged)
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage     from "./pages/admin/AdminUsersPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"             element={<DashboardPage />} />
              <Route path="/games/mines"            element={<MinesGamePage />} />
              <Route path="/games/crash"            element={<CrashGamePage />} />
              <Route path="/games/dragontiger"      element={<DragonTigerPage />} />
              <Route path="/games/teenpatti"        element={<TeenPattiLobbyPage />} />
              <Route path="/games/teenpatti/:tableId" element={<TeenPattiTablePage />} />
              <Route path="/wallet"                 element={<WalletPage />} />
              <Route path="/profile"                element={<ProfilePage />} />
              <Route path="/promotions"             element={<PromotionsPage />} />
              <Route path="/leaderboard"            element={<LeaderboardPage />} />
            </Route>

            {/* Admin (unchanged styling) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RequireAdmin />}>
                <Route path="/admin"       element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
