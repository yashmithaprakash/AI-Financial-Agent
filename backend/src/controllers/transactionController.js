const TransactionModel = require('../models/transactionModel');

const TransactionController = {
  async getTransactions(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { type, category, search, limit } = req.query;

      const transactions = await TransactionModel.getAll(userId, {
        type,
        category,
        search,
        limit,
      });

      res.status(200).json({
        success: true,
        count: transactions.length,
        transactions,
      });
    } catch (err) {
      next(err);
    }
  },

  async addTransaction(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { title, amount, type, category, date, notes } = req.body;

      const newTx = await TransactionModel.create({
        userId,
        title,
        amount,
        type,
        category,
        date,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Transaction recorded successfully.',
        transaction: newTx,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteTransaction(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { id } = req.params;

      const success = await TransactionModel.delete(id, userId);
      if (!success) {
        return res.status(404).json({ error: `Transaction with ID ${id} not found.` });
      }

      res.status(200).json({
        success: true,
        message: `Transaction ${id} deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TransactionController;
