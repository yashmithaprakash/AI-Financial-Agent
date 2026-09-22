import React from 'react';
import { Menu, Plus, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinancialContext';

export default function Header({ title, subtitle, onOpenMobileNav, onOpenTransactionModal, onOpenAiChat }) {
  const { refreshData, loading } = useFinance();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {/* Date Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>September 2026</span>
        </div>

        {/* Refresh Sync */}
        <button
          onClick={refreshData}
          title="Sync with Backend"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Quick AI Trigger */}
        <button
          onClick={onOpenAiChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 rounded-xl hover:bg-blue-100 transition shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Ask Assistant</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => onOpenTransactionModal('expense')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
