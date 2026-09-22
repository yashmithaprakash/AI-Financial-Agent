import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-600 text-white',
    border: 'border-blue-100',
    text: 'text-blue-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-600 text-white',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
  },
  rose: {
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-600 text-white',
    border: 'border-rose-100',
    text: 'text-rose-600',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-600 text-white',
    border: 'border-purple-100',
    text: 'text-purple-600',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-600 text-white',
    border: 'border-amber-100',
    text: 'text-amber-600',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badge,
  badgeType = 'positive', // 'positive' | 'negative' | 'neutral'
}) {
  const scheme = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
            {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} shadow-sm transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{subtitle}</span>
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                badgeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : badgeType === 'negative'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
