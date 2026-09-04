import React from 'react';
import {
  FileText,
  BookOpen,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';

export function DocumentChipItem({ upload, onDelete }) {
  const isPastQuestion = upload.upload_type === 'past_questions';
  
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`shrink-0 group relative flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 rounded-2xl glass-card overflow-hidden ${
        isPastQuestion ? 'hover:border-indigo-400/60' : 'hover:border-cyan-400/60'
      }`}
    >
      {/* Colored Left-Edge Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isPastQuestion ? 'bg-indigo-400' : 'bg-cyan-400'
        }`}
        title={isPastQuestion ? "Past Exam Paper" : "Study / Lecture Material"}
      />

      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
          isPastQuestion
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
        }`}
      >
        {isPastQuestion ? <FileText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
      </div>

      {/* Document Info */}
      <div className="flex flex-col min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]" title={upload.filename}>
            {upload.filename}
          </span>
          {upload.inferred_year && (
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-cyan-200 text-[10px] font-bold border border-white/10">
              {upload.inferred_year}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
          <span className="text-slate-300">{isPastQuestion ? 'Past Paper' : 'Lecture Notes'}</span>
          {upload.page_count && <span>• {upload.page_count} pgs</span>}
          {upload.file_size && <span>• {formatSize(upload.file_size)}</span>}
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Remove ${upload.filename}?`)) {
              onDelete(upload.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all ml-0.5"
          title="Remove document"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function DocumentChipsRow({
  uploads = [],
  onOpenUploadModal,
  onDeleteUpload
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Course Materials & Past Exams ({uploads.length})
        </h3>
        <span className="text-[11px] text-slate-400">
          Scroll horizontally →
        </span>
      </div>

      {/* Scrollable Chips Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
        {uploads.map((upload) => (
          <DocumentChipItem
            key={upload.id}
            upload={upload}
            onDelete={onDeleteUpload}
          />
        ))}

        {/* "+ Add files" chip at the end */}
        <button
          onClick={onOpenUploadModal}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500/10 border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/70 hover:bg-cyan-500/20 text-cyan-200 text-xs font-semibold transition-all duration-150 shadow-glass-sm group"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/30 group-hover:bg-cyan-500/50 text-cyan-200 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>+ Add Files</span>
        </button>
      </div>
    </div>
  );
}
