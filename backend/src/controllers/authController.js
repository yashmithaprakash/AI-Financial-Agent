const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'ibm_financial_agent_jwt_secure_secret_key_2026';

const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password, monthly_income, monthlyIncome } = req.body;
      const income = monthly_income !== undefined ? monthly_income : monthlyIncome;

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        monthlyIncome: income || 85000,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          monthly_income: user.monthly_income,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          monthly_income: user.monthly_income,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
