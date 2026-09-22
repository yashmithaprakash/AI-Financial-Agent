const express = require('express');
const router = express.Router();
const SummaryController = require('../controllers/summaryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/summary', authMiddleware, SummaryController.getSummary);
router.get('/expenses', authMiddleware, SummaryController.getExpenses);
router.get('/income', authMiddleware, SummaryController.getIncome);
router.get('/category-breakdown', authMiddleware, SummaryController.getCategoryBreakdown);
router.get('/tips', authMiddleware, SummaryController.getFinancialTips);

module.exports = router;
