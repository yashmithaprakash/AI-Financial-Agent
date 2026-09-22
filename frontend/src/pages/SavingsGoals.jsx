import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Coins,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { useFinance } from '../context/FinancialContext';

export default function SavingsGoals() {
  const { savingsGoals, summary, addSavingsGoal, contributeToSavings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New Goal State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Safety');

  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const overallProgress = totalTarget > 0 ? Math.round((summary.amountSaved / totalTarget) * 100) : 0;

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    await addSavingsGoal({
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: targetDate || '2026-12-31',
      category,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIsModalOpen(false);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount || Number(depositAmount) <= 0) return;

    await contributeToSavings(depositGoalId, Number(depositAmount));
    setDepositGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Savings KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saved"
          value={summary.amountSaved}
          subtitle="Aggregated across active goals"
          icon={PiggyBank}
          color="amber"
          badge="Principal Reserve"
        />
        <StatCard
          title="Total Goals Target"
          value={totalTarget}
          subtitle={`${savingsGoals.length} Active targets set`}
          icon={Target}
          color="blue"
          badge="Long-Term Vision"
          badgeType="neutral"
        />
        <StatCard
          title="Goal Funding Rate"
          value={`${overallProgress}%`}
          subtitle="Weighted goal completion"
          icon={TrendingUp}
          color="emerald"
          badge="On Pace"
          badgeType="positive"
        />
        <StatCard
          title="Active Milestones"
          value={savingsGoals.length}
          subtitle="Targeting financial freedom"
          icon={CheckCircle}
          color="purple"
          badge="Disciplined"
          badgeType="positive"
        />
      </div>

      {/* Action Header & Overall Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Savings & Wealth Accumulation</h3>
            <p className="text-xs text-slate-500">
              Track progress toward major milestones, gadgets, travel, and financial emergency reserves.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        <div className="my-4">
          <ProgressBar
            value={summary.amountSaved}
            max={totalTarget}
            label="Cumulative Milestone Progress"
            sublabel={`₹${summary.amountSaved.toLocaleString('en-IN')} of ₹${totalTarget.toLocaleString('en-IN')}`}
            color="amber"
            height="h-3.5"
          />
        </div>
      </div>

      {/* Grid of Individual Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {goal.category || 'Milestone'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">{goal.title}</h4>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{Number(goal.currentAmount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">
                      of ₹{Number(goal.targetAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <ProgressBar
                    value={goal.currentAmount}
                    max={goal.targetAmount}
                    color="amber"
                    height="h-2.5"
                    showPercentage={false}
                  />

                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                    <span>{percent}% Funded</span>
                    <span className="text-slate-700 font-medium">₹{remaining.toLocaleString('en-IN')} left</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {goal.targetDate}
                </span>

                <button
                  onClick={() => setDepositGoalId(goal.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Set Up a New Savings Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save ₹10,000, New Laptop, Japan Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Safety">Emergency Reserve</option>
                    <option value="Tech">Gadget / Tech</option>
                    <option value="Travel">Vacation / Travel</option>
                    <option value="Education">Course / Degree</option>
                    <option value="Home">Home Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Deposit / Contribute */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Deposit Into Savings Goal</h3>
            <p className="text-xs text-slate-500">
              Allocating funds to this goal will also automatically log an investment/savings record in your transactions.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
