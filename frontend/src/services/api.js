// API Service for AI Financial Agent
// Connects directly to Node.js/Express REST backend on /api

const API_BASE = '/api';

// Helper for fetch with JSON parsing and error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // If backend is not yet running, throw so calling code can gracefully handle or use fallback
    console.warn(`[API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Analytics & Dashboard Summary
  async getSummary() {
    return request('/analytics/summary');
  },

  async getCategoryBreakdown() {
    return request('/analytics/category-breakdown');
  },

  async getFinancialTips() {
    return request('/analytics/tips');
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  async addTransaction(transactionData) {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  async deleteTransaction(id) {
    return request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Budgets
  async getCurrentBudget() {
    return request('/budgets/current');
  },

  async setBudget(budgetData) {
    return request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  },

  // Savings Goals
  async getSavingsGoals() {
    return request('/savings');
  },

  async createSavingsGoal(goalData) {
    return request('/savings', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  async contributeToSavings(id, amount) {
    return request(`/savings/${id}/contribute`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  },

  // Conversational AI (IBM Watson Assistant V2 / Local Fallback)
  async sendChatMessage(message, sessionId = null) {
    return request('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  },

  async getAiStatus() {
    return request('/chatbot/status');
  },
};

export default api;
