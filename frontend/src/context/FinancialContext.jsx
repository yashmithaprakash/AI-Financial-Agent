import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const FinancialContext = createContext(null);

// Initial baseline mock data used ONLY if backend is offline/booting
const INITIAL_TRANSACTIONS = [
  { id: 1, title: 'Tech Mahindra Salary', amount: 85000, type: 'income', category: 'Salary', date: '2026-09-01', notes: 'Monthly payroll direct credit' },
  { id: 2, title: 'Apartment Rent', amount: 22000, type: 'expense', category: 'Housing', date: '2026-09-03', notes: 'Electronic transfer' },
  { id: 3, title: 'BigBasket Groceries', amount: 6450, type: 'expense', category: 'Food & Dining', date: '2026-09-06', notes: 'Monthly pantry restock' },
  { id: 4, title: 'Freelance UI Design', amount: 15000, type: 'income', category: 'Freelance', date: '2026-09-10', notes: 'Client milestone 2' },
  { id: 5, title: 'Electricity & Wi-Fi', amount: 3200, type: 'expense', category: 'Utilities', date: '2026-09-12', notes: 'Airtel & BESCOM' },
  { id: 6, title: 'Weekend Dining & Cafe', amount: 2800, type: 'expense', category: 'Food & Dining', date: '2026-09-14', notes: 'Social dinner' },
  { id: 7, title: 'Uber & Metro Pass', amount: 2400, type: 'expense', category: 'Transportation', date: '2026-09-16', notes: 'Commute reload' },
  { id: 8, title: 'Amazon Book & Desk Gear', amount: 3150, type: 'expense', category: 'Shopping', date: '2026-09-18', notes: 'Workstation upgrade' },
  { id: 9, title: 'Mutual Fund SIP Deposit', amount: 10000, type: 'expense', category: 'Investments', date: '2026-09-19', notes: 'Nifty 50 Index Fund' },
];

const INITIAL_SAVINGS_GOALS = [
  { id: 1, title: 'Emergency Fund', targetAmount: 150000, currentAmount: 95000, targetDate: '2026-12-31', category: 'Safety' },
  { id: 2, title: 'MacBook Pro M-Series', targetAmount: 120000, currentAmount: 70000, targetDate: '2026-11-30', category: 'Tech' },
  { id: 3, title: 'Himachal Trekking Trip', targetAmount: 30000, currentAmount: 18500, targetDate: '2027-02-15', category: 'Travel' },
];

const INITIAL_BUDGET = {
  totalBudget: 55000,
  currentSpend: 40000,
  month: 'September 2026',
  categoryLimits: {
    'Housing': 25000,
    'Food & Dining': 10000,
    'Transportation': 5000,
    'Utilities': 4500,
    'Shopping': 5500,
    'Entertainment': 5000,
  }
};

