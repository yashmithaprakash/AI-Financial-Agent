import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Trash2,
  PieChart,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import CategoryPieChart from '../components/CategoryPieChart';
import { useFinance } from '../context/FinancialContext';

export default function Expenses({ onOpenTransactionModal }) {
  const { transactions, summary, categoryBreakdown, deleteTransaction, addTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Quick Inline Add Expense Form State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food & Dining');

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const filteredExpenses = expenseTransactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const topCategory = categoryBreakdown[0] || { category: 'None', amount: 0, percentage: 0 };
  const avgDailySpend = Math.round(summary.totalExpenses / 22); // Assuming 22 days of current month

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickAmount) return;

    await addTransaction({
      title: quickTitle.trim(),
      amount: Number(quickAmount),
      type: 'expense',
      category: quickCategory,
      date: new Date().toISOString().split('T')[0],
      notes: 'Quick logged from expenses tab',
    });

    setQuickTitle('');
    setQuickAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={summary.totalExpenses}
          subtitle="Total outflows this month"
          icon={TrendingDown}
          color="rose"
          badge="Active"
        />
        <StatCard
          title="Top Category"
          value={topCategory.category}
          subtitle={`₹${topCategory.amount.toLocaleString('en-IN')} (${topCategory.percentage}%)`}
          icon={PieChart}
          color="amber"
          badge="Highest Outflow"
          badgeType="neutral"
        />
        <StatCard
          title="Avg Daily Spend"
          value={`₹${avgDailySpend.toLocaleString('en-IN')}`}
          subtitle="Estimated run-rate"
          icon={TrendingDown}
          color="purple"
          badge="Burn Rate"
          badgeType="neutral"
        />
        <StatCard
          title="Expense Entries"
          value={expenseTransactions.length}
          subtitle="Recorded transactions"
          icon={Filter}
          color="blue"
          badge="Logged"
          badgeType="positive"
        />
      </div>

      {/* Quick Add Expense Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-rose-600" />
          <span>Quick Record Expense</span>
        </h3>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Expense title (e.g. Swiggy, Metro, Coffee)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
            <input
              type="number"
              required
              min="1"
              placeholder="Amount"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          >
            <option value="Food & Dining">Food & Dining</option>
            <option value="Housing">Housing</option>
            <option value="Transportation">Transportation</option>
            <option value="Utilities">Utilities</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Investments">Investments</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="submit"
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Category Breakdown & Detailed Expense Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Card */}
        <div className="lg:col-span-1">
          <CategoryPieChart data={categoryBreakdown} title="Expenses by Category" />
        </div>

        {/* Expense List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Table Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700"
              >
                <option value="All">All Categories</option>
                {categoryBreakdown.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onOpenTransactionModal('expense')}
                className="px-3 py-2 bg-rose-50 text-rose-700 font-semibold rounded-xl text-xs hover:bg-rose-100 transition whitespace-nowrap"
              >
                + Full Form
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Expense Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                      No expense records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{tx.title}</p>
                            {tx.notes && <p className="text-[11px] text-slate-400">{tx.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{tx.date}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">
                        -₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete expense"
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
