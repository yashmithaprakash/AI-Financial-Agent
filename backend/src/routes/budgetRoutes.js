const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validator');

router.get('/', authMiddleware, BudgetController.getBudget);
router.get('/current', authMiddleware, BudgetController.getBudget);
router.post('/', authMiddleware, validateBudget, BudgetController.createBudget);
router.put('/:id', authMiddleware, validateBudget, BudgetController.updateBudget);

module.exports = router;
