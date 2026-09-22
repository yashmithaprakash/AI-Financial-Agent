import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TransactionModal from './components/TransactionModal';

// Pages
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import SavingsGoals from './pages/SavingsGoals';
import Transactions from './pages/Transactions';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalInitialType, setTxModalInitialType] = useState('expense');

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  const handleOpenTransactionModal = (type = 'expense') => {
    setTxModalInitialType(type);
    setIsTxModalOpen(true);
  };

  const pageMeta = {
    dashboard: { title: 'Financial Dashboard', subtitle: 'Overview of income, expenses, and budget velocity' },
    assistant: { title: 'Conversational AI Assistant', subtitle: 'Natural language financial guidance powered by IBM Watson' },
    expenses: { title: 'Expense Analytics', subtitle: 'Detailed breakdown and logging of outflow capital' },
    income: { title: 'Income & Inflows', subtitle: 'Track payroll, investments, and independent income streams' },
    budget: { title: 'Monthly Budget & Caps', subtitle: 'Allocate limits and prevent month-end financial overruns' },
    savings: { title: 'Savings & Milestones', subtitle: 'Accumulate capital towards long-term targets' },
    transactions: { title: 'Transaction Ledger', subtitle: 'Unified searchable audit trail of personal finances' },
  };

  const currentMeta = pageMeta[currentPage] || pageMeta.dashboard;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(pageId) => setCurrentPage(pageId)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenTransactionModal={handleOpenTransactionModal}
          onOpenAiChat={() => setCurrentPage('assistant')}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={(pageId) => setCurrentPage(pageId)}
              onOpenTransactionModal={handleOpenTransactionModal}
            />
          )}
          {currentPage === 'assistant' && <AIAssistant />}
          {currentPage === 'expenses' && (
            <Expenses onOpenTransactionModal={handleOpenTransactionModal} />
          )}
          {currentPage === 'income' && (
            <Income onOpenTransactionModal={handleOpenTransactionModal} />
          )}
          {currentPage === 'budget' && <Budget />}
          {currentPage === 'savings' && <SavingsGoals />}
          {currentPage === 'transactions' && (
            <Transactions onOpenTransactionModal={handleOpenTransactionModal} />
          )}
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalInitialType}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <MainApp />
      </FinancialProvider>
    </AuthProvider>
  );
}
