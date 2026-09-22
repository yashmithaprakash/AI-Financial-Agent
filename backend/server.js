require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/config/database');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const summaryRoutes = require('./src/routes/summaryRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const savingsRoutes = require('./src/routes/savingsRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging middleware for debugging and interview verification
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI Financial Agent REST API',
    timestamp: new Date().toISOString(),
    engine: process.env.WATSON_ASSISTANT_APIKEY ? 'IBM Watson Assistant V2' : 'Local Finance NLP Engine',
  });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Mounting summary and analytics (supporting both /api/summary and /api/analytics/summary)
app.use('/api', summaryRoutes);
app.use('/api/analytics', summaryRoutes);

// Mounting budget routes (supporting both singular /api/budget and plural /api/budgets)
app.use('/api/budget', budgetRoutes);
app.use('/api/budgets', budgetRoutes);

// Mounting savings routes (supporting both /api/savings-goals and /api/savings)
app.use('/api/savings-goals', savingsRoutes);
app.use('/api/savings', savingsRoutes);

// Mounting AI Chatbot routes
app.use('/api/chatbot', chatbotRoutes);

// 404 and Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize SQLite Schema & Start Express Server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Financial Agent Backend running on port ${PORT}`);
    console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Engine: ${process.env.WATSON_ASSISTANT_APIKEY ? 'IBM Watson Assistant V2' : 'Local NLP Engine (Fallback)'}`);
    console.log(`=======================================================`);
  });
}).catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

module.exports = app;
