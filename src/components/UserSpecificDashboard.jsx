import { Routes, Route, Navigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import RetailUserLayout from "./layouts/RetailUserLayout";
import CollectorLayout from "./layouts/CollectorLayout";

// Pages
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import RetailDashboard from "../pages/dashboards/RetailDashboard";
import CollectorLedger from "../pages/collector/CollectorLedger";
import PendingApprovalsForCollector from "../pages/collector/PendingApprovalsForCollector";
import RetailerLiabilitiesForCollector from "../pages/collector/RetailerLiabilitiesForCollector";

import AddUser from "../pages/admin/AddUser";
import AssignRetail from "../pages/admin/AssignRetail";
import CollectorLiabilities from "../pages/admin/CollectorLiabilities";
import PendingApprovals from "../pages/admin/PendingApprovals";
import CreateDashboard from "../pages/admin/CreateDashboard";
import UserInfo from "../pages/admin/UserInfo";
import CashierLiabilities from "../pages/admin/CashierLiabilities";
import MasterCashierLiabilities from "../pages/admin/MasterCashierLiabilities";
import CashierLedger from "../pages/cashier/CashierLedger";

export default function UserSpecificDashboard() {
  const user = apiBase.getCurrentUser();
  const { UserType, Id } = user || {};
  const resolvedUserType =
    UserType === "Cashier" ? 13 : UserType === "MasterCashier" ? 14 : UserType === "ZoneManager" ? 20 : 15;
  if(UserType === "Admin" ||
        UserType === "Cashier" ||
        UserType === "MasterCashier" || 
        UserType === "ZoneManager") {
          return (
            <Routes>
              {/* ================= ADMIN / CASHIER ================= */}
              {(UserType === "Admin" ||
                UserType === "Cashier" ||
                UserType === "MasterCashier" || 
                UserType === "ZoneManager" ) && (
                <Route element={<AdminLayout />}>   
                <Route index element={<Navigate to="liabilities/retailer" replace />} />   

                  <Route
                    path="liabilities/retailer"
                    element={<AdminDashboard userType={resolvedUserType} id={Id} />}
                  />

                  <Route
                    path="liabilities/collector"
                    element={<CollectorLiabilities userType={resolvedUserType} id={Id} />}
                  />

                  {(UserType === "Admin" || UserType === "MasterCashier") && (
                    <Route
                      path="liabilities/cashier"
                      element={<CashierLiabilities userType={resolvedUserType} id={Id} />}
                    />
                  )}

                  {(UserType === "Admin") && (
                    <Route
                      path="liabilities/mastercashier"
                      element={<MasterCashierLiabilities userType={resolvedUserType} id={Id} />}
                    />
                  )}

                  {UserType === "Cashier" && (
                    <Route path="ledgers/cashier" element={<CashierLedger cashierUserId={Id} />} />
                  )}

                  <Route path="users/add" element={<AddUser />} />
                  <Route path="users/assign-retail" element={<AssignRetail />} />
                  <Route path="users/info" element={<UserInfo />} />

                  <Route
                    path="approvals/pending"
                    element={<PendingApprovals userType={resolvedUserType} id={Id} />}
                  />

                  <Route
                    path="dashboard/create"
                    element={<CreateDashboard userType={resolvedUserType} id={Id} />}
                  />
                </Route>
              )}

              
            </Routes>
          );
   
  }

  if (UserType === "Collector") {
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
    return <CollectorLayout>{renderCollectorRoutes()}</CollectorLayout>;
  }

  if (UserType === "Retailer") {
    const renderRetailRoutes = () => (
    <Routes>
      <Route path="/" element={<RetailDashboard retailUserId={Id} />} />
    </Routes>
  );
    return <RetailUserLayout>{renderRetailRoutes()}</RetailUserLayout>;
  }
  
}
