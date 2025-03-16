import React, { useEffect, useState } from "react";
import {
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { mockApi } from "../lib/mockApi";


export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(() => mockApi.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = mockApi.getCurrentUser();

    if (!user || !user.role) {
      navigate("/signin");
    } else {
      setUser(user);
    }
  }, [navigate, location.pathname]);

  if (!user) return <Navigate to="/signin" replace />;

  return children;
}