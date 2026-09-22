// Isolated Local Fallback Conversational Engine
// Accurately maps the 7 required financial conversational flows using live SQLite context
// Used strictly when IBM Watson Assistant credentials are not configured in .env

const FallbackAgentService = {
  processQuery(userText, context) {
    const text = (userText || '').trim();
    const lower = text.toLowerCase();
    let reply = '';
    let suggestions = [];
    let matchedIntent = 'unknown';

    const {
      totalIncome = 0,
      totalExpenses = 0,
      currentBalance = 0,
      monthlyBudget = 0,
      budgetMonth = 'September 2026',
      budgetRemaining = 0,
      budgetConsumedPercent = 0,
      totalSaved = 0,
      topCategory = 'General',
      topCategoryAmount = 0,
      topCategoryPercent = 0,
      categoryBreakdown = [],
    } = context;

    // 1. FINANCIAL TIPS & COST CUTTING (Check first to avoid 'my expenses' substring overlap)
    if (
      lower.includes('tip') ||
      lower.includes('advice') ||
      lower.includes('reduce') ||
      lower.includes('cut costs') ||
      lower.includes('cut expenses') ||
      lower.includes('save more')
    ) {
      matchedIntent = 'financial_tips';
      reply = `**Actionable Financial Guidance for You:**\n\n1. **Automate Savings First (Pay Yourself First):** Move 20% of your earnings into dedicated deposits on payroll day before spending.\n2. **Target High Outflow Items:** Your top expense is **${topCategory}** (₹${topCategoryAmount.toLocaleString('en-IN')}). Try a 48-hour cool-off rule before buying non-essential items.\n3. **Maintain 3-6 Months Emergency Buffer:** Keep at least ₹${Math.round(totalExpenses * 3).toLocaleString('en-IN')} in liquid funds to insulate against unexpected events.\n4. **Review Recurring Subscriptions:** Audit streaming services, gym memberships, and auto-renewing apps every quarter.`;
      suggestions = ['Help me create a monthly budget', 'I want to save ₹10,000', 'Where am I spending the most?'];
    }

    // 2. SAVINGS PLANNING
    else if (
      lower.includes('save ₹10,000') ||
      lower.includes('save 10000') ||
      lower.includes('save 10,000') ||
      lower.includes('save ten thousand') ||
      lower.includes('savings goal') ||
      lower.includes('want to save') ||
      lower.includes('plan savings')
    ) {
      matchedIntent = 'savings_planning';
      reply = `**Savings Plan: Target ₹10,000 Milestone**\n\n• **Weekly Plan:** Save **₹2,500/week** across the next 4 weeks.\n• **Daily Micro-Savings:** Save **₹333/day** by preparing meals at home and curbing discretionary cab rides.\n• **Current Savings Pool:** You currently have **₹${totalSaved.toLocaleString('en-IN')}** accumulated across your active savings goals.\n• **Available Liquidity:** Your net bank balance is **₹${currentBalance.toLocaleString('en-IN')}**.\n\nYou can track this goal live in the **Savings Goals** tab!`;
      suggestions = ['Where am I spending the most?', 'Give me tips to reduce my expenses', 'How much did I spend this month?'];
    }

    // 3. SPENDING ANALYSIS
    else if (
      lower.includes('spending the most') ||
      lower.includes('where am i spending') ||
      lower.includes('highest expense') ||
      lower.includes('top category') ||
      lower.includes('spending habits') ||
      lower.includes('outflows')
    ) {
      matchedIntent = 'spending_analysis';
      const secondCat = categoryBreakdown[1];
      reply = `**Top Spending Categories Analysis:**\n\n1. **${topCategory}**: ₹${topCategoryAmount.toLocaleString('en-IN')} (${topCategoryPercent}% of all expenses)\n` +
        (secondCat ? `2. **${secondCat.category}**: ₹${Number(secondCat.amount).toLocaleString('en-IN')} (${secondCat.percentage}%)\n\n` : '\n') +
        `**AI Insight:** **${topCategory}** accounts for the largest proportion of your outflow. A modest 15% reduction in this category will free up approximately **₹${Math.round(topCategoryAmount * 0.15).toLocaleString('en-IN')}** per month toward your savings milestones.`;
      suggestions = ['Give me tips to reduce my expenses', 'I want to save ₹10,000', 'How much money do I have left?'];
    }

    // 4. INCOME INQUIRY
    else if (
      lower.includes('earn') ||
      lower.includes('income') ||
      lower.includes('salary') ||
      lower.includes('inflows') ||
      lower.includes('how much did i make') ||
      lower.includes('earnings')
    ) {
      matchedIntent = 'income_inquiry';
      const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
      reply = `**Monthly Income & Inflow Summary:**\n\n• **Total Inflows:** ₹${totalIncome.toLocaleString('en-IN')}\n• **Total Outflows:** ₹${totalExpenses.toLocaleString('en-IN')}\n• **Net Retained Cash:** ₹${currentBalance.toLocaleString('en-IN')}\n• **Net Savings Rate:** **${savingsRate}%**\n\nYour current inflows provide strong coverage over your monthly operating expenditures.`;
      suggestions = ['How much did I spend this month?', 'Help me create a monthly budget', 'I want to save ₹10,000'];
    }

    // 5. BUDGET ASSISTANCE
    else if (
      lower.includes('create a monthly budget') ||
      lower.includes('create budget') ||
      lower.includes('help me create a budget') ||
      lower.includes('budget assistance') ||
      lower.includes('money do i have left') ||
      lower.includes('how much money do i have left') ||
      lower.includes('have left') ||
      lower.includes('remaining budget') ||
      lower.includes('budget')
    ) {
      matchedIntent = 'budget_assistance';
      const dailyAllowance = Math.max(0, Math.round(budgetRemaining / 10));
      const needs = Math.round(totalIncome * 0.50);
      const wants = Math.round(totalIncome * 0.30);
      const savings = Math.round(totalIncome * 0.20);

      reply = `**Monthly Budget & Headroom Status:**\n\n• **Current Budget Ceiling:** ₹${monthlyBudget.toLocaleString('en-IN')}\n• **Spent So Far:** ₹${totalExpenses.toLocaleString('en-IN')} (${budgetConsumedPercent}%)\n• **Remaining Budget:** **₹${budgetRemaining.toLocaleString('en-IN')}**\n• **Recommended Daily Allowance:** approx **₹${dailyAllowance.toLocaleString('en-IN')}/day**\n\n**Recommended 50/30/20 Allocation (for ₹${totalIncome.toLocaleString('en-IN')} Income):**\n- **Needs (50%):** ₹${needs.toLocaleString('en-IN')} *(Rent, Bills, Food)*\n- **Wants (30%):** ₹${wants.toLocaleString('en-IN')} *(Outings, Gadgets)*\n- **Savings (20%):** ₹${savings.toLocaleString('en-IN')} *(SIPs, Emergency Fund)*`;
      suggestions = ['Where am I spending the most?', 'I want to save ₹10,000', 'Give me tips to reduce my expenses'];
    }

    // 6. EXPENSE INQUIRY
    else if (
      lower.includes('spend this month') ||
      lower.includes('spent this month') ||
      lower.includes('how much did i spend') ||
      lower.includes('my expenses') ||
      lower.includes('total spend') ||
      lower.includes('total expenses') ||
      lower.includes('expenditure')
    ) {
      matchedIntent = 'expense_inquiry';
      reply = `**Monthly Spend Analysis:**\n\nYou have spent **₹${totalExpenses.toLocaleString('en-IN')}** so far in ${budgetMonth}.\n\nYour monthly budget is **₹${monthlyBudget.toLocaleString('en-IN')}**, which means you have consumed **${budgetConsumedPercent}%** of your allocated spending ceiling.`;
      suggestions = ['How much money do I have left?', 'Where am I spending the most?', 'Give me tips to reduce my expenses'];
    }

    // 7. GENERAL FINANCIAL QUESTIONS
    else if (
      lower.includes('50/30/20') ||
      lower.includes('50-30-20') ||
      lower.includes('compound interest') ||
      lower.includes('emergency fund') ||
      lower.includes('sip') ||
      lower.includes('mutual fund') ||
      lower.includes('what is') ||
      lower.includes('explain')
    ) {
      matchedIntent = 'general_financial_questions';
      if (lower.includes('50/30/20') || lower.includes('50-30-20')) {
        reply = `**The 50/30/20 Budgeting Principle:**\n\n• **50% Needs:** Essential expenditures you cannot avoid (rent, utilities, groceries, basic transport).\n• **30% Wants:** Discretionary lifestyle upgrades (dining out, hobbies, gadget upgrades, entertainment).\n• **20% Savings & Debt Repayment:** High-yield savings, emergency reserves, index mutual funds, and retirement prep.`;
      } else if (lower.includes('compound interest')) {
        reply = `**What is Compound Interest?**\n\nCompound interest is the interest calculated on both the initial principal and the accumulated interest from previous periods. Over long time horizons (e.g. 10–20 years), it causes wealth to grow exponentially rather than linearly. Einstein famously called it the "eighth wonder of the world".`;
      } else if (lower.includes('emergency fund')) {
        reply = `**What is an Emergency Fund?**\n\nAn emergency fund is a stash of liquid capital set aside to cover unexpected life events—such as medical emergencies, car repairs, or temporary job loss—without having to liquidate investments or accumulate high-interest credit card debt. Most financial planners recommend maintaining **3 to 6 months** of essential living expenses.`;
      } else {
        reply = `**Personal Finance Best Practice:**\n\nBuilding sustainable wealth relies on three pillars:\n1. **Live Below Your Means:** Keep expenses lower than income.\n2. **Systematic Investing:** Invest consistently in diversified index mutual funds or SIPs regardless of market volatility.\n3. **Risk Management:** Maintain health insurance and an emergency fund.`;
      }
      suggestions = ['Help me create a monthly budget', 'Give me tips to reduce my expenses', 'Where am I spending the most?'];
    }

    // DEFAULT GREETING / INSTRUCTION
    else {
      reply = `Hello! I am your **AI Financial Agent**.\n\nHere is your live financial snapshot:\n• Current Balance: **₹${currentBalance.toLocaleString('en-IN')}**\n• Outflows this Month: **₹${totalExpenses.toLocaleString('en-IN')}**\n• Remaining Budget: **₹${budgetRemaining.toLocaleString('en-IN')}**\n\nHow can I help you today? You can ask:\n- *"How much did I spend this month?"*\n- *"How much money do I have left?"*\n- *"Where am I spending the most?"*\n- *"I want to save ₹10,000"*\n- *"Give me tips to reduce my expenses"*`;
      suggestions = ['How much did I spend this month?', 'Where am I spending the most?', 'I want to save ₹10,000'];
    }

    return {
      reply,
      provider: 'local-fallback',
      intent: matchedIntent,
      suggestions,
    };
  },
};

module.exports = FallbackAgentService;
