import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

const routesForRoles = {
  Admin: ["/", "/add-user", "/assign-retail"],
  Collector: ["/"],
  RetailUser: ["/"],
};

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(() => apiBase.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = apiBase.getCurrentUser();

    if (!(user?.role || user?.UserType)) {
      navigate("/signin");
    } else {
      setUser(user);
    }
  }, [navigate, location.pathname]);

  if (!user) return <Navigate to="/signin" replace />;

  if (routesForRoles[user.role || user.UserType].includes(location.pathname)) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
}
