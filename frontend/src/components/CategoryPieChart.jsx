import React from 'react';

const CATEGORY_COLORS = [
  '#0f62fe', // IBM Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export default function CategoryPieChart({ data = [], title = 'Category Breakdown' }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 text-center text-slate-400 py-12">
        <p className="text-sm">No expense categories to show yet.</p>
      </div>
    );
  }

  // Pre-calculate cumulative angles for SVG donut
  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = (item.amount / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;
    return {
      ...item,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percent: Math.round(percent),
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Total Outflow: ₹{total.toLocaleString('en-IN')}</p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
          {data.length} Categories
        </span>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-5">
        {slices.map((slice, i) => (
          <div
            key={i}
            style={{
              width: `${Math.max(slice.percent, 3)}%`,
              backgroundColor: slice.color,
            }}
            title={`${slice.category}: ₹${slice.amount.toLocaleString('en-IN')} (${slice.percent}%)`}
            className="h-full transition-all duration-300 hover:opacity-85"
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-md flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-medium text-slate-700 truncate max-w-[130px] sm:max-w-[180px]">
                {slice.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">{slice.percent}%</span>
              <span className="font-semibold text-slate-900 text-right min-w-[70px]">
                ₹{slice.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
