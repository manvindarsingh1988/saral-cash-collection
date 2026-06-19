import React from "react";
import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import UserSpecificDashboard from "./components/UserSpecificDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword.jsx";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <UserSpecificDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
