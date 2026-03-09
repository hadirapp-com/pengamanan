// import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

// import Callback from '@/pages/callback';
import Landing from "@/pages/landing";
import DocumentationPage from "@/pages/documentation-page";
import Login from "@/pages/login/login-page";
import AppTemplate from "@/components/ui/layout/app-template";
import Dashboard from "@/pages/home";
import DeliveryTable from "@/pages/delivery/delivery-table";
import CustomerTable from "@/pages/customer/customer-table";
import CustomerForm from "@/pages/customer/customer-form";
import UserForm from "@/pages/user/user-form";
import UserTable from "@/pages/user/user-table";
import PartsTable from "@/pages/parts/parts-table";
import PartsForm from "@/pages/parts/parts-form";
import { PartsPrintHistory } from "@/pages/parts/parts-print-history";
import { LabelDesignPage } from "@/pages/label-design/label-design-page";
import LogsTable from "@/pages/logs/logs-table";
import LotManagementPage from "@/pages/scan-monitoring/scan-monitoring-page";
import DeliveryOrderPage from "@/pages/delivery-order/delivery-order-page";
import ConfigTable from "@/pages/config/config-table";
import UserGuidePage from "@/pages/user-guide/user-guide-page";
import { WhatsAppPage } from "@/pages/whatsapp/whatsapp-page";
// import Register from '@/pages/register';

export function BaseRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dokumentasi" element={<DocumentationPage />} />
      <Route path="/login" element={<Login />}></Route>
      <Route path="/app" element={<AppTemplate />}>
        <Route path="" element={<Dashboard />} />
        <Route path="delivery" element={<DeliveryTable />} />
        <Route path="delivery/:customer" element={<DeliveryTable />} />
        <Route path="customer" element={<CustomerTable />} />
        <Route path="customer/create" element={<CustomerForm />} />
        <Route path="customer/:id" element={<CustomerForm />} />
        <Route path="parts" element={<PartsTable />} />
        <Route path="parts/create" element={<PartsForm />} />
        <Route path="parts/:id" element={<PartsForm />} />
        <Route path="parts-print-history" element={<PartsPrintHistory />} />
        <Route path="label-design" element={<LabelDesignPage />} />
        <Route path="logs" element={<LogsTable />} />
        <Route path="logs/:customer" element={<LogsTable />} />
        <Route path="scan-monitoring" element={<LotManagementPage />} />
        <Route path="scan-monitoring/:customer" element={<LotManagementPage />} />
        <Route path="delivery-order" element={<DeliveryOrderPage />} />
        <Route path="delivery-order/:customer" element={<DeliveryOrderPage />} />
        <Route path="config" element={<ConfigTable />} />
        <Route path="user-guide" element={<UserGuidePage />} />
        <Route path="whatsapp" element={<WhatsAppPage />} />
        <Route path="user" element={<UserTable />} />
        <Route path="user/create" element={<UserForm />} />
        <Route path="user/:id" element={<UserForm />} />
      </Route>
    </Routes>
  );
}
