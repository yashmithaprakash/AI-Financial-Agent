const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'finance.sqlite');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Promisified helper methods for clean async/await
db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize schema and seed data
async function initializeDatabase() {
  try {
    // 1. Users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        monthly_income REAL DEFAULT 85000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Transactions table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Budgets table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        month TEXT NOT NULL,
        total_budget REAL NOT NULL,
        category_limits TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Savings goals table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        title TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        target_date TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed default demo user if not exists
    const existingUser = await db.getAsync(`SELECT * FROM users WHERE email = ?`, ['yashmitha@demo.com']);
    let userId = 1;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      const userRes = await db.runAsync(`
        INSERT INTO users (name, email, password, monthly_income)
        VALUES (?, ?, ?, ?)
      `, ['Yashmitha S.', 'yashmitha@demo.com', hashedPassword, 85000]);
      userId = userRes.lastID;
    } else {
      userId = existingUser.id;
    }

    // Seed initial transactions if empty
    const txCount = await db.getAsync(`SELECT COUNT(*) as count FROM transactions WHERE user_id = ?`, [userId]);
    if (txCount.count === 0) {
      console.log('Seeding initial transactions for demo user...');
      const sampleTx = [
        ['Tech Mahindra Salary', 85000, 'income', 'Salary', '2026-09-01', 'Monthly direct credit'],
        ['Apartment Rent', 22000, 'expense', 'Housing', '2026-09-03', 'Electronic transfer'],
        ['BigBasket Groceries', 6450, 'expense', 'Food & Dining', '2026-09-06', 'Monthly pantry restock'],
        ['Freelance UI Design', 15000, 'income', 'Freelance', '2026-09-10', 'Milestone 2 payout'],
        ['Electricity & Wi-Fi', 3200, 'expense', 'Utilities', '2026-09-12', 'Airtel & BESCOM'],
        ['Weekend Dining & Cafe', 2800, 'expense', 'Food & Dining', '2026-09-14', 'Social dinner'],
        ['Uber & Metro Pass', 2400, 'expense', 'Transportation', '2026-09-16', 'Commute reload'],
        ['Amazon Workstation Gear', 3150, 'expense', 'Shopping', '2026-09-18', 'Ergonomic desk accessories'],
        ['Mutual Fund SIP Deposit', 10000, 'expense', 'Investments', '2026-09-19', 'Nifty 50 Index Fund'],
      ];

      for (const tx of sampleTx) {
        await db.runAsync(`
          INSERT INTO transactions (user_id, title, amount, type, category, date, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, ...tx]);
      }
    }

    // Seed budget if empty
    const budgetCount = await db.getAsync(`SELECT COUNT(*) as count FROM budgets WHERE user_id = ?`, [userId]);
    if (budgetCount.count === 0) {
      const defaultLimits = JSON.stringify({
        'Housing': 25000,
        'Food & Dining': 10000,
        'Transportation': 5000,
        'Utilities': 4500,
        'Shopping': 5500,
        'Entertainment': 5000
      });

      await db.runAsync(`
        INSERT INTO budgets (user_id, month, total_budget, category_limits)
        VALUES (?, ?, ?, ?)
      `, [userId, 'September 2026', 55000, defaultLimits]);
    }

    // Seed savings goals if empty
    const savingsCount = await db.getAsync(`SELECT COUNT(*) as count FROM savings_goals WHERE user_id = ?`, [userId]);
    if (savingsCount.count === 0) {
      const sampleGoals = [
        ['Emergency Fund', 150000, 95000, '2026-12-31', 'Safety'],
        ['MacBook Pro M-Series', 120000, 70000, '2026-11-30', 'Tech'],
        ['Himachal Trekking Trip', 30000, 18500, '2027-02-15', 'Travel']
      ];

      for (const g of sampleGoals) {
        await db.runAsync(`
          INSERT INTO savings_goals (user_id, title, target_amount, current_amount, target_date, category)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, ...g]);
      }
    }

    console.log('SQLite database schema & seed initialization complete.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

module.exports = {
  db,
  initializeDatabase,
};
