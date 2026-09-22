const { db } = require('../config/database');

const BudgetModel = {
  async getCurrent(userId) {
    const row = await db.getAsync(`
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY id DESC LIMIT 1
    `, [userId]);

    if (!row) return null;

    let categoryLimits = {};
    try {
      categoryLimits = row.category_limits ? JSON.parse(row.category_limits) : {};
    } catch (e) {
      categoryLimits = {};
    }

    return {
      id: row.id,
      user_id: row.user_id,
      month: row.month,
      total_budget: Number(row.total_budget),
      category_limits: categoryLimits,
      created_at: row.created_at,
    };
  },

  async getById(id, userId) {
    const row = await db.getAsync(`
      SELECT * FROM budgets 
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (!row) return null;

    let categoryLimits = {};
    try {
      categoryLimits = row.category_limits ? JSON.parse(row.category_limits) : {};
    } catch (e) {
      categoryLimits = {};
    }

    return {
      id: row.id,
      user_id: row.user_id,
      month: row.month,
      total_budget: Number(row.total_budget),
      category_limits: categoryLimits,
      created_at: row.created_at,
    };
  },

  async create({ userId, month = 'September 2026', totalBudget, categoryLimits = {} }) {
    const serializedLimits = typeof categoryLimits === 'string' 
      ? categoryLimits 
      : JSON.stringify(categoryLimits);

    const result = await db.runAsync(`
      INSERT INTO budgets (user_id, month, total_budget, category_limits)
      VALUES (?, ?, ?, ?)
    `, [userId, month, Number(totalBudget), serializedLimits]);

    return this.getById(result.lastID, userId);
  },

  async update(id, userId, { totalBudget, categoryLimits, month }) {
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const newTotal = totalBudget !== undefined ? Number(totalBudget) : existing.total_budget;
    const newMonth = month || existing.month;
    const newLimits = categoryLimits !== undefined 
      ? (typeof categoryLimits === 'string' ? categoryLimits : JSON.stringify(categoryLimits))
      : JSON.stringify(existing.category_limits);

    await db.runAsync(`
      UPDATE budgets 
      SET total_budget = ?, category_limits = ?, month = ?
      WHERE id = ? AND user_id = ?
    `, [newTotal, newLimits, newMonth, id, userId]);

    return this.getById(id, userId);
  },
};

module.exports = BudgetModel;
