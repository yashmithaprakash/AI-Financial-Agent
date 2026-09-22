# AI Financial Agent

A full-stack, conversational personal financial assistant web application designed with a modular architecture, clean REST APIs, and a clear integration structure for **IBM Watson Assistant V2**.

---

## 🏗️ Project Architecture & Layout

```
ai-financial-agent/
├── backend/
│   ├── .env.example              # IBM Watson credentials and port configuration
│   ├── package.json
│   ├── server.js                 # Express application entry point
│   └── src/
│       ├── config/
│       │   └── database.js       # SQLite connection and migrations
│       ├── controllers/
│       │   ├── transactionController.js # Income/Expense CRUD & filtering
│       │   ├── budgetController.js      # Monthly budget creation & monitoring
│       │   ├── savingsController.js     # Savings goals & contribution tracking
│       │   ├── analyticsController.js   # Aggregations, summaries & category metrics
│       │   └── chatbotController.js     # Chat requests dispatcher & session manager
│       ├── services/
│       │   ├── watsonAssistantService.js  # Dedicated IBM Watson Assistant V2 SDK client
│       │   ├── financialContextService.js# Extracts live user financial state for AI
│       │   ├── fallbackAgentService.js   # Local intent fallback (used if Watson unconfigured)
│       │   └── financialTipsService.js   # Dynamic financial health heuristics
│       └── routes/
│           ├── transactionRoutes.js
│           ├── budgetRoutes.js
│           ├── savingsRoutes.js
│           ├── analyticsRoutes.js
│           └── chatbotRoutes.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/           # Reusable UI components (KPIs, Charts, Chat Drawer)
│       ├── context/              # Centralized React Context for financial data sync
│       ├── services/             # Axios REST client for backend APIs
│       ├── styles/               # Modern styling
│       ├── App.jsx               # Main Dashboard application
│       └── main.jsx
└── README.md
```

---

## 🤖 IBM Watson Assistant Integration Separation

To maintain strict engineering integrity, the AI layer is designed with a **two-tier architecture**:

1. **Official IBM Watson Assistant V2 Client (`watsonAssistantService.js`)**:
   - Uses the official `ibm-watson` SDK (`ibm-watson/assistant/v2`).
   - Authenticates using `IamAuthenticator`.
   - Manages stateful/stateless conversational sessions.
   - Passes live contextual data (`current_balance`, `monthly_expenses`, `budget_remaining`) as user-defined context variables into the Watson Assistant dialog/action flow.

2. **Isolated Local Fallback Engine (`fallbackAgentService.js`)**:
   - Explicitly isolated and activated **only** when `WATSON_ASSISTANT_APIKEY` is absent.
   - Accurately answers required financial queries using the live SQLite database context.
   - Returns response metadata with `provider: "local-fallback"`, so the UI clearly reflects when it's in fallback mode versus live IBM Watson mode.

## 🚀 REST API Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `{ name, email, password, monthly_income }` |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | `{ email, password }` |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | List all transactions with filters | `?type=expense&category=Food&search=Swiggy` |
| `POST` | `/api/transactions` | Record income or expense | `{ title, amount, type, category, date, notes }` |
| `DELETE` | `/api/transactions/:id`| Remove transaction by ID | N/A |

### Financial Analytics & Summaries (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/summary` | Executive financial summary (Income, Expenses, Balance, Budget, Saved) |
| `GET` | `/api/expenses` | Total expenses, category percentages, and record list |
| `GET` | `/api/income` | Total inflows, streams distribution, and record list |

### Monthly Budgeting (`/api/budget` & `/api/budgets`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budget` | Current active monthly budget & spending velocity | N/A |
| `POST` | `/api/budget` | Create monthly budget | `{ total_budget, month, category_limits }` |
| `PUT` | `/api/budget/:id` | Update budget ceiling | `{ total_budget, category_limits }` |

### Savings Goals (`/api/savings-goals` & `/api/savings`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/savings-goals`| List active savings goals | N/A |
| `POST` | `/api/savings-goals`| Create a new savings goal | `{ title, target_amount, current_amount, target_date, category }` |
| `PUT` | `/api/savings-goals/:id`| Update goal details | `{ title, target_amount, current_amount }` |
| `PATCH`| `/api/savings-goals/:id/contribute`| Deposit into a savings goal | `{ amount }` |

### AI Conversational Assistant (`/api/chatbot`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chatbot/message` | Conversational financial query | `{ message, sessionId? }` |
| `GET` | `/api/chatbot/status` | Current AI provider & model status | N/A |

---

