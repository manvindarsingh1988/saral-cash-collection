import React from "react";
import { Routes, Route } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import RetailUserLayout from "./layouts/RetailUserLayout";
import CollectorLayout from "./layouts/CollectorLayout";

// Pages
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import RetailDashboard from "../pages/dashboards/RetailDashboard";
import CollectorDashboard from "../pages/dashboards/CollectorDashboard";
import AddUser from "../pages/admin/AddUser";
import AssignRetail from "../pages/admin/AssignRetail";
import CollectorLiabilities from "../pages/admin/CollectorLiabilities";
import CollectorLedger from "../pages/collector/CollectorLedger";
import PendingApprovals from "../pages/admin/PendingApprovals";
import CreateDashboard from "../pages/admin/CreateDashboard";
import UserInfo from "../pages/admin/UserInfo";
import RetailerLiabilitiesForCollector from "../pages/collector/RetailerLiabilitiesForCollector";
import PendingApprovalsForCollector from "../pages/collector/PendingApprovalsForCollector";
import CashierLiabilities from "../pages/admin/CashierLiabilities";
import CashierLedger from "../pages/cashier/CashierLedger";

export default function UserSpecificDashboard() {
  const user = apiBase.getCurrentUser();
  const { UserType, Id } = user || {};

  const renderAdminRoutes = () => (
    <Routes>
      <Route path="/collector-liabilities" element={<CollectorLiabilities userType={ UserType === "Cashier" ? 13 :  UserType === "MasterCashier" ? 14 : 15}  id={Id}/>} />
      {(UserType === "Admin" || UserType === "MasterCashier") && (
        <Route path="/cashier-liabilities" element={<CashierLiabilities userType={ UserType === "Cashier" ? 13 :  UserType === "MasterCashier" ? 14 : 15}  id={Id}/>} />
      )}
      {UserType === "Cashier" && (
        <Route
          path="/cashier-ledgers"
          element={<CashierLedger cashierUserId={Id} />}
        />
      )}
      <Route path="/add-user" element={<AddUser />} />
      <Route path="/assign-retail" element={<AssignRetail />} />
      <Route path="/pending-approvals" element={<PendingApprovals userType={ UserType === "Cashier" ? 13 :  UserType === "MasterCashier" ? 14 : 15}  id={Id}/>} />
      <Route path="/user-info" element={<UserInfo />} />
      <Route path="/" element={<AdminDashboard userType={ UserType === "Cashier" ? 13 :  UserType === "MasterCashier" ? 14 : 15}  id={Id}/>} />
      <Route path="/create-dashboard" element={<CreateDashboard userType={ UserType === "Cashier" ? 13 :  UserType === "MasterCashier" ? 14 : 15} id={Id} />} />
    </Routes>
  );

  const renderCollectorRoutes = () => (
    <Routes>
      <Route
        path="/collector-ledgers"
        element={<CollectorLedger collectorUserId={Id} />}
      />
      <Route
        path="/pending-approvals"
        element={<PendingApprovalsForCollector collectorUserId={Id} />}
      />
      <Route
        path="/"
        element={<RetailerLiabilitiesForCollector collectorUserId={Id} />}
      />
    </Routes>
  );

  const renderRetailRoutes = () => (
    <Routes>
      <Route path="/" element={<RetailDashboard retailUserId={Id} />} />
    </Routes>
  );

  if (
    UserType === "Admin" ||
    UserType === "Cashier" ||
    UserType === "MasterCashier"
  ) {
    return <AdminLayout>{renderAdminRoutes()}</AdminLayout>;
  }

  if (UserType === "Collector") {
    return <CollectorLayout>{renderCollectorRoutes()}</CollectorLayout>;
  }

  if (UserType === "Retailer") {
    return <RetailUserLayout>{renderRetailRoutes()}</RetailUserLayout>;
  }

  // Optional: Redirect or fallback
  return null;
}
