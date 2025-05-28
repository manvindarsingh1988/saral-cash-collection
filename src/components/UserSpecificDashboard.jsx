import React from "react";
import { Routes, Route } from "react-router-dom";
import { apiBase } from "../lib/apiBase";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CollectorDashboard from "../pages/dashboards/CollectorDashboard";
import RetailDashboard from "../pages/dashboards/RetailDashboard";
import AdminLayout from "./layouts/AdminLayout";
import RetailUserLayout from "./layouts/RetailUserLayout";
import CollectorLayout from "./layouts/CollectorLayout";
import AddUser from "../pages/admin/AddUser";
import AssignRetail from "../pages/admin/AssignRetail";
import CollectorLiabilities from "../pages/admin/CollectorLiabilities";
import CollectorLedger from "../pages/collector/CollectorLedger";
import PendingApprovals from "../pages/admin/PendingApprovals";
import UserInfo from "../pages/admin/UserInfo";
import RetailerLiabilitiesForCollector from "../pages/collector/RetailerLiabilitiesForCollector";
import PendingApprovalsForCollector from "../pages/collector/PendingApprovalsForCollector";

export default function UserSpecificDashboard() {
  const user = apiBase.getCurrentUser();

  if (user.UserType === "Admin" || user.UserType === "Cashier") {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/collector-ledgers" element={<CollectorLiabilities />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/assign-retail" element={<AssignRetail />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </AdminLayout>
    );
  } else if (user.UserType === "Collector") {
    return (
      <CollectorLayout>
        <Routes>
          {/* <Route
            path="/"
            element={<CollectorDashboard collectorUserId={user.Id} />}
          /> */}
          <Route
            path="/"
            element={
              <RetailerLiabilitiesForCollector collectorUserId={user.Id} />
            }
          />
          <Route
            path="/pending-approvals"
            element={<PendingApprovalsForCollector collectorUserId={user.Id} />}
          />
        </Routes>
      </CollectorLayout>
    );
  } else if (user.UserType === "Retailer") {
    return (
      <RetailUserLayout>
        <Routes>
          <Route
            path="/"
            element={<RetailDashboard retailUserId={user.Id} />}
          />
        </Routes>
      </RetailUserLayout>
    );
  } else {
    return null; // or maybe redirect to /signin if needed
  }
}
