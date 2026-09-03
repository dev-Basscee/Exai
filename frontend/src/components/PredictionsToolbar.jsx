import React from 'react';
import { ArrowUpDown, Filter, Flame, CheckCircle, Search } from 'lucide-react';

export default function PredictionsToolbar({
  sortBy,
  onSortChange,
  selectedTopic,
  onTopicChange,
  topics,
  hardOnly,
  onToggleHardOnly,
  unreviewedOnly,
  onToggleUnreviewedOnly,
  totalCount,
}) {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
      {/* Left side filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="recommended" className="bg-slate-900">Highest Recommended</option>
            <option value="frequency" className="bg-slate-900">Most Frequent (Recurrence)</option>
            <option value="difficulty_high" className="bg-slate-900">Hardest Questions First</option>
            <option value="difficulty_low" className="bg-slate-900">Easiest Questions First</option>
          </select>
        </div>

        {/* Topic filter if available */}
        {topics && topics.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTopic || ''}
              onChange={(e) => onTopicChange(e.target.value || null)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="" className="bg-slate-900">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t} className="bg-slate-900">
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hard Only Toggle (US-6) */}
        <button
          onClick={onToggleHardOnly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            hardOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${hardOnly ? 'text-rose-400' : 'text-slate-400'}`} />
          <span>My Weak Spots</span>
        </button>

        {/* Unreviewed Only Toggle */}
        <button
          onClick={onToggleUnreviewedOnly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            unreviewedOnly
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <CheckCircle className={`w-3.5 h-3.5 ${unreviewedOnly ? 'text-indigo-400' : 'text-slate-400'}`} />
          <span>Unreviewed Only</span>
        </button>
      </div>

      {/* Right: counter */}
      <div className="text-xs text-slate-400 font-mono">
        Showing <span className="font-semibold text-slate-200">{totalCount}</span> predicted questions
      </div>
    </div>
  );
}
