import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import AppLogo from "../AppLogo";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, X } from "lucide-react";

export default function RetailUserLayout({ children }) {
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
    <div className="app-shell">
      <nav className="app-nav">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
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
              <AppLogo />
            </div>

            {/* Desktop nav (optional links) */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinks isActive={isActive} />
              </div>
            </div>

            <UserProfileMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-white/10 px-2 pb-3 pt-2 space-y-1 backdrop-blur">
            <NavLinks isActive={isActive} mobile />
          </div>
        )}
      </nav>

      <div className="app-content">
        <main className="app-main-scroll mx-auto flex-1 min-h-0 w-full max-w-8xl overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLinks({ isActive, mobile = false }) {
  const baseClass = "text-white rounded-md px-3 py-2 text-sm font-medium block";
  const links = [
    // Add any Retail-specific routes here if needed
    // Example:
    // { to: "/retail-dashboard", label: "Dashboard" },
  ];

  return links.map(({ to, label }) => (
    <Link
      key={to}
      to={to}
      className={`${baseClass} ${isActive(to)}`}
      onClick={() => {
        if (mobile) document.activeElement?.blur();
      }}
    >
      {label}
    </Link>
  ));
}
