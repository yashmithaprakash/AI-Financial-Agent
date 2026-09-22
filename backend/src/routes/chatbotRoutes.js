const express = require('express');
const router = express.Router();
const ChatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/message', authMiddleware, ChatbotController.handleChatMessage);
router.post('/session', authMiddleware, ChatbotController.createSession);
router.delete('/session', authMiddleware, ChatbotController.deleteSession);
router.get('/status', ChatbotController.getChatStatus);

module.exports = router;
