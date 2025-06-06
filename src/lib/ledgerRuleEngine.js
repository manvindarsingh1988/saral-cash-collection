import { apiBase } from "./apiBase";

export const getWorkflows = (UserType) => {
  switch (UserType) {
    case "Admin":
    case "MasterCashier":
    case "Cashier":
      return [1, 4, 5];
    case "Collector":
      return [1, 2, 3];
    case "Retailer":
      return [1];
    default:
      return [];
  }
};

export const sanitiseLedgerPayload = (payload) => {
  const userType = apiBase.getCurrentUser()?.UserType;
  const transactionType = payload.TransactionType;

  switch (userType) {
    case "Cashier":
      return {
        ...payload,
        CollectorId: null,
        CollectorName: null,
        RetailerId: null,
        RetailerName: null,
      };
    case "Collector":
      return {
        ...payload,
        CashierId: transactionType == 1 ? payload.CashierId : null,
        CashierName: transactionType == 1 ? payload.CashierName : null,
        CollectorId: payload.CollectorId,
        CollectorName: payload.CollectorName,
        RetailerId: null,
        RetailerName: null,
      };
    case "Retailer":
      return {
        ...payload,
        CashierId: null,
        CashierName: null,
        CollectorId: transactionType == 1 ? payload.CollectorId : null,
        CollectorName: transactionType == 1 ? payload.CollectorName : null,
      };
    default:
      console.warn("Unknown user type:", userType);
      return payload;
  }
};
