const BudgetModel = require('../models/budgetModel');
const TransactionModel = require('../models/transactionModel');

const BudgetController = {
  async getBudget(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      let budget = await BudgetModel.getCurrent(userId);

      if (!budget) {
        budget = await BudgetModel.create({
          userId,
          month: 'September 2026',
          totalBudget: 55000,
          categoryLimits: {
            'Housing': 25000,
            'Food & Dining': 10000,
            'Transportation': 5000,
            'Utilities': 4500,
            'Shopping': 5500,
            'Entertainment': 5000,
          },
        });
      }

      const totals = await TransactionModel.getTotals(userId);
      const categoryExpenses = await TransactionModel.getCategoryBreakdown(userId, 'expense');

      const currentSpend = totals.total_expenses;
      const budgetRemaining = Math.max(0, budget.total_budget - currentSpend);
      const percentUsed = Math.min(100, Math.round((currentSpend / (budget.total_budget || 1)) * 100));

      res.status(200).json({
        success: true,
        budget: {
          id: budget.id,
          month: budget.month,
          totalBudget: budget.total_budget,
          total_budget: budget.total_budget,
          categoryLimits: budget.category_limits,
          category_limits: budget.category_limits,
          currentSpend,
          current_spend: currentSpend,
          budgetRemaining,
          budget_remaining: budgetRemaining,
          percentUsed,
          percent_used: percentUsed,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async createBudget(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { month, total_budget, totalBudget, category_limits, categoryLimits } = req.body;

      const total = total_budget !== undefined ? total_budget : totalBudget;
      const limits = category_limits !== undefined ? category_limits : categoryLimits;

      const newBudget = await BudgetModel.create({
        userId,
        month: month || 'September 2026',
        totalBudget: total,
        categoryLimits: limits || {},
      });

      res.status(201).json({
        success: true,
        message: 'Monthly budget created successfully.',
        budget: newBudget,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { id } = req.params;
      const { month, total_budget, totalBudget, category_limits, categoryLimits } = req.body;

      const total = total_budget !== undefined ? total_budget : totalBudget;
      const limits = category_limits !== undefined ? category_limits : categoryLimits;

      const updated = await BudgetModel.update(id, userId, {
        month,
        totalBudget: total,
        categoryLimits: limits,
      });

      if (!updated) {
        return res.status(404).json({ error: `Budget with ID ${id} not found.` });
      }

      res.status(200).json({
        success: true,
        message: 'Budget updated successfully.',
        budget: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BudgetController;
