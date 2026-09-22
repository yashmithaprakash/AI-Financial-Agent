const SavingsModel = require('../models/savingsModel');
const TransactionModel = require('../models/transactionModel');

const SavingsController = {
  async getSavingsGoals(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const goals = await SavingsModel.getAll(userId);
      const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

      // Support both camelCase for frontend and snake_case for standard REST
      const formatted = goals.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: g.target_amount,
        target_amount: g.target_amount,
        currentAmount: g.current_amount,
        current_amount: g.current_amount,
        targetDate: g.target_date,
        target_date: g.target_date,
        category: g.category,
      }));

      res.status(200).json({
        success: true,
        count: goals.length,
        total_saved: totalSaved,
        goals: formatted,
      });
    } catch (err) {
      next(err);
    }
  },

  async createSavingsGoal(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const {
        title,
        target_amount,
        targetAmount,
        current_amount,
        currentAmount,
        target_date,
        targetDate,
        category,
      } = req.body;

      const target = target_amount !== undefined ? target_amount : targetAmount;
      const current = current_amount !== undefined ? current_amount : currentAmount;
      const date = target_date !== undefined ? target_date : targetDate;

      const newGoal = await SavingsModel.create({
        userId,
        title,
        targetAmount: target,
        currentAmount: current || 0,
        targetDate: date || '2026-12-31',
        category: category || 'Milestone',
      });

      res.status(201).json({
        success: true,
        message: 'Savings goal created successfully.',
        goal: newGoal,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSavingsGoal(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { id } = req.params;
      const {
        title,
        target_amount,
        targetAmount,
        current_amount,
        currentAmount,
        target_date,
        targetDate,
        category,
      } = req.body;

      const updates = {
        title,
        target_amount: target_amount !== undefined ? target_amount : targetAmount,
        current_amount: current_amount !== undefined ? current_amount : currentAmount,
        target_date: target_date !== undefined ? target_date : targetDate,
        category,
      };

      const updated = await SavingsModel.update(id, userId, updates);
      if (!updated) {
        return res.status(404).json({ error: `Savings goal with ID ${id} not found.` });
      }

      res.status(200).json({
        success: true,
        message: 'Savings goal updated successfully.',
        goal: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async contributeSavingsGoal(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { id } = req.params;
      const { amount } = req.body;

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Deposit amount must be a positive number.' });
      }

      const updatedGoal = await SavingsModel.contribute(id, userId, numAmount);
      if (!updatedGoal) {
        return res.status(404).json({ error: `Savings goal with ID ${id} not found.` });
      }

      // Automatically register a corresponding transaction
      await TransactionModel.create({
        userId,
        title: `Savings Deposit: ${updatedGoal.title}`,
        amount: numAmount,
        type: 'expense',
        category: 'Investments',
        date: new Date().toISOString().split('T')[0],
        notes: `Allocated to ${updatedGoal.title}`,
      });

      res.status(200).json({
        success: true,
        message: `Successfully deposited ₹${numAmount.toLocaleString('en-IN')} to goal ${updatedGoal.title}.`,
        goal: updatedGoal,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SavingsController;