## 🎯 Supported Financial Chatbot Queries
- *"How much did I spend this month?"*
- *"How much money do I have left?"*
- *"Help me create a monthly budget"*
- *"I want to save ₹10,000"*
- *"Where am I spending the most?"*
- *"Give me tips to reduce my expenses"*

---

## 🔑 Exactly Where to Add IBM Watson Assistant Credentials

To link your real IBM Watson Assistant instance without exposing keys:

### 1. File Location
Open the backend configuration file located at:
📁 **[`backend/.env`](file:///C:/Users/Yashmitha/.gemini/antigravity/scratch/ai-financial-agent/backend/.env)**

### 2. Step-by-Step IBM Cloud Setup Guide

1. **Sign Up / Log In to IBM Cloud**:
   - Go to [IBM Cloud Catalog](https://cloud.ibm.com/catalog) and search for **Watson Assistant**.
   - Select the **Lite Plan** (1,000 monthly active users free, no credit card required) and click **Create**.

2. **Retrieve API Key & Service URL**:
   - On the Watson Assistant Resource page, click **Manage** in the left navigation sidebar.
   - Under the **Credentials** section:
     - Copy the **API Key** value.
     - Copy the **URL** (e.g., `https://api.us-south.assistant.watson.cloud.ibm.com`).

3. **Retrieve Assistant / Environment ID**:
   - Click **Launch Watson Assistant**.
   - In the left sidebar, click **Assistant Settings** (gear icon) -> **Environments**.
   - Under either the **Draft** or **Live** environment tile, click the three dots (`...`) -> **Environment Details**.
   - Copy the **Environment ID** (or Assistant ID).

4. **Populate `backend/.env`**:
   Paste your values into `backend/.env` as follows:
   ```ini
   WATSON_ASSISTANT_APIKEY=your_actual_ibm_api_key_here
   WATSON_ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com
   WATSON_ASSISTANT_ID=your_actual_environment_or_assistant_id_here
   WATSON_ASSISTANT_VERSION=2021-11-27
   ```

5. **(Optional) 1-Click Skill Import**:
   - In the Watson Assistant web console, go to **Actions** (or Skills) -> **Upload/Import**.
   - Upload the pre-built JSON export located at:
     📄 **[`backend/watson/watson_assistant_skill.json`](file:///C:/Users/Yashmitha/.gemini/antigravity/scratch/ai-financial-agent/backend/watson/watson_assistant_skill.json)**.
   - This automatically configures all 7 intents, entities, and context variable bindings.

6. **Restart Backend**:
   ```bash
   cd backend
   npm start
   ```
   The server startup banner will confirm:
   `🤖 AI Engine: IBM Watson Assistant V2`
   And the React frontend status badge will immediately turn green and display:
   `IBM Watson: Active`.

> [!CAUTION]
> **Frontend Security Boundary**: IBM Watson credentials are strictly kept inside the Node.js backend (`backend/.env`). The React frontend communicates exclusively through the authenticated `/api/chatbot/message` REST API. Never prefix Watson credentials with `VITE_` or expose them in clientside bundles.

---

## 💬 Conversational Flows & Intent Mapping

Both the official Watson Assistant Skill and the fallback engine handle the 7 core flows:

| Flow # | Conversational Flow | Sample User Queries | Injected Financial Context |
| :---: | :--- | :--- | :--- |
| **1** | **Expense Inquiry** | *"How much did I spend this month?"*, *"What are my total expenses?"* | `$total_expenses`, `$monthly_budget`, `$budget_consumed_percent` |
| **2** | **Income Inquiry** | *"How much did I earn this month?"*, *"What are my income streams?"* | `$total_income`, `$current_balance`, `$total_expenses` |
| **3** | **Budget Assistance** | *"Help me create a monthly budget"*, *"How much money do I have left?"* | `$monthly_budget`, `$budget_remaining`, `$current_balance` |
| **4** | **Savings Planning** | *"I want to save ₹10,000"*, *"Help me plan a savings target"* | `$amount_saved`, `$current_balance`, target calculations |
| **5** | **Spending Analysis** | *"Where am I spending the most?"*, *"What is my top category?"* | `$top_category`, `$top_category_amount`, `$categoryBreakdown` |
| **6** | **Financial Tips** | *"Give me tips to reduce my expenses"*, *"How can I cut costs?"* | Top expense heuristics, 50/30/20 rule, emergency reserve |
| **7** | **General Financial Questions** | *"What is the 50/30/20 rule?"*, *"Explain compound interest"* | Core wealth-building principles and definitions |

---

## 💻 How to Run

### 1. Start Backend:
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```


