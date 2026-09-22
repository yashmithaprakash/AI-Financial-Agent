const { db } = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    return db.getAsync(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
  },

  async findById(id) {
    return db.getAsync(`SELECT id, name, email, monthly_income, created_at FROM users WHERE id = ?`, [id]);
  },

  async create({ name, email, password, monthlyIncome = 85000 }) {
    const result = await db.runAsync(`
      INSERT INTO users (name, email, password, monthly_income)
      VALUES (?, ?, ?, ?)
    `, [name.trim(), email.toLowerCase().trim(), password, Number(monthlyIncome)]);

    return this.findById(result.lastID);
  },
};

module.exports = UserModel;
