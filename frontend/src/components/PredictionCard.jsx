import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function PredictionCard({
  prediction,
  onToggleHard,
  onToggleReviewed,
  onRegenerateExplanation,
  isOffline
}) {
  const [expanded, setExpanded] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const feedback = prediction.feedback || {};
  const isHard = feedback.marked_hard || false;
  const isReviewed = feedback.marked_reviewed || false;
  const explanation = prediction.explanation;

  // Format difficulty badge
  const getDifficultyBadge = (score) => {
    if (score <= 2.2) {
      return { label: 'Easy', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    if (score <= 3.8) {
      return { label: 'Moderate', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'Challenging', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  const diffBadge = getDifficultyBadge(prediction.difficulty_score);

  // Grounding label
  const getGroundingBadge = (source) => {
    if (source === 'material') {
      return { label: 'Grounded in Lecture Notes', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    if (source === 'mixed') {
      return { label: 'Notes + Academic Knowledge', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'General Knowledge', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  const groundingBadge = explanation ? getGroundingBadge(explanation.grounding_source) : null;

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerateExplanation(prediction.id, customPrompt.trim() || null);
      setShowRegenModal(false);
      setCustomPrompt('');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
        isReviewed
          ? 'bg-slate-950/70 border-slate-800/60 opacity-80'
          : isHard
          ? 'bg-slate-900/90 border-rose-500/30 shadow-rose-950/20'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Banner / Question Header */}
      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Recurrence Badge */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {prediction.frequency_count}x Repeated
                {prediction.years_seen && prediction.years_seen.length > 0 && ` (${prediction.years_seen.join(', ')})`}
              </span>
            </span>

            {/* Difficulty Badge */}
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${diffBadge.bg}`}>
              {diffBadge.label} • {prediction.difficulty_score}/5
            </span>

            {/* Topic label */}
            {prediction.topic_label && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800">
                {prediction.topic_label}
              </span>
            )}

            {/* Marks if available */}
            {prediction.marks_allocated && (
              <span className="px-2 py-1 rounded-lg text-xs font-mono bg-slate-950 text-slate-400 border border-slate-800">
                {prediction.marks_allocated} Marks
              </span>
            )}
          </div>

          {/* User study action controls */}
          <div className="flex items-center gap-2">
            {/* Mark as Hard (US-6) */}
            <button
              onClick={() => onToggleHard(prediction.id, !isHard)}
              disabled={isOffline}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isHard
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isHard ? 'Marked as weak spot (prioritized)' : 'Mark as still hard for me'}
            >
              <Flame className={`w-3.5 h-3.5 ${isHard ? 'text-rose-400 fill-rose-400/20' : ''}`} />
              <span className="hidden sm:inline">{isHard ? 'Weak Spot' : 'Hard'}</span>
            </button>

            {/* Mark as Reviewed */}
            <button
              onClick={() => onToggleReviewed(prediction.id, !isReviewed)}
              disabled={isOffline}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isReviewed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isReviewed ? 'Marked as studied' : 'Mark as reviewed'}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isReviewed ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
              <span className="hidden sm:inline">{isReviewed ? 'Reviewed' : 'Review'}</span>
            </button>
          </div>
        </div>

        {/* Representative Question Text */}
        <div className="pt-1">
          <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
            {prediction.representative_question_text}
          </p>
        </div>

        {/* Variants Toggle (Historical papers accordion) */}
        {prediction.variants_count > 1 && (
          <div className="pt-1">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {showVariants ? 'Hide' : 'View'} all {prediction.variants_count} historical past paper variations
              </span>
              {showVariants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showVariants && prediction.variants && (
              <div className="mt-3 space-y-2 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original wording across examination years:
                </p>
                <div className="space-y-2 divide-y divide-slate-800/60">
                  {prediction.variants.map((v, vIdx) => (
                    <div key={v.id || vIdx} className="pt-2 first:pt-0">
                      <div className="flex items-center gap-2 mb-1">
                        {v.year && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-indigo-300">
                            {v.year} Exam
                          </span>
                        )}
                        {v.marks && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{v.marks} marks]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 italic">"{v.original_question_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expand/Collapse Explanation Footer bar */}
      <div className="bg-slate-950/50 border-t border-slate-800/80 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {groundingBadge && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${groundingBadge.bg}`}>
              {groundingBadge.label}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>{expanded ? 'Hide Model Explanation' : 'Read Grounded Model Answer'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Explanation Body */}
      {expanded && (
        <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200">
          {explanation ? (
            <>
              {/* Structured explanation content */}
              <div className="prose prose-invert prose-indigo max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {explanation.explanation_text}
              </div>

              {/* Source citations if available */}
              {explanation.grounding_references && explanation.grounding_references.length > 0 && (
                <div className="pt-3 border-t border-slate-800/60 space-y-2">
                  <h5 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Referenced Study Notes Excerpts</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {explanation.grounding_references.map((ref, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-indigo-300 font-medium text-[11px]">
                          <span>{ref.source || 'Lecture Notes'}</span>
                          {ref.page && <span>Page {ref.page}</span>}
                        </div>
                        {ref.snippet && (
                          <p className="text-slate-400 text-[11px] italic">
                            "{ref.snippet}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regenerate Action */}
              {!isOffline && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowRegenModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate with Custom Instructions</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-slate-400">No model explanation generated yet.</p>
              {!isOffline && (
                <button
                  onClick={() => onRegenerateExplanation(prediction.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Syllabus-Grounded Answer</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom Prompt Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Regenerate Explanation with Gemini</span>
            </h4>
            <p className="text-xs text-slate-400">
              Provide custom focus instructions (e.g. "Focus on practical calculations", "Include memory mnemonics", or "Explain for a beginner").
            </p>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Break down step 2 in more detail and provide an illustrative analogy."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white disabled:opacity-50"
              >
                {regenerating && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
