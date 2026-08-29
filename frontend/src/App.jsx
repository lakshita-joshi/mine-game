import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MinesGamePage from "./pages/MinesGamePage.jsx";
import RequireAdmin from "./components/admin/requireAdmin.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import CrashGamePage from "./pages/CrashGamePage.jsx";
import TeenPattiTablePage from "./pages/TeenPattiTablePage.jsx";
import TeenPattiLobbyPage from "./pages/TeenPattiLobbyPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/games/crash"
            element={
              <ProtectedRoute>
                <CrashGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/mines"
            element={
              <ProtectedRoute>
                <MinesGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RequireAdmin>
                  <AdminDashboardPage />
                </RequireAdmin>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RequireAdmin>
                  <AdminUsersPage />
                </RequireAdmin>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/teenpatti"
            element={
              <ProtectedRoute>
                <TeenPattiLobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/teenpatti/:tableId"
            element={
              <ProtectedRoute>
                <TeenPattiTablePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
