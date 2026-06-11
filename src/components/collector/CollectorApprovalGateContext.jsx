import { createContext, useContext } from "react";

export const CollectorApprovalGateContext = createContext({
  hasPendingApprovals: false,
  pendingApprovalCount: 0,
  loading: false,
  refreshPendingApprovals: async () => {},
});

export function useCollectorApprovalGate() {
  return useContext(CollectorApprovalGateContext);
}
