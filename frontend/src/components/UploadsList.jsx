import React from 'react';
import { FileText, BookOpen, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function UploadsList({ uploads, onDeleteUpload, isOffline }) {
  if (!uploads || uploads.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 text-center">
        <p className="text-sm font-medium text-slate-400">No documents uploaded yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Upload 2 or more years of past exam papers above to uncover recurring question patterns.
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Uploaded Course Files ({uploads.length})
        </h4>
      </div>

      <div className="divide-y divide-slate-800/60">
        {uploads.map((file) => {
          const isPastQuestions = file.upload_type === 'past_questions';

          return (
            <div
              key={file.id}
              className="py-3 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isPastQuestions
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isPastQuestions ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {file.file_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPastQuestions
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isPastQuestions ? 'Past Questions' : 'Study Notes'}
                    </span>

                    {file.inferred_year && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Year {file.inferred_year}
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500">
                      {formatFileSize(file.file_size)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {file.status === 'processed' ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ready</span>
                  </span>
                ) : file.status === 'pending' ? (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">Pending</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Failed</span>
                  </span>
                )}

                {!isOffline && (
                  <button
                    onClick={() => onDeleteUpload(file.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
