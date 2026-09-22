const { db } = require('../config/database');

const SavingsModel = {
  async getAll(userId) {
    const rows = await db.allAsync(`
      SELECT * FROM savings_goals 
      WHERE user_id = ? 
      ORDER BY id ASC
    `, [userId]);

    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      title: r.title,
      target_amount: Number(r.target_amount),
      current_amount: Number(r.current_amount),
      target_date: r.target_date,
      category: r.category,
      created_at: r.created_at,
    }));
  },

  async getById(id, userId) {
    const r = await db.getAsync(`
      SELECT * FROM savings_goals 
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (!r) return null;

    return {
      id: r.id,
      user_id: r.user_id,
      title: r.title,
      target_amount: Number(r.target_amount),
      current_amount: Number(r.current_amount),
      target_date: r.target_date,
      category: r.category,
      created_at: r.created_at,
    };
  },

  async create({ userId, title, targetAmount, currentAmount = 0, targetDate = '2026-12-31', category = 'General' }) {
    const result = await db.runAsync(`
      INSERT INTO savings_goals (user_id, title, target_amount, current_amount, target_date, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title.trim(), Number(targetAmount), Number(currentAmount), targetDate, category]);

    return this.getById(result.lastID, userId);
  },

  async update(id, userId, updates) {
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title.trim() : existing.title;
    const targetAmount = updates.target_amount !== undefined ? Number(updates.target_amount) : existing.target_amount;
    const currentAmount = updates.current_amount !== undefined ? Number(updates.current_amount) : existing.current_amount;
    const targetDate = updates.target_date !== undefined ? updates.target_date : existing.target_date;
    const category = updates.category !== undefined ? updates.category : existing.category;

    await db.runAsync(`
      UPDATE savings_goals
      SET title = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?
      WHERE id = ? AND user_id = ?
    `, [title, targetAmount, currentAmount, targetDate, category, id, userId]);

    return this.getById(id, userId);
  },

  async contribute(id, userId, amount) {
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const newAmount = existing.current_amount + Number(amount);
    await db.runAsync(`
      UPDATE savings_goals
      SET current_amount = ?
      WHERE id = ? AND user_id = ?
    `, [newAmount, id, userId]);

    return this.getById(id, userId);
  },

  async getTotalSaved(userId) {
    const row = await db.getAsync(`
      SELECT COALESCE(SUM(current_amount), 0) as total_saved
      FROM savings_goals
      WHERE user_id = ?
    `, [userId]);

    return Number(row.total_saved);
  },
};

module.exports = SavingsModel;
