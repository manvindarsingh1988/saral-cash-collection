import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { mockApi } from "./lib/mockApi";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CollectorDashboard from "./pages/dashboards/CollectorDashboard";
import RetailDashboard from "./pages/dashboards/RetailDashboard";
import AddCollector from "./pages/admin/AddCollector";
import AssignRetail from "./pages/admin/AssignRetail";
import RetailUserLayout from "./components/RetailUserLayout";
import CollectorLayout from "./components/CollectorLayout";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const user = await mockApi.getCurrentUser();
      if (!user) {
        navigate("/signin");
        return;
      }

      if (user.role === "Admin") {
        setIsAdmin(true);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    mockApi.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  switch (user?.role) {
    case "Admin":
      return <AdminDashboard />;
    case "Collector":
      return <CollectorDashboard />;
    case "RetailUser":
      return <RetailDashboard />;
    default:
      return <Navigate to="/signin" replace />;
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
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="add-collector" element={<AddCollector />} />
          <Route path="assign-retail" element={<AssignRetail />} />
        </Route>

        <Route
          path="/retailUser"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <RetailUserLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<RetailDashboard />} />
        </Route>

        <Route
          path="/collector"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <CollectorLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<CollectorDashboard />} />
        </Route>

        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
      </Routes>
    </div>
  );
}

export default App;
