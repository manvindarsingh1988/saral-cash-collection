import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const user = apiBase.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? "bg-indigo-700" : "";

  const handleSignOut = async () => {
    await apiBase.signOut();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo and title */}
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">
                Saral Cash Flow
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinks isActive={isActive} />
              </div>
            </div>

            <UserProfileMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-500 px-2 pt-2 pb-3 space-y-1">
            <NavLinks
              isActive={isActive}
              mobile
              setMobileMenuOpen={setMobileMenuOpen}
              user={user}
            />
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-8xl px-4 py-2 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

// Extracted nav links for reuse in desktop and mobile
function NavLinks({ isActive, mobile = false, setMobileMenuOpen }) {
  const user = apiBase.getCurrentUser();

  const baseClass = "text-white rounded-md px-3 py-2 text-sm font-medium block";
  const links = [
    { to: "/", label: "Retailer Liabilities" },
    { to: "/collector-liabilities", label: "Collector Liabilities" },
    { to: "/cashier-ledgers", label: "Ledgers" },
    { to: "/cashier-liabilities", label: "Cashier Liabilities" },
    { to: "/pending-approvals", label: "Pending Approvals" },
    { to: "/add-user", label: "Add User" },
    { to: "/assign-retail", label: "Assign Retail Users" },
    { to: "/user-info", label: "User Info" },
    { to: "/create-dashboard", label: "Create Dashboard" },
  ];

  return links
    .filter((l) => {
      if (user?.UserType === "Cashier") {
        return l.to != "/cashier-liabilities"; // Admin sees all links
      } else {
        return l.to !== "/cashier-ledgers"; // Cashier sees all except cashier ledger/liabilities
      }
    })
    .map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        className={`${baseClass} ${isActive(to)}`}
        onClick={() => {
          if (mobile && setMobileMenuOpen) {
            setMobileMenuOpen(false); // ✅ close menu on selection
          }
        }}
      >
        {label}
      </Link>
    ));
}
