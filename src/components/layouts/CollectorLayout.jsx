import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import UserProfileMenu from "../UserProfileMenu";

export default function CollectorLayout({ children }) {
  const [user] = React.useState(() => apiBase.getCurrentUser());
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
            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? "✖" : "☰"}
              </button>
            </div>

            {/* Logo and title */}
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">
                Saral Cash Collection
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinks isActive={isActive} />
              </div>
            </div>

            <UserProfileMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-500 px-2 pt-2 pb-3 space-y-1">
            <NavLinks
              isActive={isActive}
              mobile
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function NavLinks({ isActive, mobile = false, setMobileMenuOpen }) {
  const baseClass = "text-white rounded-md px-3 py-2 text-sm font-medium block";
  const links = [
    { to: "/", label: "Retailer Liabilities" },
    { to: "/ledgers", label: "Ledgers" },
  ];

  return links.map(({ to, label }) => (
    <Link
      key={to}
      to={to}
      className={`${baseClass} ${isActive(to)}`}
      onClick={() => {
        if (mobile) {
          document.activeElement?.blur();
          setMobileMenuOpen(false); // Close menu on link click
        }
      }}
    >
      {label}
    </Link>
  ));
}
