import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PiggyBank,
  ArrowRight,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import CategoryPieChart from '../components/CategoryPieChart';
import { useFinance } from '../context/FinancialContext';

export default function Dashboard({ onNavigate, onOpenTransactionModal }) {
  const { summary, budget, savingsGoals, transactions, categoryBreakdown, aiStatus } = useFinance();

  const recentTransactions = transactions.slice(0, 5);
  const primaryGoal = savingsGoals[0] || null;

  return (
    <div className="space-y-6">
      {/* AI Assistant Quick Prompt Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>IBM Watson Financial Intelligence</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            How can your AI Financial Agent assist you today?
          </h2>
          <p className="text-xs text-blue-100/90 mt-1">
            Analyze your spending limits, plan an upcoming ₹10,000 goal, or examine your highest expense categories in natural language.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2.5 bg-white text-blue-900 font-semibold text-xs rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center gap-1.5"
          >
            <span>Open AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Income"
          value={summary.totalIncome}
          subtitle="Inflows this month"
          icon={TrendingUp}
          color="emerald"
          badge="+14.2%"
          badgeType="positive"
        />
        <StatCard
          title="Total Expenses"
          value={summary.totalExpenses}
          subtitle="Outflows this month"
          icon={TrendingDown}
          color="rose"
          badge={`${summary.budgetConsumedPercent}% budget`}
          badgeType={summary.budgetConsumedPercent > 80 ? 'negative' : 'neutral'}
        />
        <StatCard
          title="Current Balance"
          value={summary.currentBalance}
          subtitle="Net liquid reserve"
          icon={Wallet}
          color="blue"
          badge="Healthy"
          badgeType="positive"
        />
        <StatCard
          title="Monthly Budget"
          value={summary.monthlyBudget}
          subtitle={`₹${summary.budgetRemaining.toLocaleString('en-IN')} remaining`}
          icon={Target}
          color="purple"
          badge={budget.month}
          badgeType="neutral"
        />
        <StatCard
          title="Amount Saved"
          value={summary.amountSaved}
          subtitle="Across active goals"
          icon={PiggyBank}
          color="amber"
          badge={`${savingsGoals.length} Goals`}
          badgeType="positive"
        />
      </div>

      {/* Second Row: Budget Progress, Savings Goal & Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Budget Consumption Progress */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Budget Tracking</h3>
                <p className="text-xs text-slate-500">Spending against ₹{budget.totalBudget.toLocaleString('en-IN')} limit</p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Manage
              </button>
            </div>

            <div className="my-4">
              <ProgressBar
                value={summary.totalExpenses}
                max={budget.totalBudget}
                label="Budget Utilized"
                sublabel={`₹${summary.totalExpenses.toLocaleString('en-IN')} / ₹${budget.totalBudget.toLocaleString('en-IN')}`}
                showPercentage={true}
                height="h-3.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Remaining Headroom</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  ₹{summary.budgetRemaining.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Daily Allowance</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  ₹{Math.max(0, Math.round(summary.budgetRemaining / 10)).toLocaleString('en-IN')}/day
                </span>
              </div>
            </div>
          </div>

          {summary.budgetConsumedPercent > 80 && (
            <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Budget alert: You have exceeded 80% of your planned ceiling for this month.</span>
            </div>
          )}
        </div>

        {/* Priority Savings Goal Progress */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Featured Savings Goal</h3>
                <p className="text-xs text-slate-500">{primaryGoal?.title || 'Active Target'}</p>
              </div>
              <button
                onClick={() => onNavigate('savings')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                View All ({savingsGoals.length})
              </button>
            </div>

            {primaryGoal ? (
              <div className="space-y-4 my-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{primaryGoal.currentAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Target: ₹{primaryGoal.targetAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <ProgressBar
                  value={primaryGoal.currentAmount}
                  max={primaryGoal.targetAmount}
                  label="Goal Completion"
                  color="emerald"
                  height="h-3"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Target Date: {primaryGoal.targetDate}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)}% Funded
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active savings goal created yet.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('savings')}
            className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>Deposit / Manage Goals</span>
          </button>
        </div>

        {/* Category-wise Expense Breakdown */}
        <div>
          <CategoryPieChart data={categoryBreakdown} title="Expense Breakdown" />
        </div>
      </div>

      {/* Third Row: Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest income and expense records</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              View All History
            </button>
            <button
              onClick={() => onOpenTransactionModal('expense')}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Transaction</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
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
                      <div>
                        <p className="font-semibold text-slate-900">{tx.title}</p>
                        {tx.notes && <p className="text-[11px] text-slate-400">{tx.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{tx.date}</td>
                  <td
                    className={`px-6 py-3.5 text-right font-bold text-sm ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
