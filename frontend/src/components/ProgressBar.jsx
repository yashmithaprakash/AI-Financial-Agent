import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  sublabel = '',
  color = 'auto', // 'auto', 'emerald', 'blue', 'amber', 'rose'
  showPercentage = true,
  height = 'h-2.5',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  // Auto pick color based on standard financial threshold
  let fillColor = 'bg-blue-600';
  if (color === 'auto') {
    if (percentage > 90) fillColor = 'bg-rose-500';
    else if (percentage > 75) fillColor = 'bg-amber-500';
    else fillColor = 'bg-emerald-500';
  } else if (color === 'emerald') fillColor = 'bg-emerald-500';
  else if (color === 'blue') fillColor = 'bg-blue-600';
  else if (color === 'amber') fillColor = 'bg-amber-500';
  else if (color === 'rose') fillColor = 'bg-rose-500';

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-700">
          <span>{label}</span>
          <div className="flex items-center gap-1.5">
            {sublabel && <span className="text-slate-400 font-normal">{sublabel}</span>}
            {showPercentage && <span className="font-semibold">{percentage}%</span>}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${fillColor} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
