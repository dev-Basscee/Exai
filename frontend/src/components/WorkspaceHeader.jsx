import React from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Trash2,
  Award
} from 'lucide-react';

export default function WorkspaceHeader({
  workspace,
  uploads = [],
  predictions = [],
  onDeleteWorkspace,
  reviewStats
}) {
  if (!workspace) return null;

  const pastPapersCount = uploads.filter(
    (u) => u.upload_type === 'past_questions'
  ).length;
  const studyMaterialsCount = uploads.filter(
    (u) => u.upload_type === 'study_material'
  ).length;
  const predictionsCount = predictions.length;
  const { reviewed = 0, percentage = 0 } = reviewStats || {};

  const groundedCount = predictions.filter(
    (p) => p.explanation?.grounding_type === 'grounded_in_notes'
  ).length;
  const groundingPct = predictionsCount > 0
    ? Math.round((groundedCount / predictionsCount) * 100)
    : 0;

  const courseCode = workspace.course_code || workspace.code || 'COURSE';

  return (
    <div className="mb-6">
      {/* Top Breadcrumb row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/30">
            {courseCode}
          </span>
          <span>•</span>
          <span className="text-slate-300">{workspace.semester || 'Active Workspace'}</span>
          {workspace.instructor && (
            <>
              <span>•</span>
              <span className="text-slate-300">{workspace.instructor}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${workspace.name}"?`)) {
                onDeleteWorkspace(workspace.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs flex items-center gap-1 border border-transparent hover:border-rose-500/20"
            title="Delete this course workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Course Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>{workspace.icon || '📚'}</span>
            <span>{workspace.name}</span>
          </h1>
          {workspace.description && (
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
              {workspace.description}
            </p>
          )}
        </div>
      </div>

      {/* Inline Stat Pill Badges (Glassmorphism) */}
      <div className="flex flex-wrap items-center gap-2.5 mt-4">
        {/* Predictions Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-semibold shadow-glow-cyan backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400" />
          <span>{predictionsCount} {predictionsCount === 1 ? 'Prediction' : 'Predictions'}</span>
        </div>

        {/* Past Exams Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-medium backdrop-blur-md">
          <FileText className="w-3.5 h-3.5 text-indigo-300" />
          <span>{pastPapersCount} {pastPapersCount === 1 ? 'Past Exam' : 'Past Exams'}</span>
        </div>

        {/* Study Material Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-200 text-xs font-medium backdrop-blur-md">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{studyMaterialsCount} Lecture {studyMaterialsCount === 1 ? 'Doc' : 'Docs'}</span>
        </div>

        {/* Grounding Pill */}
        {predictionsCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium backdrop-blur-md">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{groundingPct}% Notes Grounded</span>
          </div>
        )}

        {/* Reviewed Progress Pill */}
        {predictionsCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{reviewed}/{predictionsCount} Reviewed ({percentage}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