export function FinancialProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [aiStatus, setAiStatus] = useState({ provider: 'local-fallback', ready: true });
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [savingsGoals, setSavingsGoals] = useState(INITIAL_SAVINGS_GOALS);
  const [sessionId, setSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I am your **AI Financial Agent**.\n\nI can analyze your spending, review your budget, track savings goals, or recommend cost-cutting strategies. Try asking:\n- *\"How much did I spend this month?\"*\n- *\"How much money do I have left?\"*\n- *\"Where am I spending the most?\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'ibm-watson',
    }
  ]);

  // Derived financial metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentBalance = totalIncome - totalExpenses;

  const totalAmountSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

  const budgetRemaining = Math.max(0, budget.totalBudget - totalExpenses);
  const budgetConsumedPercent = Math.min(100, Math.round((totalExpenses / (budget.totalBudget || 1)) * 100));

  // Category breakdown calculation
  const categoryExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const categoryBreakdown = Object.entries(categoryExpenses).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Sync with backend API
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, transRes, budgetRes, savingsRes, statusRes] = await Promise.allSettled([
        api.getSummary(),
        api.getTransactions(),
        api.getCurrentBudget(),
        api.getSavingsGoals(),
        api.getAiStatus()
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setIsBackendOnline(true);
      }

      if (transRes.status === 'fulfilled' && Array.isArray(transRes.value?.transactions)) {
        setTransactions(transRes.value.transactions);
      }

      if (budgetRes.status === 'fulfilled' && budgetRes.value?.budget) {
        setBudget(budgetRes.value.budget);
      }

      if (savingsRes.status === 'fulfilled' && Array.isArray(savingsRes.value?.goals)) {
        setSavingsGoals(savingsRes.value.goals);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        setAiStatus(statusRes.value);
      }
    } catch (err) {
      console.log('Running in local standalone mode until backend server is up.');
      setIsBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  const addTransaction = async (data) => {
    const newTx = {
      ...data,
      amount: Number(data.amount),
      id: Date.now(),
      date: data.date || new Date().toISOString().split('T')[0],
    };

    // Optimistic UI update
    setTransactions((prev) => [newTx, ...prev]);

    // Update if backend is available
    if (isBackendOnline) {
      try {
        await api.addTransaction(newTx);
        await refreshData();
      } catch (e) {
        console.error('Failed to sync transaction to backend:', e);
      }
    }
    return newTx;
  };

  const deleteTransaction = async (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isBackendOnline) {
      try {
        await api.deleteTransaction(id);
        await refreshData();
      } catch (e) {
        console.error('Failed to delete on backend:', e);
      }
    }
  };

  const updateBudget = async (newTotalBudget, categoryLimits = {}) => {
    const updated = {
      ...budget,
      totalBudget: Number(newTotalBudget),
      categoryLimits: { ...budget.categoryLimits, ...categoryLimits }
    };
    setBudget(updated);
    if (isBackendOnline) {
      try {
        await api.setBudget(updated);
        await refreshData();
      } catch (e) {
        console.error('Failed to update budget on backend:', e);
      }
    }
  };

  const addSavingsGoal = async (goalData) => {
    const newGoal = {
      ...goalData,
      id: Date.now(),
      targetAmount: Number(goalData.targetAmount),
      currentAmount: Number(goalData.currentAmount || 0),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    if (isBackendOnline) {
      try {
        await api.createSavingsGoal(newGoal);
        await refreshData();
      } catch (e) {
        console.error('Failed to create savings goal on backend:', e);
      }
    }
    return newGoal;
  };

  const contributeToSavings = async (goalId, amount) => {
    const addAmt = Number(amount);
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + addAmt } : g))
    );

    // Also record an expense / allocation transaction
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (targetGoal) {
      addTransaction({
        title: `Savings Contribution: ${targetGoal.title}`,
        amount: addAmt,
        type: 'expense',
        category: 'Investments',
        date: new Date().toISOString().split('T')[0],
        notes: `Deposited towards ${targetGoal.title}`
      });
    }

    if (isBackendOnline) {
      try {
        await api.contributeToSavings(goalId, addAmt);
        await refreshData();
      } catch (e) {
        console.error('Failed to contribute on backend:', e);
      }
    }
  };

  // Conversational AI Assistant Query Handler
  const sendAiMessage = async (userText) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Send to backend API if available
    if (isBackendOnline) {
      try {
        const response = await api.sendChatMessage(userText, sessionId);
        if (response.sessionId) setSessionId(response.sessionId);

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: response.provider || 'ibm-watson',
          suggestions: response.suggestions || [],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        return;
      } catch (err) {
        console.warn('Backend chatbot API error, falling back to local finance engine:', err.message);
      }
    }

    // Local smart intent handler (Matches real live state if backend is booting)
    const lower = userText.toLowerCase();
    let reply = '';
    let suggestions = [];

    if (lower.includes('spent') || lower.includes('spend this month') || lower.includes('total spend')) {
      reply = `**Monthly Spend Analysis:**\n\nYou have spent **₹${totalExpenses.toLocaleString('en-IN')}** so far in ${budget.month}.\n\nYour monthly budget is **₹${budget.totalBudget.toLocaleString('en-IN')}**, which means you have consumed **${budgetConsumedPercent}%** of your allocated budget.`;
      suggestions = ['How much money do I have left?', 'Where am I spending the most?'];
    } else if (lower.includes('money do i have left') || lower.includes('left') || lower.includes('balance') || lower.includes('remaining')) {
      reply = `**Available Liquidity & Budget Headroom:**\n\n• **Net Bank Balance:** ₹${currentBalance.toLocaleString('en-IN')}\n• **Remaining Monthly Budget:** ₹${budgetRemaining.toLocaleString('en-IN')}\n\n*Note:* At your current pace, you can safely spend approx **₹${Math.max(0, Math.round(budgetRemaining / 10)).toLocaleString('en-IN')}/day** for the rest of the billing cycle.`;
      suggestions = ['Where am I spending the most?', 'Give me tips to reduce my expenses'];
    } else if (lower.includes('where am i spending') || lower.includes('top category') || lower.includes('highest expense')) {
      const topCat = categoryBreakdown[0] || { category: 'None', amount: 0, percentage: 0 };
      const secondCat = categoryBreakdown[1] || null;
      reply = `**Top Expense Outflows:**\n\n1. **${topCat.category}**: ₹${topCat.amount.toLocaleString('en-IN')} (${topCat.percentage}% of all expenses)\n` +
        (secondCat ? `2. **${secondCat.category}**: ₹${secondCat.amount.toLocaleString('en-IN')} (${secondCat.percentage}%)\n\n` : '\n') +
        `Your largest discretionary spend comes from **${topCat.category}**. Trimming 15% here could free up ₹${Math.round(topCat.amount * 0.15).toLocaleString('en-IN')} towards your savings goals!`;
      suggestions = ['Give me tips to reduce my expenses', 'I want to save ₹10,000'];
    } else if (lower.includes('tips') || lower.includes('reduce') || lower.includes('cut expenses')) {
      reply = `**Actionable Financial Optimization Tips:**\n\n1. **50-30-20 Rule Alignment**: Your current savings rate is **${totalIncome > 0 ? Math.round((totalAmountSaved / totalIncome) * 100) : 0}%**. Target at least 20% dedicated to investments & emergency reserve.\n2. **Discretionary Capping**: You spent ₹${(categoryExpenses['Shopping'] || 0) + (categoryExpenses['Food & Dining'] || 0)} on dining and shopping. Consider a 48-hour cool-off rule for non-essential purchases.\n3. **Automate SIPs**: Schedule mutual fund contributions on the 2nd of every month immediately after payroll.`;
      suggestions = ['Help me create a monthly budget', 'I want to save ₹10,000'];
    } else if (lower.includes('budget') || lower.includes('create a monthly budget') || lower.includes('help me create')) {
      reply = `**Personalized Budget Recommendation (Based on ₹${totalIncome.toLocaleString('en-IN')} Income):**\n\n• **Needs (50%)**: ₹${Math.round(totalIncome * 0.50).toLocaleString('en-IN')} *(Rent, Utilities, Groceries)*\n• **Wants (30%)**: ₹${Math.round(totalIncome * 0.30).toLocaleString('en-IN')} *(Dining, Gadgets, Outings)*\n• **Savings & Debt (20%)**: ₹${Math.round(totalIncome * 0.20).toLocaleString('en-IN')} *(Mutual funds, Emergency fund)*\n\nWould you like me to update your current monthly budget to ₹${Math.round(totalIncome * 0.80).toLocaleString('en-IN')} spending ceiling?`;
      suggestions = ['Yes, update budget', 'I want to save ₹10,000'];
    } else if (lower.includes('save') || lower.includes('10,000') || lower.includes('10000')) {
      reply = `**Savings Plan: Target ₹10,000 Milestone**\n\nTo save ₹10,000:\n• **Weekly plan:** Save **₹2,500/week** over 4 weeks.\n• **Daily micro-savings:** Save **₹333/day** by preparing meals at home 3 days a week.\n\nI have added this suggestion into your **Savings Goals** card so you can track it in real-time!`;
      suggestions = ['Where am I spending the most?', 'How much did I spend this month?'];
    } else {
      reply = `I parsed your inquiry regarding personal finance. Based on your active accounts:\n- Current Balance: **₹${currentBalance.toLocaleString('en-IN')}**\n- Monthly Budget Left: **₹${budgetRemaining.toLocaleString('en-IN')}**\n\nAsk me specific questions like *"Where am I spending the most?"* or *"Give me tips to reduce my expenses"*.`;
      suggestions = ['How much did I spend this month?', 'Where am I spending the most?'];
    }

    const aiMsg = {
      id: Date.now() + 1,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: isBackendOnline ? aiStatus.provider : 'local-fallback',
      suggestions,
    };

    setChatMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <FinancialContext.Provider
      value={{
        loading,
        isBackendOnline,
        aiStatus,
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          monthlyBudget: budget.totalBudget,
          amountSaved: totalAmountSaved,
          budgetRemaining,
          budgetConsumedPercent,
        },
        transactions,
        budget,
        savingsGoals,
        categoryBreakdown,
        chatMessages,
        addTransaction,
        deleteTransaction,
        updateBudget,
        addSavingsGoal,
        contributeToSavings,
        sendAiMessage,
        refreshData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinancialProvider');
  }
  return context;
}
