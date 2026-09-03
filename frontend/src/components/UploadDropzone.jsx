import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function UploadDropzone({ workspaceId, onUploadSuccess, isOffline }) {
  const [uploadType, setUploadType] = useState('past_questions'); // 'past_questions' | 'study_material'
  const [inferredYear, setInferredYear] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    if (isOffline) {
      setMessage({ type: 'error', text: 'Uploads are disabled in offline mode.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', uploadType);
        if (inferredYear.trim() && uploadType === 'past_questions') {
          formData.append('inferred_year', inferredYear.trim());
        }

        const res = await fetch(`/api/workspaces/${workspaceId}/uploads`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Upload failed');
        }

        successCount++;
      } catch (err) {
        console.error('Upload error:', err);
        errorCount++;
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}!${
          errorCount > 0 ? ` (${errorCount} failed)` : ''
        }`
      });
      onUploadSuccess();
    } else {
      setMessage({ type: 'error', text: 'Failed to upload files. Please try again.' });
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Category selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h4 className="text-sm font-semibold text-white">Upload Course Documents</h4>
          <p className="text-xs text-slate-400">Add past papers to predict repeats, and notes for grounded explanations</p>
        </div>

        {/* Dual toggle */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setUploadType('past_questions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              uploadType === 'past_questions'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Past Questions</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadType('study_material')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              uploadType === 'study_material'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Material (Notes)</span>
          </button>
        </div>
      </div>

      {/* Year input if past questions */}
      {uploadType === 'past_questions' && (
        <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <label className="text-xs text-slate-300 whitespace-nowrap">
            Exam Year / Session:
          </label>
          <input
            type="text"
            placeholder="e.g. 2023 or 2022/2023 (or auto-detect from filename)"
            value={inferredYear}
            onChange={(e) => setInferredYear(e.target.value)}
            className="flex-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Dropzone area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : uploadType === 'past_questions'
            ? 'border-rose-500/30 hover:border-rose-500/50 bg-slate-950/40'
            : 'border-emerald-500/30 hover:border-emerald-500/50 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md"
          onChange={handleChange}
          className="hidden"
          disabled={uploading || isOffline}
        />

        <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 mb-3 shadow-inner">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <p className="text-xs font-semibold text-slate-200 text-center">
          {uploading
            ? 'Uploading and processing file...'
            : 'Click to select or drag and drop your files here'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 text-center">
          Supported: PDF (digital or scanned), DOCX, Plain Text (Max 50MB)
        </p>
      </div>

      {/* Message / Status alert */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/20 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
