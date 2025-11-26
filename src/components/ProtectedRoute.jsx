import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

const routesForRoles = {
  Admin: [
    "/",
    "/collector-liabilities",
    "/cashier-liabilities",
    "/add-user",
    "/assign-retail",
    "/pending-approvals",
    "/user-info",
    "/create-dashboard"
  ],
  Cashier: [
    "/",
    "/collector-liabilities",
    "/cashier-ledgers",
    "/add-user",
    "/assign-retail",
    "/pending-approvals",
    "/user-info",
    "/create-dashboard"
  ],
  MasterCashier: [
    "/",
    "/collector-liabilities",
    "/cashier-liabilities",
    "/add-user",
    "/assign-retail",
    "/pending-approvals",
    "/user-info",
    "/create-dashboard"
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
