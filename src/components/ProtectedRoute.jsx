import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

const routesForRoles = {
  Admin: [
    "/",
    "/liabilities/retailer",
    "/liabilities/collector",
    "/liabilities/cashier",
    "/liabilities/mastercashier",
    "/ledgers/cashier",
    "/users/assign-retail",
    "/approvals/pending",
    "/dashboard/create",
    "/users/add",
    "/users/info"
  ],
  Cashier: [
    "/",
    "/liabilities/retailer",
    "/liabilities/collector",
    "/liabilities/cashier",
    "/liabilities/mastercashier",
    "/ledgers/cashier",
    "/users/assign-retail",
    "/approvals/pending",
    "/dashboard/create",
    "/users/add",
    "/users/info"
  ],
  MasterCashier: [
    "/",
    "/liabilities/retailer",
    "/liabilities/collector",
    "/liabilities/cashier",
    "/liabilities/mastercashier",
    "/ledgers/cashier",
    "/users/assign-retail",
    "/approvals/pending",
    "/dashboard/create",
    "/users/add",
    "/users/info"
  ],
  Collector: ["/", "/collector-ledgers", "/pending-approvals"],
  Retailer: ["/"],
};

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = apiBase.getCurrentUser();
    if (!currentUser?.UserType || !routesForRoles[currentUser.UserType]) {
      navigate("/signin", { replace: true });
    } else {
      setUser(currentUser);
    }
  }, [navigate, location.pathname]);

  if (!user) return null; // Or a loading spinner

  const allowedRoutes = routesForRoles[user.UserType] || [];

  return allowedRoutes.includes(location.pathname)
    ? children
    : <Navigate to="/" replace />;
}
