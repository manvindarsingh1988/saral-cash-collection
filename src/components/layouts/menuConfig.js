export const menuConfig = [
  {
    title: "Liabilities",
    children: [
      {
        to: "liabilities/retailer",
        label: "Retailer Liabilities",
        allow: ["Admin", "MasterCashier", "Cashier", "ZoneManager"]
      },
      {
        to: "liabilities/collector",
        label: "Collector Liabilities",
        allow: ["Admin", "MasterCashier", "Cashier", "ZoneManager"],
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
      { to: "users/qr-mapping", label: "QR and User Mapping", allow: ["Admin"] },
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
      {
        to: "dashboard/retailer-view",
        label: "Retailer View",
        allow: ["Admin"],
      },
      {
        to: "dashboard/accountent-view",
        label: "Accountent View",
        allow: ["Admin"],
      },
      {
        to: "dashboard/collector-view",
        label: "Collector View",
        allow: ["Admin"],
      },
    ],
  },
  {
    title: "Fund",
    children: [
      {
        to: "fund/additional",
        label: "Additional Fund",
        allow: ["Admin"],
      },
    ],
  },
];
