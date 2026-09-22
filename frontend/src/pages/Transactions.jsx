import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../context/FinancialContext';

export default function Transactions({ onOpenTransactionModal }) {
  const { transactions, deleteTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

  // Extract all unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category))).sort();

  // Filter & Sort
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
    if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
    return 0;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Category', 'Amount (INR)', 'Date', 'Notes'];
    const rows = sorted.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_agent_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Unified Transaction Ledger</h2>
          <p className="text-xs text-slate-500">
            Audit, filter, and inspect all incoming and outgoing personal transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenTransactionModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700"
        >
          <option value="all">All Flow Types (In & Out)</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Incomes Only</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700"
        >
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="amount-desc">Amount (Highest First)</option>
          <option value="amount-asc">Amount (Lowest First)</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Flow</th>
                <th className="px-6 py-3.5">Title & Notes</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No transactions match your current search or category filters.
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-900">{tx.title}</p>
                      {tx.notes && <p className="text-[11px] text-slate-400">{tx.notes}</p>}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {tx.category}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">{tx.date}</td>

                    <td
                      className={`px-6 py-3.5 text-right font-bold text-sm whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        title="Delete record"
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

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-800">{sorted.length}</strong> of{' '}
            <strong className="text-slate-800">{transactions.length}</strong> total records
          </span>
          <span className="text-[11px] text-slate-400">
            Transactions automatically synchronize with your active budget and AI Assistant
          </span>
        </div>
      </div>
    </div>
  );
}
