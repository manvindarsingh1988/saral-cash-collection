// Mock data
const users = [
  { id: '1', email: 'admin@example.com', password: 'admin123', role: 'Admin' },
  { id: '2', email: 'collector1@example.com', password: 'pass123', role: 'Collector' },
  { id: '3', email: 'collector2@example.com', password: 'pass123', role: 'Collector' },
  { id: '4', email: 'retail1@example.com', password: 'pass123', role: 'RetailUser', assignedCollectorId: '2' },
  { id: '5', email: 'retail2@example.com', password: 'pass123', role: 'RetailUser', assignedCollectorId: null },
];

const transactions = [
  { 
    id: '1', 
    retailUserId: '4', 
    collectorId: '2', 
    amount: 1000, 
    date: '2025-03-10', 
    status: 'Done',
    handoverDate: '2025-03-10'
  },
  { 
    id: '2', 
    retailUserId: '4', 
    collectorId: '2', 
    amount: 2000, 
    date: '2025-03-11', 
    status: 'InProgress'
  }
];

let currentUser = null;

// Mock API functions
export const mockApi = {
  signIn: async (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    currentUser = user;
    localStorage.setItem('mockUser', JSON.stringify(user));
    return { user };
  },

  signOut: async () => {
    currentUser = null;
    localStorage.removeItem('mockUser');
  },

  getCurrentUser: () => {
    if (!currentUser) {
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    }
    return currentUser;
  },

  getCollectors: async () => {
    return users.filter(u => u.role === 'Collector');
  },

  getRetailUsers: async () => {
    return users.filter(u => u.role === 'RetailUser');
  },

  createCollector: async (email, password) => {
    const newId = String(users.length + 1);
    const newCollector = {
      id: newId,
      email,
      password,
      role: 'Collector'
    };
    users.push(newCollector);
    return { user: newCollector };
  },

  assignCollector: async (retailUserId, collectorId) => {
    const retailUser = users.find(u => u.id === retailUserId);
    if (retailUser) {
      retailUser.assignedCollectorId = collectorId;
    }
    return { success: true };
  },

  getStats: async () => {
    const user = mockApi.getCurrentUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    switch (user.role) {
      case 'RetailUser':
        const retailTransactions = transactions.filter(t => t.retailUserId === user.id);
        return {
          totalLiability: retailTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: retailTransactions,
          role: 'RetailUser'
        };

      case 'Collector':
        const collectorTransactions = transactions.filter(t => t.collectorId === user.id);
        return {
          totalCollected: collectorTransactions
            .filter(t => t.status === 'Done')
            .reduce((sum, t) => sum + t.amount, 0),
          pendingCollection: collectorTransactions
            .filter(t => t.status === 'InProgress')
            .reduce((sum, t) => sum + t.amount, 0),
          transactions: collectorTransactions,
          role: 'Collector'
        };

      case 'Admin':
        return {
          totalCollectors: users.filter(u => u.role === 'Collector').length,
          totalRetailUsers: users.filter(u => u.role === 'RetailUser').length,
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          pendingAmount: transactions
            .filter(t => t.status === 'InProgress')
            .reduce((sum, t) => sum + t.amount, 0),
          transactions: transactions,
          role: 'Admin'
        };

      default:
        throw new Error('Invalid role');
    }
  },

  updateTransactionStatus: async (transactionId, status) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      transaction.status = status;
      if (status === 'Done') {
        transaction.handoverDate = new Date().toISOString().split('T')[0];
      } else {
        delete transaction.handoverDate;
      }
    }
    return { success: true };
  },

  createTransaction: async (amount) => {
    const user = mockApi.getCurrentUser();
    if (!user || user.role !== 'RetailUser') {
      throw new Error('Unauthorized');
    }

    const retailUser = users.find(u => u.id === user.id);
    if (!retailUser.assignedCollectorId) {
      throw new Error('No collector assigned');
    }

    const newTransaction = {
      id: String(transactions.length + 1),
      retailUserId: user.id,
      collectorId: retailUser.assignedCollectorId,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'InProgress'
    };

    transactions.push(newTransaction);
    return { transaction: newTransaction };
  }
};