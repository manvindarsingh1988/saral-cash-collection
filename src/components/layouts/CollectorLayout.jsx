import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, X } from "lucide-react";
import {
  CollectorApprovalGateContext,
  useCollectorApprovalGate,
} from "../collector/CollectorApprovalGateContext";

const allowedWhilePendingRoutes = ["/", "/pending-approvals", "/fund/additional"];

export default function CollectorLayout({ children }) {
  const [user] = React.useState(() => apiBase.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [loadingPendingApprovals, setLoadingPendingApprovals] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const hasPendingApprovals = pendingApprovalCount > 0;
  const isAllowedWhilePending = allowedWhilePendingRoutes.includes(
    location.pathname
  );

  const isActive = (path) =>
    location.pathname === path ? "bg-indigo-700" : "";

  const refreshPendingApprovals = useCallback(async () => {
    if (!user?.Id) {
      setPendingApprovalCount(0);
      setLoadingPendingApprovals(false);
      return;
    }

    try {
      setLoadingPendingApprovals(true);
      const approvals = await apiBase.getPendingApprovalsByCollectorId(
        user.Id,
        false
      );
      setPendingApprovalCount(Array.isArray(approvals) ? approvals.length : 0);
    } catch (error) {
      console.error("Failed to load pending approvals gate:", error);
    } finally {
      setLoadingPendingApprovals(false);
    }
  }, [user?.Id]);

  useEffect(() => {
    refreshPendingApprovals();
  }, [refreshPendingApprovals, location.pathname]);

  useEffect(() => {
    if (!loadingPendingApprovals && hasPendingApprovals && !isAllowedWhilePending) {
      navigate("/pending-approvals", { replace: true });
    }
  }, [
    hasPendingApprovals,
    isAllowedWhilePending,
    loadingPendingApprovals,
    navigate,
  ]);

  const gateValue = useMemo(
    () => ({
      hasPendingApprovals,
      pendingApprovalCount,
      loading: loadingPendingApprovals,
      refreshPendingApprovals,
    }),
    [
      hasPendingApprovals,
      pendingApprovalCount,
      loadingPendingApprovals,
      refreshPendingApprovals,
    ]
  );

  const handleSignOut = async () => {
    await apiBase.signOut();
    navigate("/signin");
  };

  return (
    <CollectorApprovalGateContext.Provider value={gateValue}>
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
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Logo and title */}
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">
                  Saral Cash Flow
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
          {hasPendingApprovals && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Complete all pending ledger approvals before using other collector pages.
            </div>
          )}
          {children}
        </main>
      </div>
    </CollectorApprovalGateContext.Provider>
  );
}

function NavLinks({ isActive, mobile = false, setMobileMenuOpen }) {
  const baseClass = "text-white rounded-md px-3 py-2 text-sm font-medium block";
  const { hasPendingApprovals, loading } = useCollectorApprovalGate();
  const links = [
    // { to: "/", label: "Retailer Liabilities" },
    { to: "/", label: "Retailer Liabilities" },
    { to: "/collector-ledgers", label: "Ledgers" },
    { to: "/fund/additional", label: "Fund" },
    { to: "/pending-approvals", label: "Pending Approvals" },
  ];

  return links.map(({ to, label }) => (
    (() => {
      const isLocked =
        hasPendingApprovals && !allowedWhilePendingRoutes.includes(to);
      const className = `${baseClass} ${isActive(to)} ${
        isLocked || loading ? "opacity-50 cursor-not-allowed" : ""
      }`;

      if (isLocked || loading) {
        return (
          <span key={to} className={className} title="Finish pending approvals first">
            {label}
          </span>
        );
      }

      return (
        <Link
          key={to}
          to={to}
          className={className}
          onClick={() => {
            if (mobile) {
              document.activeElement?.blur();
              setMobileMenuOpen(false); // Close menu on link click
            }
          }}
        >
          {label}
        </Link>
      );
    })()
  ));
}
