import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { mockApi } from "../lib/mockApi";

const routesForRoles = {
  Admin: ["/", "/add-collector", "/assign-retail"],
  Collector: ["/"],
  RetailUser: ["/"],
};

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(() => mockApi.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = mockApi.getCurrentUser();

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
