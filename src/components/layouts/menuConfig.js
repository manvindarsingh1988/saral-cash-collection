export const menuConfig = [
  {
    title: "Liabilities",
    children: [
      { 
        to: "liabilities/retailer", 
        label: "Retailer Liabilities",
        allow: ["Admin", "MasterCashier", "Cashier"]
      },
      {
        to: "liabilities/collector",
        label: "Collector Liabilities",
        allow: ["Admin", "MasterCashier", "Cashier"],
      },
      {
        to: "liabilities/cashier",
        label: "Cashier Liabilities",
        allow: ["Admin", "MasterCashier"],
      },
      {
        to: "liabilities/mastercashier",
        label: "MasterCashier Liabilities",
        allow: ["Admin"],
      },
    ],
  },
  {
    title: "Ledgers",
    children: [
      {
        to: "ledgers/cashier",
        label: "Cashier Ledger",
        allow: ["Cashier"],
      },
    ],
  },
  {
    title: "Users",
    children: [
      { to: "users/add", label: "Add User", allow: ["Admin", "MasterCashier"] },
      {
        to: "users/assign-retail",
        label: "Assign Retail Users",
        allow: ["Admin", "MasterCashier"],
      },
      { to: "users/info", label: "User Info", allow: ["Admin", "MasterCashier"] },
    ],
  },
  {
    title: "Approvals",
    children: [
      {
        to: "approvals/pending",
        label: "Pending Approvals",
        allow: ["Admin", "MasterCashier", "Cashier"],
      },
    ],
  },
  {
    title: "Dashboard",
    children: [
      {
        to: "dashboard/create",
        label: "Create Dashboard",
        allow: ["Admin", "MasterCashier", "Cashier"],
      },
    ],
  },
];
