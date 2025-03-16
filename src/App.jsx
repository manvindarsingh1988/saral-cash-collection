import React, {  } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import AddCollector from "./pages/admin/AddCollector";
import AssignRetail from "./pages/admin/AssignRetail";
import AdminLayout from "./components/AdminLayout";
import UserSpecificDashboard from "./components/UserSpecificDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
