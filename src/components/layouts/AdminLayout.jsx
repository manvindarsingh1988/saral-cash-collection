import { useState, useMemo } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, X } from "lucide-react";
import { menuConfig } from "./menuConfig";

export default function AdminLayout() {
  const user = apiBase.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // HashRouter: get current path from location.hash
  const currentPath = useMemo(() => {
  return location.pathname;
}, [location.pathname]);

  const handleSignOut = async () => {
    await apiBase.signOut();
    navigate("/signin");
  };

  const activeMenu = useMemo(() => {
  return getActiveMenuLabel(menuConfig, user?.UserType, currentPath);
}, [currentPath, user?.UserType]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">Saral Cash Flow</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <DesktopNav user={user} currentPath={currentPath} />
            </div>

            {/* User Profile */}
            <UserProfileMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-500 px-2 pt-2 pb-3 space-y-1">
            <NavLinks
              user={user}
              currentPath={currentPath}
              mobile
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </div>
        )}
      </nav>

      {activeMenu && (
        <div className="bg-white border-b">
          <div className="mx-auto max-w-8xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="text-sm text-gray-500">
              {activeMenu.parent}
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {activeMenu.label}
            </div>
          </div>
        </div>
      )}
      
      {/* Page Content */}
      <main className="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

// Desktop dropdown menu
function DesktopNav({ user, currentPath }) {
  // ✅ Always normalize safely
  const normalizedPath = useMemo(() => {
    if (!currentPath) return "";

    // remove hash if accidentally passed
    let path = currentPath.startsWith("#")
      ? currentPath.slice(1)
      : currentPath;

    // remove query params
    path = path.split("?")[0];

    // ensure leading slash
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    return path;
  }, [currentPath]);

  return (
    <>
      {menuConfig.map((menu) => {
        const visibleItems = menu.children.filter((item) =>
          item.allow.includes(user?.UserType)
        );
        if (!visibleItems.length) return null;

        // ✅ Parent active if ANY child matches
        const isParentActive = visibleItems.some(({ to }) => {
          const resolvedPath = to.startsWith("/") ? to : "/" + to;
          return normalizedPath === resolvedPath;
        });

        return (
          <div key={menu.title} className="relative group">
            {/* Parent menu */}
            <button
              type="button"
              className={`px-3 py-2 text-sm font-medium rounded-md
                ${
                  isParentActive
                    ? "bg-indigo-700 text-white"
                    : "text-white hover:bg-indigo-700"
                }`}
            >
              {menu.title}
            </button>

            {/* Dropdown */}
            <div
              className="
                absolute left-0 top-full
                min-w-[220px]
                rounded-md bg-white shadow-lg
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-opacity duration-150
                z-50
              "
            >
              {visibleItems.map(({ to, label }) => {
                const resolvedPath = to.startsWith("/") ? to : "/" + to;
                const isActive = normalizedPath === resolvedPath;

                return (
                  <Link
                    key={to}
                    to={resolvedPath}
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100
                      ${isActive ? "bg-indigo-50 font-semibold" : ""}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}


// Mobile menu links
function NavLinks({ user, currentPath, mobile = false, setMobileMenuOpen }) {
  return (
    <>
      {menuConfig.map((menu) => {
        const visibleLinks = menu.children.filter((item) =>
          item.allow.includes(user?.UserType)
        );
        if (!visibleLinks.length) return null;

        return (
          <div key={menu.title} className="mb-4">
            {/* Section Title */}
            <div className="px-3 py-2 text-xs font-semibold text-indigo-200 uppercase tracking-wide">
              {menu.title}
            </div>

            {/* Links */}
            <div className="flex flex-col space-y-1">
              {visibleLinks.map(({ to, label }) => {
                const resolvedPath = to.startsWith("/") ? to : "/" + to;
                const isActive = currentPath === resolvedPath;
                return (
                  <Link
                    key={to}
                    to={resolvedPath}
                    className={`text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-700 ${
                      isActive ? "bg-indigo-800 font-semibold" : ""
                    }`}
                    onClick={() => mobile && setMobileMenuOpen?.(false)}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function getActiveMenuLabel(menuConfig, userType, currentPath) {
  for (const menu of menuConfig) {
    for (const item of menu.children) {
      if (!item.allow.includes(userType)) continue;

      const resolvedPath = item.to.startsWith("/")
        ? item.to
        : "/" + item.to;

      if (currentPath === resolvedPath) {
        return {
          parent: menu.title,
          label: item.label,
        };
      }
    }
  }
  return null;
}
