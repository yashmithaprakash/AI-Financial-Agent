const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

class WatsonAssistantService {
  constructor() {
    this.apiKey = process.env.WATSON_ASSISTANT_APIKEY || '';
    this.serviceUrl = process.env.WATSON_ASSISTANT_URL || 'https://api.us-south.assistant.watson.cloud.ibm.com';
    this.assistantId = process.env.WATSON_ASSISTANT_ID || '';
    this.version = process.env.WATSON_ASSISTANT_VERSION || '2021-11-27';
    this.assistant = null;

    // Active in-memory session cache: Map<userId, { sessionId, createdAt, lastUsed }>
    this.activeSessions = new Map();

    this.initialize();
  }

  initialize() {
    if (this.isConfigured()) {
      try {
        this.assistant = new AssistantV2({
          version: this.version,
          authenticator: new IamAuthenticator({
            apikey: this.apiKey,
          }),
          serviceUrl: this.serviceUrl,
        });
        console.log('[Watson Assistant V2] Successfully initialized with IAM Authenticator');
      } catch (err) {
        console.error('[Watson Assistant V2] Client initialization error:', err.message);
      }
    } else {
      console.log('[Watson Assistant V2] Credentials not provided in .env. Local Fallback Engine will serve requests.');
    }
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.assistantId &&
      this.apiKey.trim().length > 0 &&
      this.assistantId.trim().length > 0
    );
  }

  /**
   * Creates a new session with IBM Watson Assistant V2
   */
  async createSession(userId = 'default') {
    if (!this.isConfigured() || !this.assistant) {
      throw new Error('Watson Assistant is not configured. Add credentials in .env');
    }

    const response = await this.assistant.createSession({
      assistantId: this.assistantId,
    });

    const sessionId = response.result.session_id;
    this.activeSessions.set(userId, {
      sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    });

    console.log(`[Watson Assistant V2] Created new session ${sessionId} for user ${userId}`);
    return sessionId;
  }

  /**
   * Retrieves active session or creates a new one
   */
  async getOrCreateSession(userId = 'default', requestedSessionId = null) {
    if (requestedSessionId) {
      return requestedSessionId;
    }

    const existing = this.activeSessions.get(userId);
    // Watson Lite sessions expire after 5 minutes of inactivity; we cycle after 4.5 minutes
    const SESSION_TTL_MS = 4.5 * 60 * 1000;

    if (existing && Date.now() - existing.lastUsed < SESSION_TTL_MS) {
      existing.lastUsed = Date.now();
      return existing.sessionId;
    }

    return this.createSession(userId);
  }

  /**
   * Deletes a session from Watson and clears cache
   */
  async deleteSession(userId = 'default') {
    const existing = this.activeSessions.get(userId);
    if (!existing || !this.assistant) return true;

    try {
      await this.assistant.deleteSession({
        assistantId: this.assistantId,
        sessionId: existing.sessionId,
      });
    } catch (err) {
      console.warn(`[Watson Assistant V2] Session cleanup note:`, err.message);
    } finally {
      this.activeSessions.delete(userId);
    }
    return true;
  }

  /**
   * Sends user message to Watson Assistant V2 with injected live financial context
   */
  async sendMessage(userMessage, userId = 1, requestedSessionId = null, financialContext = {}) {
    if (!this.isConfigured() || !this.assistant) {
      throw new Error('IBM Watson Assistant credentials missing');
    }

    let sessionId = await this.getOrCreateSession(userId, requestedSessionId);

    // Build comprehensive context payload so Watson has user's live numbers
    const contextVariables = {
      current_balance: financialContext.currentBalance || 0,
      total_income: financialContext.totalIncome || 0,
      total_expenses: financialContext.totalExpenses || 0,
      monthly_budget: financialContext.monthlyBudget || 0,
      budget_remaining: financialContext.budgetRemaining || 0,
      budget_consumed_percent: financialContext.budgetConsumedPercent || 0,
      top_category: financialContext.topCategory || 'General',
      top_category_amount: financialContext.topCategoryAmount || 0,
      amount_saved: financialContext.totalSaved || 0,
      currency: 'INR',
      user_name: financialContext.userName || 'Finance User',
    };

    const contextPayload = {
      skills: {
        'actions skill': {
          user_defined: contextVariables,
        },
        'main skill': {
          user_defined: contextVariables,
        },
      },
    };

    try {
      return await this._executeMessageCall(userMessage, sessionId, contextPayload);
    } catch (err) {
      // If session expired (HTTP 404 or Invalid Session), renew session and retry once
      if (err.status === 404 || err.code === 404 || (err.message && err.message.includes('Invalid Session'))) {
        console.warn(`[Watson Assistant V2] Session ${sessionId} expired. Renewing session and retrying...`);
        this.activeSessions.delete(userId);
        sessionId = await this.createSession(userId);
        return await this._executeMessageCall(userMessage, sessionId, contextPayload);
      }
      throw err;
    }
  }

  async _executeMessageCall(userMessage, sessionId, contextPayload) {
    const response = await this.assistant.message({
      assistantId: this.assistantId,
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: userMessage,
        options: {
          return_context: true,
        },
      },
      context: contextPayload,
    });

    const generic = response.result.output.generic || [];
    let reply = '';
    const suggestions = [];

    for (const item of generic) {
      if (item.response_type === 'text' && item.text) {
        reply += (reply ? '\n\n' : '') + item.text;
      } else if (item.response_type === 'option' && Array.isArray(item.options)) {
        item.options.forEach((opt) => {
          if (opt.label) suggestions.push(opt.label);
        });
      } else if (item.response_type === 'suggestion' && Array.isArray(item.suggestions)) {
        item.suggestions.forEach((s) => {
          if (s.label) suggestions.push(s.label);
        });
      }
    }

    return {
      reply: reply || "I have received your financial inquiry via IBM Watson Assistant.",
      sessionId: sessionId,
      provider: 'ibm-watson',
      suggestions,
      watsonRaw: response.result,
    };
  }
}

module.exports = new WatsonAssistantService();
