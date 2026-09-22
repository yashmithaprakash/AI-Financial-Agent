const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validator');

router.get('/', authMiddleware, TransactionController.getTransactions);
router.post('/', authMiddleware, validateTransaction, TransactionController.addTransaction);
router.delete('/:id', authMiddleware, TransactionController.deleteTransaction);

module.exports = router;
