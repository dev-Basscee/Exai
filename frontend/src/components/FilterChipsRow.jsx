import React from 'react';
import {
  Flame,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Filter,
  Calculator
} from 'lucide-react';

export default function FilterChipsRow({
  activeFilter,
  onSelectFilter,
  selectedTopic,
  onSelectTopic,
  topics = [],
  counts = {}
}) {
  const FILTER_OPTIONS = [
    {
      id: 'all',
      label: 'All Predicted Questions',
      count: counts.all,
      icon: Sparkles
    },
    {
      id: 'math',
      label: 'Math & Calculations',
      count: counts.math,
      icon: Calculator,
      color: 'text-cyan-400'
    },
    {
      id: 'high_freq',
      label: 'High Recurrence',
      count: counts.high_freq,
      icon: Flame,
      color: 'text-orange-400'
    },
    {
      id: 'challenging',
      label: 'Challenging Questions',
      count: counts.challenging,
      dot: 'bg-rose-500'
    },
    {
      id: 'intermediate',
      label: 'Intermediate Tier',
      count: counts.intermediate,
      dot: 'bg-amber-500'
    },
    {
      id: 'foundation',
      label: 'Foundation Tier',
      count: counts.foundation,
      dot: 'bg-emerald-500'
    },
    {
      id: 'bookmarked',
      label: 'Bookmarked',
      count: counts.bookmarked,
      icon: Star,
      color: 'text-amber-400 fill-amber-400'
    },
    {
      id: 'unreviewed',
      label: 'Needs Review',
      count: counts.unreviewed,
      icon: Clock,
      color: 'text-slate-400'
    },
    {
      id: 'reviewed',
      label: 'Reviewed',
      count: counts.reviewed,
      icon: CheckCircle2,
      color: 'text-emerald-400'
    },
    {
      id: 'grounded',
      label: 'Notes Grounded',
      count: counts.grounded,
      icon: Award,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="mb-6">
      {/* Primary Filters Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.id && !selectedTopic;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              onClick={() => {
                onSelectFilter(opt.id);
                onSelectTopic(null);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan border border-cyan-400/40'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-md'
              }`}
            >
              {opt.dot && (
                <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
              )}
              {Icon && (
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : opt.color || ''}`} />
              )}
              <span>{opt.label}</span>
              {typeof opt.count === 'number' && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Topics Sub-Filter Chips Row */}
      {topics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 no-scrollbar -mx-1 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Topic:
          </span>

          <button
            onClick={() => onSelectTopic(null)}
            className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
              !selectedTopic
                ? 'bg-cyan-500 text-white font-bold shadow-glow-cyan'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
            }`}
          >
            All Topics
          </button>

          {topics.map((t) => {
            const isTopicActive = selectedTopic === t;
            return (
              <button
                key={t}
                onClick={() => onSelectTopic(isTopicActive ? null : t)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  isTopicActive
                    ? 'bg-cyan-500 text-white font-bold shadow-glow-cyan'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
