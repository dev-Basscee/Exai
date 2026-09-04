import React from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function EmptyState({
  hasUploads = false,
  onOpenUploadModal,
  onTriggerPipeline,
  workspaceName = 'this course'
}) {
  return (
    <div className="p-8 sm:p-12 rounded-4xl glass-card text-center my-6 flex flex-col items-center max-w-2xl mx-auto relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-600/30 border border-cyan-400/30 flex items-center justify-center mb-6 shadow-glow-cyan">
        <Sparkles className="w-10 h-10 text-cyan-300" />
      </div>

      {!hasUploads ? (
        <>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
            Add Your Past Exams & Syllabus Notes
          </h3>
          <p className="text-slate-300 text-sm max-w-md mb-8 leading-relaxed">
            Upload past questions to calculate recurrence patterns, and add lecture notes so ExamPredict can ground model answers directly in your course material.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-6 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 border border-indigo-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-xs">
                  1. Past Exam Papers
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Identifies repeating questions & yearly trends
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 border border-cyan-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-xs">
                  2. Lecture Notes
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Generates cited page references & key concepts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-semibold text-sm shadow-glow-cyan flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Course Files</span>
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
            Files Ready for Prediction
          </h3>
          <p className="text-slate-300 text-sm max-w-md mb-8 leading-relaxed">
            Your documents are uploaded. Run the AI pipeline to analyze question recurrence and generate syllabus-grounded model answers.
          </p>

          <button
            onClick={onTriggerPipeline}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-98 text-white font-semibold text-sm shadow-glow-cyan flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Predict Likely Questions</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </>
      )}
    </div>
  );
}
