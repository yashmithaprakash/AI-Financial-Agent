const TransactionModel = require('../models/transactionModel');
const BudgetModel = require('../models/budgetModel');
const SavingsModel = require('../models/savingsModel');

const SummaryController = {
  async getSummary(req, res, next) {
    try {
      const userId = req.user?.id || 1;

      const totals = await TransactionModel.getTotals(userId);
      const budget = await BudgetModel.getCurrent(userId) || { total_budget: 55000, month: 'September 2026' };
      const totalSaved = await SavingsModel.getTotalSaved(userId);

      const totalIncome = totals.total_income;
      const totalExpenses = totals.total_expenses;
      const currentBalance = totals.current_balance;
      const monthlyBudget = budget.total_budget;
      const budgetRemaining = Math.max(0, monthlyBudget - totalExpenses);
      const budgetConsumedPercent = Math.min(100, Math.round((totalExpenses / (monthlyBudget || 1)) * 100));

      res.status(200).json({
        success: true,
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          monthlyBudget,
          amountSaved: totalSaved,
          budgetRemaining,
          budgetConsumedPercent,
          month: budget.month,
        },
        // Direct root fields for maximum consumer flexibility
        total_income: totalIncome,
        total_expenses: totalExpenses,
        current_balance: currentBalance,
        monthly_budget: monthlyBudget,
        amount_saved: totalSaved,
        budget_remaining: budgetRemaining,
        budget_consumed_percent: budgetConsumedPercent,
      });
    } catch (err) {
      next(err);
    }
  },

  async getExpenses(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const expenses = await TransactionModel.getAll(userId, { type: 'expense' });
      const breakdown = await TransactionModel.getCategoryBreakdown(userId, 'expense');
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      res.status(200).json({
        success: true,
        total_expenses: total,
        count: expenses.length,
        category_breakdown: breakdown.map((b) => ({
          category: b.category,
          amount: Number(b.amount),
          percentage: total > 0 ? Math.round((b.amount / total) * 100) : 0,
        })),
        expenses,
      });
    } catch (err) {
      next(err);
    }
  },

  async getIncome(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const incomeList = await TransactionModel.getAll(userId, { type: 'income' });
      const breakdown = await TransactionModel.getCategoryBreakdown(userId, 'income');
      const total = incomeList.reduce((sum, e) => sum + Number(e.amount), 0);

      res.status(200).json({
        success: true,
        total_income: total,
        count: incomeList.length,
        streams_breakdown: breakdown.map((b) => ({
          stream: b.category,
          amount: Number(b.amount),
          percentage: total > 0 ? Math.round((b.amount / total) * 100) : 0,
        })),
        income: incomeList,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBreakdown(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const breakdown = await TransactionModel.getCategoryBreakdown(userId, 'expense');
      const totalExpenses = breakdown.reduce((sum, b) => sum + Number(b.amount), 0);

      const formatted = breakdown.map((b) => ({
        category: b.category,
        amount: Number(b.amount),
        percentage: totalExpenses > 0 ? Math.round((b.amount / totalExpenses) * 100) : 0,
        count: Number(b.count),
      }));

      res.status(200).json({
        success: true,
        total: totalExpenses,
        breakdown: formatted,
      });
    } catch (err) {
      next(err);
    }
  },

  async getFinancialTips(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const totals = await TransactionModel.getTotals(userId);
      const breakdown = await TransactionModel.getCategoryBreakdown(userId, 'expense');

      const topCat = breakdown[0] || { category: 'Shopping', amount: 0 };
      const savingsRate = totals.total_income > 0 
        ? Math.round(((totals.total_income - totals.total_expenses) / totals.total_income) * 100) 
        : 0;

      const tips = [
        {
          id: 1,
          category: 'Savings Rate',
          title: 'Target 20% Net Savings Ratio',
          description: `Your current retained savings rate is ${savingsRate}%. Target directing at least ₹${Math.round(totals.total_income * 0.20).toLocaleString('en-IN')} towards automated recurring deposits.`,
        },
        {
          id: 2,
          category: 'Expense Trimming',
          title: `Optimize ${topCat.category} Spending`,
          description: `${topCat.category} represents your largest expense category (₹${Number(topCat.amount).toLocaleString('en-IN')}). Trimming non-essential discretionary items here can yield significant savings.`,
        },
        {
          id: 3,
          category: 'Budgeting Discipline',
          title: 'Enforce the 48-Hour Purchase Rule',
          description: 'Before making any purchase above ₹2,000, wait 48 hours to distinguish impulse wants from necessary lifestyle investments.',
        },
      ];

      res.status(200).json({
        success: true,
        tips,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SummaryController;
