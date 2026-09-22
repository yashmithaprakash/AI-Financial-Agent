// Request Data Validation Middleware

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Valid full name is required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  next();
}

function validateTransaction(req, res, next) {
  const { title, amount, type, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Transaction title is required.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({ error: "Type must be either 'income' or 'expense'." });
  }

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category is required.' });
  }

  next();
}

function validateBudget(req, res, next) {
  const totalBudget = req.body.total_budget !== undefined ? req.body.total_budget : req.body.totalBudget;

  if (totalBudget === undefined || isNaN(Number(totalBudget)) || Number(totalBudget) <= 0) {
    return res.status(400).json({ error: 'total_budget must be a valid positive number.' });
  }

  next();
}

function validateSavingsGoal(req, res, next) {
  const { title } = req.body;
  const targetAmount = req.body.target_amount !== undefined ? req.body.target_amount : req.body.targetAmount;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Goal title is required.' });
  }

  if (targetAmount === undefined || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
    return res.status(400).json({ error: 'target_amount must be a valid positive number.' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction,
  validateBudget,
  validateSavingsGoal,
};
