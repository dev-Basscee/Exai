import React from 'react';
import { Loader2, CheckCircle2, Sparkles, Layers, Cpu, Compass, BookOpen, AlertCircle } from 'lucide-react';

export default function ProcessingPipelineModal({ isOpen, job, onClose }) {
  if (!isOpen || !job) return null;

  const steps = [
    { key: 'extracting', label: 'Extracting Text & Cleaning', icon: Layers },
    { key: 'segmenting', label: 'Gemini Question Segmentation', icon: Cpu },
    { key: 'clustering', label: 'Semantic Recurrence Clustering', icon: Compass },
    { key: 'ranking', label: 'Recurrence & Difficulty Ranking', icon: Sparkles },
    { key: 'generating_explanations', label: 'Syllabus-Grounded Model Answers (RAG)', icon: BookOpen },
  ];

  const currentStepKey = job.current_step;
  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed';

  const getStepStatus = (index) => {
    if (isCompleted) return 'completed';
    if (isFailed) return 'failed';

    const stepOrder = ['extracting', 'segmenting', 'clustering', 'ranking', 'generating_explanations', 'completed'];
    const currentIdx = stepOrder.indexOf(currentStepKey);

    if (currentIdx > index) return 'completed';
    if (currentIdx === index) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6">
        {/* Glowing top effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 blur-sm" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-1">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isFailed ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Sparkles className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <h3 className="text-lg font-bold text-white">
            {isCompleted
              ? 'Predictions & Explanations Ready!'
              : isFailed
              ? 'Pipeline Error'
              : 'Analyzing Examination Patterns'}
          </h3>
          <p className="text-xs text-slate-400">
            {isCompleted
              ? 'Past papers have been clustered, ranked, and grounded in your study notes.'
              : isFailed
              ? (job.error_message || 'An error occurred during processing.')
              : 'Our Gemini AI engine is processing past questions and syllabus notes...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Progress</span>
            <span className="font-semibold text-indigo-400">{job.progress_percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isFailed
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-500'
              }`}
              style={{ width: `${Math.max(5, job.progress_percentage)}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 pt-2">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx);
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                    : status === 'active'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : status === 'active'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>

                <div>
                  {status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {status === 'active' && (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        {(isCompleted || isFailed) && (
          <div className="pt-2">
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-xs font-semibold text-white shadow-lg transition-all active:scale-98 ${
                isCompleted
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {isCompleted ? 'Explore Predicted Questions' : 'Dismiss'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
