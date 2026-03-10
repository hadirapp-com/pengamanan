// ============================================================================
// PENGAMANAN LEBARAN 2026 - ROUTER
// ============================================================================

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { AppTemplate } from "@/components/ui/layout/app-template";

// Pages
import LoginPage from "@/pages/auth/login-page";
import DashboardPage from "@/pages/dashboard/dashboard-page";

// Users (Superadmin only)
import UserTablePage from "@/pages/users/user-table-page";
import UserFormPage from "@/pages/users/user-form-page";

// Petugas Jaga
import PetugasTablePage from "@/pages/petugas/petugas-table-page";
import PetugasFormPage from "@/pages/petugas/petugas-form-page";

// Pos Jaga
import PosTablePage from "@/pages/pos/pos-table-page";
import PosFormPage from "@/pages/pos/pos-form-page";

// QR Codes
import QrTablePage from "@/pages/qr/qr-table-page";
import QrFormPage from "@/pages/qr/qr-form-page";

// Pengumuman
import PengumumanTablePage from "@/pages/pengumuman/pengumuman-table-page";
import PengumumanFormPage from "@/pages/pengumuman/pengumuman-form-page";

// Configs
import ConfigTablePage from "@/pages/configs/config-table-page";
import ConfigFormPage from "@/pages/configs/config-form-page";

// Logs
import LogsTablePage from "@/pages/logs/logs-table-page";

export function BaseRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - App Layout */}
      <Route path="/app" element={<AppTemplate />}>
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route index element={<DashboardPage />} />

        {/* Users - Superadmin only */}
        <Route path="users" element={<UserTablePage />} />
        <Route path="users/create" element={<UserFormPage />} />
        <Route path="users/:id" element={<UserFormPage />} />

        {/* Configs - Superadmin only */}
        <Route path="configs" element={<ConfigTablePage />} />
        <Route path="configs/create" element={<ConfigFormPage />} />
        <Route path="configs/:id" element={<ConfigFormPage />} />

        {/* Petugas Jaga */}
        <Route path="petugas" element={<PetugasTablePage />} />
        <Route path="petugas/create" element={<PetugasFormPage />} />
        <Route path="petugas/:id" element={<PetugasFormPage />} />

        {/* Pos Jaga */}
        <Route path="pos" element={<PosTablePage />} />
        <Route path="pos/create" element={<PosFormPage />} />
        <Route path="pos/:id" element={<PosFormPage />} />

        {/* QR Codes */}
        <Route path="qr" element={<QrTablePage />} />
        <Route path="qr/create" element={<QrFormPage />} />
        <Route path="qr/:id" element={<QrFormPage />} />

        {/* Pengumuman */}
        <Route path="pengumuman" element={<PengumumanTablePage />} />
        <Route path="pengumuman/create" element={<PengumumanFormPage />} />
        <Route path="pengumuman/:id" element={<PengumumanFormPage />} />

        {/* Logs */}
        <Route path="logs" element={<LogsTablePage />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
