import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Trash2,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { useFinance } from '../context/FinancialContext';

export default function Income({ onOpenTransactionModal }) {
  const { transactions, summary, deleteTransaction, addTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Quick Inline Add Income Form State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Salary');

  const incomeTransactions = transactions.filter((t) => t.type === 'income');

  const filteredIncome = incomeTransactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category breakdown for income
  const incomeCategoryTotals = incomeTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const incomeStreams = Object.entries(incomeCategoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: summary.totalIncome > 0 ? Math.round((amount / summary.totalIncome) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const primaryStream = incomeStreams[0] || { category: 'None', amount: 0, percentage: 0 };
  const savingsRate = summary.totalIncome > 0
    ? Math.max(0, Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100))
    : 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickAmount) return;

    await addTransaction({
      title: quickTitle.trim(),
      amount: Number(quickAmount),
      type: 'income',
      category: quickCategory,
      date: new Date().toISOString().split('T')[0],
      notes: 'Quick logged from income tab',
    });

    setQuickTitle('');
    setQuickAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Income KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={summary.totalIncome}
          subtitle="Net monthly inflows"
          icon={TrendingUp}
          color="emerald"
          badge="+18.5% YoY"
          badgeType="positive"
        />
        <StatCard
          title="Primary Stream"
          value={primaryStream.category}
          subtitle={`₹${primaryStream.amount.toLocaleString('en-IN')} (${primaryStream.percentage}%)`}
          icon={Briefcase}
          color="blue"
          badge="Active"
          badgeType="positive"
        />
        <StatCard
          title="Net Savings Rate"
          value={`${savingsRate}%`}
          subtitle="Surplus retained from income"
          icon={ShieldCheck}
          color="purple"
          badge="Healthy"
          badgeType="positive"
        />
        <StatCard
          title="Income Streams"
          value={incomeTransactions.length}
          subtitle="Unique credits"
          icon={Filter}
          color="amber"
          badge="Diversified"
          badgeType="neutral"
        />
      </div>

      {/* Quick Add Income Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Quick Record Income</span>
        </h3>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Income title (e.g. Salary, Freelance project)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment Returns">Investment Returns</option>
            <option value="Business">Business</option>
            <option value="Rental Income">Rental Income</option>
            <option value="Gift">Gift</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="submit"
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            Add Income
          </button>
        </form>
      </div>

      {/* Income Streams Breakdown & Income Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Sources Breakdown Card */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Income Inflows</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-4">
            {incomeStreams.map((stream, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{stream.category}</span>
                  <span className="text-slate-900 font-bold">
                    ₹{stream.amount.toLocaleString('en-IN')}{' '}
                    <span className="text-slate-400 font-normal">({stream.percentage}%)</span>
                  </span>
                </div>
                <ProgressBar
                  value={stream.amount}
                  max={summary.totalIncome}
                  color="emerald"
                  showPercentage={false}
                  height="h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Income List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search income records..."
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
                <option value="All">All Inflow Streams</option>
                {incomeStreams.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onOpenTransactionModal('income')}
                className="px-3 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl text-xs hover:bg-emerald-100 transition whitespace-nowrap"
              >
                + Full Form
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Source / Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Credit Amount</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncome.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                      No income records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredIncome.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{tx.title}</p>
                            {tx.notes && <p className="text-[11px] text-slate-400">{tx.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{tx.date}</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600">
                        +₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete income record"
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
