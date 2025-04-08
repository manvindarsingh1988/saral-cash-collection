import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

export default function AdminLayout({ children }) {
  console.log("AdminLayout.jsx");

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? "bg-indigo-700" : "";
  };

  const handleSignOut = async () => {
    await apiBase.signOut();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-xl font-bold">
                  Saral Cash Collection
                </span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className={`${isActive(
                      "/"
                    )} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/add-user"
                    className={`${isActive(
                      "/add-user"
                    )} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Add User
                  </Link>
                  <Link
                    to="/assign-retail"
                    className={`${isActive(
                      "/assign-retail"
                    )} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Assign Retail Users
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
