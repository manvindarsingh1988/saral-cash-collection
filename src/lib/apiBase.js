import config from "./config.json";

const API_URL = config.api.endpoint; // Default to localhost if not set

const users = [
  { id: "1", email: "admin@example.com", password: "admin123", role: "Admin" },
  {
    id: "2",
    email: "collector1@example.com",
    password: "pass123",
    role: "Collector",
  },
  {
    id: "3",
    email: "collector2@example.com",
    password: "pass123",
    role: "Collector",
  },
  {
    id: "4",
    email: "retail1@example.com",
    password: "pass123",
    role: "Retailer",
    assignedCollectorId: "2",
  },
  {
    id: "5",
    email: "retail2@example.com",
    password: "pass123",
    role: "Retailer",
    assignedCollectorId: null,
  },
];

const transactions = [
  {
    id: "1",
    retailUserId: "4",
    collectorId: "2",
    amount: 1000,
    date: "2025-03-10",
    status: "Done",
    handoverDate: "2025-03-10",
  },
  {
    id: "2",
    retailUserId: "4",
    collectorId: "2",
    amount: 2000,
    date: "2025-03-11",
    status: "InProgress",
  },
];

let currentUser = null;

// Mock API functions
export const apiBase = {
  signIn: async (email, password) => {
    const response = await fetch(
      `${API_URL}/Login?userId=${email}&password=${password}`
    );

    let user = await response.json();
    if (!response.ok || user?.IsFailed) {
      console.error(`Failed to fetch: ${response.statusText}`);

      user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
    } 

    currentUser = user;
    localStorage.setItem("mockUser", JSON.stringify(user));
    return { user };
  },

  signOut: async () => {
    currentUser = null;
    localStorage.removeItem("mockUser");
  },

  getCurrentUser: () => {
    if (!currentUser) {
      const stored = localStorage.getItem("mockUser");
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    }
    console.log("Current User:", currentUser);

    return currentUser;
  },

  assignCollector: async (retailUserId, collectorId) => {
    const retailUser = users.find((u) => u.id === retailUserId);
    if (retailUser) {
      retailUser.assignedCollectorId = collectorId;
    }
    return { success: true };
  },

  getStats: async () => {
    const user = apiBase.getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    switch (user.role || user.UserType) {
      case "Retailer":
        const retailTransactions = transactions.filter(
          (t) => t.retailUserId === user.id
        );
        return {
          totalLiability: retailTransactions.reduce(
            (sum, t) => sum + t.amount,
            0
          ),
          transactions: retailTransactions,
          role: "Retailer",
        };

      case "Collector":
        const collectorTransactions = transactions.filter(
          (t) => t.collectorId === user.id
        );
        return {
          totalCollected: collectorTransactions
            .filter((t) => t.status === "Done")
            .reduce((sum, t) => sum + t.amount, 0),
          pendingCollection: collectorTransactions
            .filter((t) => t.status === "InProgress")
            .reduce((sum, t) => sum + t.amount, 0),
          transactions: collectorTransactions,
          role: "Collector",
        };

      case "Admin":
        return {
          totalCollectors: users.filter((u) => u.role === "Collector").length,
          totalRetailUsers: users.filter((u) => u.role === "Retailer").length,
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          pendingAmount: transactions
            .filter((t) => t.status === "InProgress")
            .reduce((sum, t) => sum + t.amount, 0),
          transactions: transactions,
          role: "Admin",
        };

      default:
        throw new Error("Invalid role");
    }
  },

  updateTransactionStatus: async (transactionId, status) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      transaction.status = status;
      if (status === "Done") {
        transaction.handoverDate = new Date().toISOString().split("T")[0];
      } else {
        delete transaction.handoverDate;
      }
    }
    return { success: true };
  },

  createTransaction: async (amount) => {
    const user = apiBase.getCurrentUser();
    if (!user || user.role !== "Retailer") {
      throw new Error("Unauthorized");
    }

    const retailUser = users.find((u) => u.id === user.id);
    if (!retailUser.assignedCollectorId) {
      throw new Error("No collector assigned");
    }

    const newTransaction = {
      id: String(transactions.length + 1),
      retailUserId: user.id,
      collectorId: retailUser.assignedCollectorId,
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      status: "InProgress",
    };

    transactions.push(newTransaction);
    return { transaction: newTransaction };
  },

  // ************ Actual API calls ************

  getMasterData: async () => {
    const response = await fetch(`${API_URL}/GetMasterData`);
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getMappedUsersByCollectorId: async (collectorId) => {
    const response = await fetch(
      `${API_URL}/GetMappedUsersByCollectorId?userId=${collectorId}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getRetailUsers: async () => {
    const response = await fetch(`${API_URL}/GetRetailerUsers`);
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getCollectors: async () => {
    const response = await fetch(`${API_URL}/GetCollectorUsers`);
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getMappedUsers: async () => {
    const response = await fetch(`${API_URL}/GetMappedUsers`);
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getMappedCollectorsByRetailerId: async (retailerId) => {
    const response = await fetch(
      `${API_URL}/GetMappedCollectorsByRetailerId?userId=${retailerId}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getLiabilityAmountOfAllRetailers: async (date) => {
    const response = await fetch(
      `${API_URL}/GetLiabilityAmountOfAllRetailers?date=${date}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  GetLiabilityAmountByRetailerId: async (retailerId, date) => {
    const response = await fetch(
      `${API_URL}/GetLiabilityAmountByRetailerId?userId=${retailerId}&date=${date}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  addLedgeInfo: async (data) => {
    const response = await fetch(`${API_URL}/AddLedgeInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const result = await response.json();
    console.log(result);
    return result;
  },

  updateLedgerInfo: async (data) => {
    const response = await fetch(`${API_URL}/UpdateLadgerInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const result = await response.json();
    console.log(result);
    return result;
  },

  getLadgerInfoByRetailerid: async (date, retailerId) => {
    const response = await fetch(
      `${API_URL}/GetLadgerInfoByRetailerid?date=${date}&retailerId=${retailerId}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  getLadgerInfoByRetaileridAndCollectorId: async (
    date,
    retailerId,
    collectorId
  ) => {
    const response = await fetch(
      `${API_URL}/GetLadgerInfoByRetaileridAndCollectorId?date=${date}&retailerId=${retailerId}&collectorId=${collectorId}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  saveCollectorUser: async (user) => {
    const response = await fetch(`${API_URL}/SaveUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  },

  alignCollectorWithRetailerUser: async (data) => {
    const response = await fetch(`${API_URL}/AlignCollectorWithRetailerUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);
    }
    const result = await response.json();
    console.log(result);
    return result;
  }
};
