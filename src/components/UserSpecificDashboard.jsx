import React from "react";
import { mockApi } from "../lib/mockApi";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CollectorDashboard from "../pages/dashboards/CollectorDashboard";
import RetailDashboard from "../pages/dashboards/RetailDashboard";
import AdminLayout from "./AdminLayout";
import RetailUserLayout from "./RetailUserLayout";
import CollectorLayout from "./CollectorLayout";


export default function UserSpecificDashboard({ children }) {
  const user = mockApi.getCurrentUser();

  if ((user.role || user.UserType) === "Admin") {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  } else if ((user.role || user.UserType) === "Collector") {
    return (
      <CollectorLayout>
        <CollectorDashboard />
      </CollectorLayout>
    );
  } else if ((user.role || user.UserType) === "RetailUser") {
    return (
      <RetailUserLayout>
        <RetailDashboard />
      </RetailUserLayout>
    );
  }
}
