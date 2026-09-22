const { db } = require('../config/database');

const TransactionModel = {
  async getAll(userId, { type, category, search, limit } = {}) {
    let sql = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [userId];

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      sql += ` AND type = ?`;
      params.push(type.toLowerCase());
    }

    if (category && category !== 'All' && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (title LIKE ? OR notes LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY date DESC, id DESC`;

    if (limit && Number(limit) > 0) {
      sql += ` LIMIT ?`;
      params.push(Number(limit));
    }

    return db.allAsync(sql, params);
  },

  async getById(id, userId) {
    return db.getAsync(`SELECT * FROM transactions WHERE id = ? AND user_id = ?`, [id, userId]);
  },

  async create({ userId, title, amount, type, category, date, notes = '' }) {
    const txDate = date || new Date().toISOString().split('T')[0];
    const result = await db.runAsync(`
      INSERT INTO transactions (user_id, title, amount, type, category, date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, title.trim(), Number(amount), type.toLowerCase(), category.trim(), txDate, notes ? notes.trim() : '']);

    return this.getById(result.lastID, userId);
  },

  async delete(id, userId) {
    const existing = await this.getById(id, userId);
    if (!existing) return false;
    await db.runAsync(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, [id, userId]);
    return true;
  },

  async getTotals(userId) {
    const row = await db.getAsync(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(*) as total_count
      FROM transactions
      WHERE user_id = ?
    `, [userId]);

    const totalIncome = Number(row.total_income);
    const totalExpenses = Number(row.total_expenses);
    const balance = totalIncome - totalExpenses;

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      current_balance: balance,
      expense_count: Number(row.expense_count),
      income_count: Number(row.income_count),
      total_count: Number(row.total_count),
    };
  },

  async getCategoryBreakdown(userId, type = 'expense') {
    return db.allAsync(`
      SELECT 
        category,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND type = ?
      GROUP BY category
      ORDER BY amount DESC
    `, [userId, type]);
  },
};

module.exports = TransactionModel;
