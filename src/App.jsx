import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { mockApi } from "./lib/mockApi";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CollectorDashboard from "./pages/dashboards/CollectorDashboard";
import RetailDashboard from "./pages/dashboards/RetailDashboard";
import AddCollector from "./pages/admin/AddCollector";
import AssignRetail from "./pages/admin/AssignRetail";
import AdminLayout from "./components/AdminLayout";
import RetailUserLayout from "./components/RetailUserLayout";
import CollectorLayout from "./components/CollectorLayout";

function ProtectedRoute({ children }) {
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

function UserSpecificDashboard({ children }) {
  const user = mockApi.getCurrentUser();

  if (user.role === "Admin") {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  } else if (user.role === "collector") {
    return (
      <CollectorLayout>
        <CollectorDashboard />
      </CollectorLayout>
    );
  } else if (user.role === "RetailUser") {
    return (
      <RetailUserLayout>
        <RetailDashboard />
      </RetailUserLayout>
    );
  }
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserSpecificDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/dashboard" element={<ProtectedRoute />} /> */}
        <Route
          path="/add-collector"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddCollector />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-retail"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AssignRetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
