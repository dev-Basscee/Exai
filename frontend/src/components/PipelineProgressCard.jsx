import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Brain,
  Layers,
  FileSearch,
  BookCheck,
  RefreshCw,
  Award
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Extracting exam questions & structuring raw materials",
    detail: "Parsing past papers and syllabus lecture notes...",
    icon: FileSearch
  },
  {
    step: 2,
    title: "Clustering semantic recurrence across academic years",
    detail: "TF-IDF n-grams & cosine similarity matching...",
    icon: Brain
  },
  {
    step: 3,
    title: "Cross-referencing lecture notes for syllabus grounding",
    detail: "Retrieving relevant slide chapters and page citations...",
    icon: BookCheck
  },
  {
    step: 4,
    title: "Calculating multi-factor difficulty & exam priority",
    detail: "Bloom's taxonomy analysis & mark weightings...",
    icon: Layers
  },
  {
    step: 5,
    title: "Synthesizing grounded explanations & pitfalls",
    detail: "Finalizing model answers and study takeaways...",
    icon: Award
  }
];

export default function PipelineProgressCard({
  isProcessing,
  onTriggerPipeline,
  workspace,
  predictionCount = 0
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      setProgressPercent(10);
      setCurrentStepIndex(0);

      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 95) return 95;
          const next = prev + Math.floor(Math.random() * 12) + 8;
          return Math.min(next, 95);
        });
      }, 500);
    } else {
      setProgressPercent(100);
    }

    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    if (isProcessing) {
      const step = Math.min(
        Math.floor((progressPercent / 100) * PIPELINE_STEPS.length),
        PIPELINE_STEPS.length - 1
      );
      setCurrentStepIndex(step);
    }
  }, [progressPercent, isProcessing]);

  const activeStepInfo = PIPELINE_STEPS[currentStepIndex];
  const StepIcon = activeStepInfo?.icon || Sparkles;

  return (
    <div className="mb-8">
      {isProcessing ? (
        /* INLINE ANIMATED PROGRESS STATE */
        <div className="p-5 sm:p-6 rounded-3xl glass-card border-2 border-cyan-400/50 shadow-glow-cyan animate-pulse-subtle transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-glow-cyan">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                    Step {currentStepIndex + 1} of 5
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    Running AI Prediction Pipeline
                  </span>
                </div>
                <h3 className="font-serif font-bold text-white text-base sm:text-lg mt-0.5">
                  {activeStepInfo.title}
                </h3>
              </div>
            </div>

            <span className="text-xl font-serif font-bold text-cyan-300 self-end sm:self-center">
              {progressPercent}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 shadow-inner border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden shadow-glow-cyan"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>

          {/* Micro Status details */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-cyan-300">
              <StepIcon className="w-4 h-4 text-cyan-400" />
              {activeStepInfo.detail}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Analyzing recurrence & syllabus alignment
            </span>
          </div>
        </div>
      ) : (
        /* PROMINENT CALL TO ACTION STATE */
        <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl glass-card hover:border-cyan-400/40 transition-all duration-300 group">
          <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-glow-cyan group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 fill-white/80" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                    {predictionCount > 0 ? "Ready to Re-Analyze" : "AI Engine Ready"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Dual-Engine: Recurrence + Notes Grounding
                  </span>
                </div>
                <h3 className="font-serif font-bold text-white text-lg sm:text-xl mt-1 tracking-tight">
                  {predictionCount > 0
                    ? "Refresh Exam Predictions & Model Answers"
                    : "Run Exam Prediction Engine"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed font-sans">
                  Extracts repeating exam questions from past papers, computes recurrence frequency, ranks cognitive difficulty, and attaches syllabus-grounded explanations.
                </p>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={onTriggerPipeline}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-98 text-white font-semibold text-sm shadow-glow-cyan hover:shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{predictionCount > 0 ? "Re-Run Prediction Pipeline" : "Predict Likely Questions"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
