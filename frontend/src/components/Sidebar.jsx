import React from 'react';
import {
  LayoutDashboard,
  Bot,
  TrendingDown,
  TrendingUp,
  Target,
  PiggyBank,
  Receipt,
  LogOut,
  Cpu,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinancialContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Watson' },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
  { id: 'income', label: 'Income', icon: TrendingUp },
  { id: 'budget', label: 'Monthly Budget', icon: Target },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
];

export default function Sidebar({ currentPage, onNavigate, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { aiStatus, isBackendOnline } = useFinance();

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">AI Financial Agent</h1>
            <p className="text-[11px] font-medium text-slate-400">IBM Watson Enabled</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Engine Status Card (Required for IBM Interview transparency) */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Conversational Engine
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus?.provider === 'ibm-watson' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
          </div>
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            {aiStatus?.provider === 'ibm-watson' ? 'IBM Watson Assistant V2' : 'Local Rule Engine'}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {aiStatus?.provider === 'ibm-watson'
              ? 'Connected to IBM Cloud instance'
              : 'Using modular fallback adapter'}
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.avatar || 'YS'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Yashmitha S.'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@finance.app'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
