import React from 'react';

export default function WorkspaceSidebarItem({
  workspace,
  isActive,
  onClick,
  reviewStats
}) {
  const { total = 0, reviewed = 0, percentage = 0 } = reviewStats || {};
  
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const courseCode = workspace.course_code || workspace.code || 'CRS';

  return (
    <button
      onClick={onClick}
      className={`w-full group text-left px-3.5 py-3 rounded-2xl transition-all duration-200 flex items-center gap-3 relative ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-indigo-600/10 text-white font-medium border border-cyan-400/40 shadow-glow-cyan'
          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
      }`}
    >
      {/* Active left indicator glow bar */}
      {isActive && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
      )}

      {/* Course Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-105 shadow-sm ${
          isActive
            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30'
            : 'bg-white/[0.06] text-slate-200 border border-white/10'
        }`}
      >
        {workspace.icon || '📚'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 truncate">
            {courseCode}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {total} {total === 1 ? 'pred' : 'preds'}
          </span>
        </div>
        <p className="text-sm text-white font-medium truncate leading-tight mt-0.5">
          {workspace.name}
        </p>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center" title={`${percentage}% reviewed (${reviewed}/${total})`}>
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="text-slate-800 stroke-current"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="text-cyan-400 stroke-current transition-all duration-500 ease-out"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-cyan-200">
          {percentage}%
        </span>
      </div>
    </button>
  );
}
