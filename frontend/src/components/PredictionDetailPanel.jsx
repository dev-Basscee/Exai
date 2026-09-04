import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Copy,
  Check,
  FileText,
  Lightbulb,
  Calculator,
  Sigma
} from 'lucide-react';

export default function PredictionDetailPanel({
  prediction,
  isOpen,
  onClose,
  onToggleBookmark,
  onToggleReviewed,
  onToggleHard
}) {
  const [copied, setCopied] = useState(false);
  const [variantsExpanded, setVariantsExpanded] = useState(true);

  if (!isOpen || !prediction) return null;

  const {
    id,
    question_text,
    topic,
    difficulty_level = 'intermediate',
    recurrence_count = 1,
    years_appeared = [],
    mark_allocation,
    bookmarked = false,
    is_reviewed = false,
    is_hard = false,
    historical_variants = [],
    explanation
  } = prediction;

  const isGrounded = explanation?.grounding_type === 'grounded_in_notes';

  const isMathQuestion = 
    /\b(calculate|compute|solve|derive|evaluate|formula|equation|find the value|determine the rate|integral|derivative|matrix|vector|proof)\b/i.test(question_text || '') ||
    /\b(step-by-step|calculation|formula|working)\b/i.test(explanation?.core_concept || '');

  const handleCopy = () => {
    const textToCopy = `Question: ${question_text}\n\nSolution & Model Answer:\n${explanation?.core_concept || ''}\n\nKey Takeaways:\n${(explanation?.key_takeaways || []).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-text">
      {/* Backdrop with frosted blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Slide-Over Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
        <div className="w-screen max-w-2xl glass-panel shadow-2xl flex flex-col h-full animate-slide-in-right border-l border-white/10">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-navy-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 sticky top-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider shrink-0 border border-cyan-500/30 shadow-glow-cyan flex items-center gap-1.5">
                {isMathQuestion ? <Calculator className="w-3.5 h-3.5" /> : null}
                {isMathQuestion ? 'Step-by-Step Math Solution' : 'Model Answer & Working'}
              </span>
              {topic && (
                <span className="text-xs font-semibold text-slate-300 truncate">
                  {topic}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(id)}
                className={`p-2 rounded-xl transition-colors ${
                  bookmarked
                    ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={bookmarked ? "Remove bookmark" : "Bookmark question"}
              >
                <Star
                  className={`w-4 h-4 ${
                    bookmarked ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>

              {/* Copy answer */}
              <button
                onClick={handleCopy}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Copy solution & working"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Close Slide-Over */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
                title="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Question Text Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-slate-400">
                {mark_allocation && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-cyan-200 font-bold border border-white/10">
                    {mark_allocation} Marks
                  </span>
                )}
                {isMathQuestion && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Formula & Calculation
                  </span>
                )}
                <span className="flex items-center gap-1 font-semibold text-orange-400">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Appeared in {recurrence_count} exam sessions
                </span>
              </div>
              <h2 className="font-serif font-bold text-white text-xl sm:text-2xl leading-snug">
                {question_text}
              </h2>
            </div>

            {/* Academic Years Appeared */}
            {years_appeared.length > 0 && (
              <div className="p-4 rounded-2xl glass-card">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Academic Years Appeared in Past Papers
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {years_appeared.map((yr) => (
                    <span
                      key={yr}
                      className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      {yr} Exam Paper
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Variations */}
            {historical_variants.length > 0 && (
              <div className="rounded-2xl glass-card overflow-hidden">
                <button
                  onClick={() => setVariantsExpanded(!variantsExpanded)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    How examiners varied this question ({historical_variants.length} variations)
                  </span>
                  {variantsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {variantsExpanded && (
                  <div className="p-4 pt-0 border-t border-white/10 space-y-2 text-xs text-slate-300 font-sans">
                    {historical_variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 italic text-slate-200"
                      >
                        {variant}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Grounding Transparency Badge */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md ${
              isGrounded
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200 shadow-sm'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200 shadow-sm'
            }`}>
              <Award className={`w-5 h-5 shrink-0 mt-0.5 ${
                isGrounded ? 'text-emerald-400' : 'text-cyan-400'
              }`} />
              <div className="text-xs">
                <div className="font-bold flex items-center gap-2 text-white">
                  <span>{isGrounded ? 'Syllabus-Grounded Solution' : 'Academic Benchmark Solution'}</span>
                  {explanation?.grounding_score && (
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[10px] border border-white/15 text-cyan-200">
                      {Math.round(explanation.grounding_score * 100)}% Syllabus Alignment
                    </span>
                  )}
                </div>
                <p className="mt-1 leading-relaxed text-slate-300">
                  {isGrounded
                    ? 'Verified against definitions, formulas, and diagrams in your uploaded course lecture notes.'
                    : 'Derived from standard academic curricula and university past question benchmarks.'}
                </p>
              </div>
            </div>

            {/* SOLUTION & WORKING SECTIONS */}
            <div className="space-y-6">
              {/* Step-by-Step Mathematical Solution / Working */}
              {explanation?.core_concept && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    {isMathQuestion ? <Sigma className="w-4 h-4 text-cyan-400" /> : <Lightbulb className="w-4 h-4 text-cyan-400" />}
                    {isMathQuestion ? 'Step-by-Step Mathematical Derivation & Solution' : 'Complete Model Answer & Working'}
                  </h3>
                  <div className={`p-5 rounded-2xl glass-card text-sm leading-relaxed border-l-4 ${
                    isGrounded ? 'border-l-emerald-400' : 'border-l-cyan-400'
                  }`}>
                    <p className="text-white font-normal whitespace-pre-wrap leading-relaxed">
                      {explanation.core_concept}
                    </p>
                  </div>
                </div>
              )}

              {/* Cited Note References */}
              {explanation?.cited_sources && explanation.cited_sources.length > 0 && (
                <div className="p-4 rounded-2xl glass-card space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Cited Course Material References
                  </h3>
                  <div className="space-y-2">
                    {explanation.cited_sources.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{cite.document_name}</span>
                          {cite.page_number && (
                            <span className="text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                              Page {cite.page_number}
                            </span>
                          )}
                        </div>
                        {cite.excerpt && (
                          <p className="text-slate-300 mt-1 italic text-[11px]">
                            "{cite.excerpt}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
            <button
              onClick={() => onToggleHard(id)}
              className={`flex-1 min-w-[130px] py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                is_hard
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{is_hard ? 'Marked as Hard' : 'Mark as Hard for Me'}</span>
            </button>

            <button
              onClick={() => onToggleReviewed(id)}
              className={`flex-1 min-w-[130px] py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                is_reviewed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-cyan'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{is_reviewed ? 'Reviewed ✓' : 'Mark as Reviewed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
