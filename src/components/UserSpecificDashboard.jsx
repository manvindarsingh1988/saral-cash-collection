import React from "react";
import { apiBase } from "../lib/apiBase";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CollectorDashboard from "../pages/dashboards/CollectorDashboard";
import RetailDashboard from "../pages/dashboards/RetailDashboard";
import AdminLayout from "./layouts/AdminLayout";
import RetailUserLayout from "./layouts/RetailUserLayout";
import CollectorLayout from "./layouts/CollectorLayout";

export default function UserSpecificDashboard() {
  const user = apiBase.getCurrentUser();

  if (user.UserType === "Admin" || user.UserType === "Cashier") {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  } else if (user.UserType === "Collector") {
    return (
      <CollectorLayout>
        <CollectorDashboard collectorUserId={user.Id} />
      </CollectorLayout>
    );
  } else if (user.UserType === "Retailer") {
    return (
      <RetailUserLayout>
        <RetailDashboard retailUserId={user.Id} />
      </RetailUserLayout>
    );
  }
}
