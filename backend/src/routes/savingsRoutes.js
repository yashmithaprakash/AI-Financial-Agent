const express = require('express');
const router = express.Router();
const SavingsController = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSavingsGoal } = require('../middleware/validator');

router.get('/', authMiddleware, SavingsController.getSavingsGoals);
router.post('/', authMiddleware, validateSavingsGoal, SavingsController.createSavingsGoal);
router.put('/:id', authMiddleware, SavingsController.updateSavingsGoal);
router.patch('/:id/contribute', authMiddleware, SavingsController.contributeSavingsGoal);

module.exports = router;
