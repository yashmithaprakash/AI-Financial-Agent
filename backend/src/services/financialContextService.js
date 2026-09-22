const TransactionModel = require('../models/transactionModel');
const BudgetModel = require('../models/budgetModel');
const SavingsModel = require('../models/savingsModel');

const FinancialContextService = {
  async getLiveContext(userId) {
    const totals = await TransactionModel.getTotals(userId);
    const budget = await BudgetModel.getCurrent(userId) || { total_budget: 55000, month: 'September 2026' };
    const totalSaved = await SavingsModel.getTotalSaved(userId);
    const categoryBreakdown = await TransactionModel.getCategoryBreakdown(userId, 'expense');
    const recentTx = await TransactionModel.getAll(userId, { limit: 5 });

    const totalIncome = totals.total_income;
    const totalExpenses = totals.total_expenses;
    const currentBalance = totals.current_balance;
    const totalBudget = budget.total_budget;
    const budgetRemaining = Math.max(0, totalBudget - totalExpenses);
    const budgetConsumedPercent = Math.min(100, Math.round((totalExpenses / (totalBudget || 1)) * 100));

    const topCategory = categoryBreakdown[0] || { category: 'None', amount: 0 };
    const topCategoryPercent = totalExpenses > 0 ? Math.round((topCategory.amount / totalExpenses) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      monthlyBudget: totalBudget,
      budgetMonth: budget.month,
      budgetRemaining,
      budgetConsumedPercent,
      totalSaved,
      topCategory: topCategory.category,
      topCategoryAmount: topCategory.amount,
      topCategoryPercent,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        amount: Number(c.amount),
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
      })),
      recentTransactions: recentTx.map((t) => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
    };
  },
};

module.exports = FinancialContextService;
