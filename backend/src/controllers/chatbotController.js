const WatsonAssistantService = require('../services/watsonAssistantService');
const FallbackAgentService = require('../services/fallbackAgentService');
const FinancialContextService = require('../services/financialContextService');

const ChatbotController = {
  async handleChatMessage(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { message, sessionId } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message text is required.' });
      }

      // 1. Compile live real-time financial context from SQLite
      const financialContext = await FinancialContextService.getLiveContext(userId);
      financialContext.userName = req.user?.name || 'Finance User';

      // 2. Dispatch to Watson Assistant V2 or Isolated Local Fallback Engine
      if (WatsonAssistantService.isConfigured()) {
        try {
          const watsonResponse = await WatsonAssistantService.sendMessage(
            message.trim(),
            userId,
            sessionId,
            financialContext
          );
          return res.status(200).json(watsonResponse);
        } catch (watsonErr) {
          console.warn('[Watson Assistant API Error]', watsonErr.message);
          // Graceful fallback with transparent metadata
          const fallbackResult = FallbackAgentService.processQuery(message, financialContext);
          return res.status(200).json({
            ...fallbackResult,
            sessionId: sessionId || `session-user-${userId}`,
            notice: 'IBM Watson service error, safely fulfilled via Local Finance Engine',
          });
        }
      } else {
        // Fallback Engine execution with explicit provider indicator
        const fallbackResult = FallbackAgentService.processQuery(message, financialContext);
        return res.status(200).json({
          ...fallbackResult,
          sessionId: sessionId || `session-user-${userId}`,
        });
      }
    } catch (err) {
      next(err);
    }
  },

  async createSession(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      if (WatsonAssistantService.isConfigured()) {
        const sessionId = await WatsonAssistantService.createSession(userId);
        return res.status(201).json({
          success: true,
          sessionId,
          provider: 'ibm-watson',
        });
      }

      return res.status(200).json({
        success: true,
        sessionId: `local-session-${userId}-${Date.now()}`,
        provider: 'local-fallback',
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteSession(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      await WatsonAssistantService.deleteSession(userId);
      res.status(200).json({
        success: true,
        message: 'Conversational session cleared successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async getChatStatus(req, res, next) {
    try {
      const isWatson = WatsonAssistantService.isConfigured();
      res.status(200).json({
        success: true,
        provider: isWatson ? 'ibm-watson' : 'local-fallback',
        ready: true,
        model: isWatson ? 'IBM Watson Assistant V2' : 'Finance NLP Engine',
        watson_configured: isWatson,
        active_sessions: WatsonAssistantService.activeSessions.size,
        version: WatsonAssistantService.version,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ChatbotController;
