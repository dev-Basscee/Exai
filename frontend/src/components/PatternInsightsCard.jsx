import React from 'react';
import {
  Brain,
  Flame,
  Calculator,
  Award,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Layers
} from 'lucide-react';

export default function PatternInsightsCard({
  predictions = [],
  uploads = []
}) {
  if (!predictions || predictions.length === 0) return null;

  const total = predictions.length;
  const highRecurrence = predictions.filter(
    (p) => (p.frequency_score || 0) >= 0.7 || (p.recurrence_count || 1) >= 3
  ).length;

  const mathQuestions = predictions.filter((p) => {
    const text = (p.question_text || '').toLowerCase();
    const core = (p.explanation?.core_concept || '').toLowerCase();
    return (
      /\b(calculate|compute|solve|derive|evaluate|formula|equation|find the value|determine the rate|integral|derivative|matrix|vector|proof)\b/i.test(text) ||
      /\b(step-by-step|calculation|formula|working)\b/i.test(core)
    );
  }).length;

  const challenging = predictions.filter(
    (p) => (p.difficulty_level || '').toLowerCase() === 'challenging'
  ).length;

  const grounded = predictions.filter(
    (p) => p.explanation?.grounding_type === 'grounded_in_notes'
  ).length;

  const recurrenceRate = Math.round((highRecurrence / total) * 100);
  const mathRate = Math.round((mathQuestions / total) * 100);

  return (
    <div className="mb-8 p-6 sm:p-7 rounded-4xl glass-card border border-white/15 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shadow-glow-cyan">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                Exam Intelligence
              </span>
              <span className="text-xs text-slate-400">Deep Pattern Analysis</span>
            </div>
            <h3 className="font-serif font-bold text-white text-lg sm:text-xl mt-0.5">
              Identified Question Setting Patterns
            </h3>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Synthesized across {predictions.length} question clusters
        </span>
      </div>

      {/* Pattern Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Recurrence Pattern */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">High Recurrence</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-white">
              {recurrenceRate}%
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              {highRecurrence} questions repeat consistently across sessions
            </p>
          </div>
        </div>

        {/* Metric 2: Mathematical / Quantitative Problems */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Calculations / Math</span>
            <Calculator className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-cyan-300">
              {mathQuestions}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Step-by-step mathematical working solved
            </p>
          </div>
        </div>

        {/* Metric 3: High Difficulty Questions */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Challenging Tier</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-rose-300">
              {challenging}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Multi-concept & advanced exam questions
            </p>
          </div>
        </div>

        {/* Metric 4: Syllabus Notes Grounding */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Notes Grounded</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-emerald-300">
              {Math.round((grounded / total) * 100)}%
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Verified directly in your course lecture notes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
