import React, { useState } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingDown,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { useFinance } from '../context/FinancialContext';

export default function Budget() {
  const { budget, summary, transactions, updateBudget } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState(budget.totalBudget);

  const categoryLimits = budget.categoryLimits || {
    'Housing': 25000,
    'Food & Dining': 10000,
    'Transportation': 5000,
    'Utilities': 4500,
    'Shopping': 5500,
    'Entertainment': 5000,
  };

  const [limits, setLimits] = useState(categoryLimits);

  // Calculate actual spending per category
  const actualCategorySpends = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    await updateBudget(Number(totalBudgetInput), limits);
    setIsEditing(false);
  };

  const handleCategoryLimitChange = (cat, val) => {
    setLimits((prev) => ({
      ...prev,
      [cat]: Number(val),
    }));
  };

  const budgetRemaining = Math.max(0, budget.totalBudget - summary.totalExpenses);
  const percentUsed = Math.min(100, Math.round((summary.totalExpenses / (budget.totalBudget || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget Limit"
          value={budget.totalBudget}
          subtitle={`Billing cycle: ${budget.month}`}
          icon={Target}
          color="purple"
          badge="Allocated"
        />
        <StatCard
          title="Actual Outflows"
          value={summary.totalExpenses}
          subtitle={`${percentUsed}% of ceiling consumed`}
          icon={TrendingDown}
          color="rose"
          badge={percentUsed > 80 ? 'High Burn' : 'On Track'}
          badgeType={percentUsed > 80 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Remaining Balance"
          value={budgetRemaining}
          subtitle="Unspent allowance"
          icon={CheckCircle2}
          color="emerald"
          badge="Headroom"
          badgeType="positive"
        />
        <StatCard
          title="Safe Daily Velocity"
          value={`₹${Math.max(0, Math.round(budgetRemaining / 10)).toLocaleString('en-IN')}`}
          subtitle="Max recommended spend/day"
          icon={Calendar}
          color="blue"
          badge="Smart Guidance"
          badgeType="neutral"
        />
      </div>

      {/* Main Budget Progress Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Monthly Budget Burn Meter</h3>
            <p className="text-xs text-slate-500">
              Tracking against ₹{budget.totalBudget.toLocaleString('en-IN')} monthly spending ceiling for {budget.month}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Adjustment' : 'Adjust Monthly Budget'}</span>
          </button>
        </div>

        <div className="my-6">
          <ProgressBar
            value={summary.totalExpenses}
            max={budget.totalBudget}
            label="Overall Monthly Spending"
            sublabel={`₹${summary.totalExpenses.toLocaleString('en-IN')} spent`}
            showPercentage={true}
            height="h-4"
          />
        </div>

        {/* Warning Threshold Pill */}
        {percentUsed > 85 ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Budget Warning Triggered</p>
              <p className="text-rose-700">
                You have consumed {percentUsed}% of your allocated limit with several days remaining. Consider deferring discretionary purchases.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Healthy Spending Velocity</p>
              <p className="text-emerald-700">
                You are well within your safe boundaries with ₹{budgetRemaining.toLocaleString('en-IN')} remaining.
              </p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveBudget} className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-800">Update Monthly Allocation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Monthly Spending Cap (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="500"
                  value={totalBudgetInput}
                  onChange={(e) => setTotalBudgetInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm transition"
              >
                Apply New Budget
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Category Breakdown vs Limits */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category-Wise Budget Limits</h3>
            <p className="text-xs text-slate-500">Compare individual category spend against planned allocations</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
            Active Allocations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {Object.entries(categoryLimits).map(([cat, limit]) => {
            const actual = actualCategorySpends[cat] || 0;
            const catPercent = Math.round((actual / limit) * 100);
            const isOver = actual > limit;

            return (
              <div key={cat} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{cat}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      isOver
                        ? 'bg-rose-100 text-rose-700'
                        : catPercent > 80
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {catPercent}% Used
                  </span>
                </div>

                <ProgressBar
                  value={actual}
                  max={limit}
                  color={isOver ? 'rose' : catPercent > 80 ? 'amber' : 'emerald'}
                  showPercentage={false}
                  height="h-2"
                />

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Spent: ₹{actual.toLocaleString('en-IN')}</span>
                  <span>Cap: ₹{limit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
