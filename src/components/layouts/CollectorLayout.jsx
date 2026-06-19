import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiBase } from "../../lib/apiBase";
import AppLogo from "../AppLogo";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, X } from "lucide-react";
import {
  CollectorApprovalGateContext,
  useCollectorApprovalGate,
} from "../collector/CollectorApprovalGateContext";
import Tooltip from "../Tooltip";

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
      <div className="app-shell">
        <nav className="app-nav">
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
                <AppLogo />
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
            <div className="md:hidden border-t border-white/10 bg-white/10 px-2 pb-3 pt-2 space-y-1 backdrop-blur">
              <NavLinks
                isActive={isActive}
                mobile
                setMobileMenuOpen={setMobileMenuOpen}
              />
            </div>
          )}
        </nav>

        <div className="app-content">
          <main className="app-main-scroll mx-auto flex flex-1 min-h-0 w-full max-w-8xl flex-col overflow-auto px-4 py-6 sm:px-6 lg:px-8">
            {hasPendingApprovals && (
              <div className="mb-4 shrink-0">
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                Complete all pending ledger approvals before using other collector pages.
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </main>
        </div>
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
          <Tooltip key={to} content="Finish pending approvals first">
            <span className={className}>{label}</span>
          </Tooltip>
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
