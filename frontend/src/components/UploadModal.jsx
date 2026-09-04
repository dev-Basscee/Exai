import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Sparkles
} from 'lucide-react';

export default function UploadModal({
  isOpen,
  onClose,
  onUploadFile,
  workspace
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('past_questions');
  const [inferredYear, setInferredYear] = useState(new Date().getFullYear());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const detectYear = (filename) => {
    const match = filename.match(/\b(20[12]\d)\b/);
    if (match) {
      setInferredYear(parseInt(match[1], 10));
    } else {
      setInferredYear(new Date().getFullYear());
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const validExtensions = ['.pdf', '.docx', '.txt', '.doc'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Please select a PDF, DOCX, or TXT document.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    detectYear(file.name);

    if (/exam|past|paper|test|quiz|midterm|final/i.test(file.name)) {
      setUploadType('past_questions');
    } else if (/note|lecture|slide|handout|syllabus|book/i.test(file.name)) {
      setUploadType('study_material');
    }
  };

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await onUploadFile({
        file: selectedFile,
        filename: selectedFile.name,
        upload_type: uploadType,
        inferred_year: inferredYear,
        file_size: selectedFile.size
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const courseCode = workspace?.course_code || workspace?.code || 'your course';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-4xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-white text-xl">
                Add Course Documents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload past exams or lecture materials to {courseCode}.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Document Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Past Questions Option */}
              <button
                type="button"
                onClick={() => setUploadType('past_questions')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  uploadType === 'past_questions'
                    ? 'border-indigo-400 bg-indigo-500/20 text-white ring-2 ring-indigo-400/30 shadow-glow-indigo'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {uploadType === 'past_questions' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div>
                  <span className="font-serif font-bold text-sm block text-white">
                    Past Questions
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    For recurrence & frequency tracking
                  </span>
                </div>
              </button>

              {/* Study Material Option */}
              <button
                type="button"
                onClick={() => setUploadType('study_material')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  uploadType === 'study_material'
                    ? 'border-cyan-400 bg-cyan-500/20 text-white ring-2 ring-cyan-400/30 shadow-glow-cyan'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  {uploadType === 'study_material' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div>
                  <span className="font-serif font-bold text-sm block text-white">
                    Study Notes / Slides
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    For syllabus grounding & citations
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/20 scale-[1.01]'
                : selectedFile
                ? 'border-cyan-400/80 bg-cyan-500/10'
                : 'border-white/20 hover:border-cyan-400/50 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2 border border-cyan-500/30 shadow-glow-cyan">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="font-semibold text-white text-sm truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center mb-2">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="font-semibold text-white text-sm">
                  Click to select or drag & drop file
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF, DOCX, or TXT documents
                </p>
              </div>
            )}
          </div>

          {/* Academic Year input */}
          {uploadType === 'past_questions' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Exam Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={inferredYear}
                  onChange={(e) => setInferredYear(parseInt(e.target.value, 10))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
                  placeholder="e.g. 2023"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-cyan transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uploading ? 'Processing...' : 'Upload & Add'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
