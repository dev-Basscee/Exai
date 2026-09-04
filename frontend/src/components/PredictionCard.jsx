import React from 'react';
import {
  Star,
  CheckCircle2,
  Circle,
  Award,
  ChevronRight,
  Flame,
  Calculator
} from 'lucide-react';

export default function PredictionCard({
  prediction,
  onClick,
  onToggleBookmark,
  onToggleReviewed,
  isSelected
}) {
  const {
    id,
    question_text,
    topic,
    difficulty_level = 'intermediate',
    recurrence_count = 1,
    years_appeared = [],
    frequency_score = 0.5,
    mark_allocation,
    bookmarked = false,
    is_reviewed = false,
    is_hard = false,
    explanation
  } = prediction;

  const difficultyConfig = {
    foundation: {
      label: 'Foundation',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      text: 'text-emerald-300',
      bg: 'bg-emerald-500/15 border border-emerald-500/30'
    },
    intermediate: {
      label: 'Intermediate',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      text: 'text-amber-300',
      bg: 'bg-amber-500/15 border border-amber-500/30'
    },
    challenging: {
      label: 'Challenging',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
      text: 'text-rose-300',
      bg: 'bg-rose-500/15 border border-rose-500/30'
    }
  }[difficulty_level.toLowerCase()] || {
    label: 'Standard',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    bg: 'bg-white/10 border border-white/10'
  };

  const isGrounded = explanation?.grounding_type === 'grounded_in_notes';

  // Math/calculation question detector
  const isMathQuestion = 
    /\b(calculate|compute|solve|derive|evaluate|formula|equation|find the value|determine the rate|integral|derivative|matrix|vector|proof)\b/i.test(question_text || '') ||
    /\b(step-by-step|calculation|formula|working)\b/i.test(explanation?.core_concept || '');

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 sm:p-6 rounded-3xl glass-card cursor-pointer transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-glow-cyan bg-white/[0.08]'
          : 'hover:border-cyan-400/40 hover:-translate-y-0.5'
      } ${is_reviewed ? 'bg-black/30 opacity-90' : ''}`}
    >
      <div>
        {/* Top Header: Topic Tag & Quick Actions */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {topic && (
              <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] text-cyan-200 text-[11px] font-semibold tracking-wide border border-white/10">
                {topic}
              </span>
            )}
            {mark_allocation && (
              <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] text-slate-300 text-[11px] font-bold border border-white/10">
                {mark_allocation} Marks
              </span>
            )}
            {isMathQuestion && (
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1 shadow-glow-cyan">
                <Calculator className="w-3 h-3 text-cyan-400" />
                Math / Calculation
              </span>
            )}
            {is_hard && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                Hard for me
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 -mr-1">
            {/* Quick Reviewed Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReviewed(id);
              }}
              className={`p-1.5 rounded-xl transition-colors ${
                is_reviewed
                  ? 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={is_reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
            >
              {is_reviewed ? (
                <CheckCircle2 className="w-4 h-4 fill-emerald-500/30 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>

            {/* Bookmark / Star Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(id);
              }}
              className={`p-1.5 rounded-xl transition-colors ${
                bookmarked
                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-white/10'
              }`}
              title={bookmarked ? "Remove bookmark" : "Bookmark question"}
            >
              <Star
                className={`w-4 h-4 ${
                  bookmarked ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <h4 className="font-serif text-white text-base sm:text-lg font-bold leading-snug tracking-tight mb-4 group-hover:text-cyan-200 transition-colors">
          {question_text}
        </h4>
      </div>

      {/* Card Footer: Frequency Bar & Difficulty Indicator */}
      <div className="pt-3.5 border-t border-white/10 flex flex-col gap-2.5">
        {/* Frequency Horizontal Sparkline / Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400 shrink-0" />
              Recurrence ({recurrence_count}x)
            </span>
            {/* Horizontal Sparkline Fill Bar */}
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 shadow-glow-cyan"
                style={{ width: `${Math.min(frequency_score * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Years Chips */}
          {years_appeared.length > 0 && (
            <span className="text-[10px] text-cyan-300 font-medium shrink-0">
              {years_appeared.map(y => `'${String(y).slice(-2)}`).join(', ')}
            </span>
          )}
        </div>

        {/* Bottom Row: Difficulty + Grounding Badge + Open Arrow */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Difficulty Dot + Label */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${difficultyConfig.bg} text-xs font-semibold ${difficultyConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${difficultyConfig.dot}`} />
              <span>{difficultyConfig.label}</span>
            </div>

            {/* Notes Grounding Badge */}
            {isGrounded && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold" title="Grounded in your uploaded lecture notes">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Notes Grounded</span>
              </span>
            )}
          </div>

          <span className="text-xs text-cyan-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            {isMathQuestion ? 'View Step-by-Step Solution' : 'View Model Answer'}
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
