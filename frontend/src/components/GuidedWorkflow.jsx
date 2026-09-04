import React, { useState, useRef } from 'react';
import {
  BookOpen,
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  FileUp,
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
  Calculator
} from 'lucide-react';

export default function GuidedWorkflow({
  workspace,
  uploads = [],
  onUploadFile,
  onDeleteUpload,
  onTriggerPipeline,
  isProcessing
}) {
  const lectureNotes = uploads.filter((u) => u.upload_type === 'study_material');
  const pastPapers = uploads.filter((u) => u.upload_type === 'past_questions');

  // Determine current active step:
  // Step 1: Upload Course Material (if 0 lecture notes)
  // Step 2: Upload Past Questions (if >= 1 lecture notes but 0 past papers)
  // Step 3: Ready to Analyze (if both are present)
  const [activeStepTab, setActiveStepTab] = useState(
    lectureNotes.length === 0 ? 1 : pastPapers.length === 0 ? 2 : 3
  );

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  const courseCode = workspace?.course_code || workspace?.code || 'your course';

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const validExtensions = ['.pdf', '.docx', '.txt', '.doc'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      setErrorMsg('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);

    const match = file.name.match(/\b(20[12]\d)\b/);
    if (match) {
      setUploadYear(parseInt(match[1], 10));
    }
  };

  const executeUpload = async (targetType) => {
    if (!selectedFile) {
      setErrorMsg('Please choose a file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      await onUploadFile({
        file: selectedFile,
        filename: selectedFile.name,
        upload_type: targetType,
        inferred_year: targetType === 'past_questions' ? uploadYear : null,
        file_size: selectedFile.size
      });
      setSelectedFile(null);
      
      // Auto-advance step if completing first step
      if (targetType === 'study_material' && lectureNotes.length === 0) {
        setActiveStepTab(2);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 space-y-6 animate-fade-in">
      {/* Workflow Step Progress Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/10">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          {/* Step 1 Pill */}
          <button
            onClick={() => setActiveStepTab(1)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all text-xs font-semibold ${
              activeStepTab === 1
                ? 'bg-cyan-500/25 text-white border border-cyan-400/50 shadow-glow-cyan'
                : lectureNotes.length > 0
                ? 'text-cyan-300 bg-white/[0.04] border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
              lectureNotes.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/10 text-white'
            }`}>
              {lectureNotes.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="hidden sm:inline">1. Course Notes</span>
            <span className="sm:hidden">Notes</span>
          </button>

          <div className={`flex-1 h-0.5 max-w-[40px] sm:max-w-[60px] ${
            lectureNotes.length > 0 ? 'bg-cyan-400' : 'bg-white/10'
          }`} />

          {/* Step 2 Pill */}
          <button
            onClick={() => setActiveStepTab(2)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all text-xs font-semibold ${
              activeStepTab === 2
                ? 'bg-indigo-500/25 text-white border border-indigo-400/50 shadow-glow-indigo'
                : pastPapers.length > 0
                ? 'text-indigo-300 bg-white/[0.04] border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
              pastPapers.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/10 text-white'
            }`}>
              {pastPapers.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <span className="hidden sm:inline">2. Past Questions</span>
            <span className="sm:hidden">Exams</span>
          </button>

          <div className={`flex-1 h-0.5 max-w-[40px] sm:max-w-[60px] ${
            pastPapers.length > 0 ? 'bg-indigo-400' : 'bg-white/10'
          }`} />

          {/* Step 3 Pill */}
          <button
            onClick={() => setActiveStepTab(3)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all text-xs font-semibold ${
              activeStepTab === 3
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-white border border-cyan-400/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="hidden sm:inline">3. AI Analysis</span>
            <span className="sm:hidden">Predict</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Upload Course Material (Lecture Notes, Slides, Syllabus) */}
      {activeStepTab === 1 && (
        <div className="p-6 sm:p-8 rounded-4xl glass-card relative overflow-hidden border border-white/15">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shadow-glow-cyan">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                    Step 1 of 3
                  </span>
                  <span className="text-xs text-slate-400">Course Materials</span>
                </div>
                <h2 className="font-serif font-bold text-white text-xl sm:text-2xl mt-0.5">
                  Upload Course Materials & Syllabus Notes
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Upload lecture slides, syllabus handouts, or textbook chapters. ExamPredict AI uses these to verify concepts and ground model solutions.
                </p>
              </div>
            </div>

            {lectureNotes.length > 0 && (
              <button
                onClick={() => setActiveStepTab(2)}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-glow-cyan flex items-center gap-2 transition-all self-end md:self-center"
              >
                <span>Continue to Step 2 (Past Questions)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Drop Zone for Lecture Notes */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/20 scale-[1.01]'
                : selectedFile
                ? 'border-cyan-400/70 bg-cyan-500/10'
                : 'border-white/15 hover:border-cyan-400/40 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2 border border-cyan-500/30 shadow-glow-cyan">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="font-semibold text-white text-sm">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to add
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    executeUpload('study_material');
                  }}
                  disabled={isUploading}
                  className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading Note...' : 'Add Course Note'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="font-semibold text-white text-sm">
                  Click to select or drag & drop course notes / lecture slides
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF, DOCX, or TXT
                </p>
              </div>
            )}
          </div>

          {/* Currently Uploaded Course Materials List */}
          {lectureNotes.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Uploaded Course Materials ({lectureNotes.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lectureNotes.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {doc.page_count ? `${doc.page_count} pages` : 'Document'} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteUpload(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Upload All Past Questions */}
      {activeStepTab === 2 && (
        <div className="p-6 sm:p-8 rounded-4xl glass-card relative overflow-hidden border border-white/15">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-glow-indigo">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                    Step 2 of 3
                  </span>
                  <span className="text-xs text-slate-400">Exam Papers</span>
                </div>
                <h2 className="font-serif font-bold text-white text-xl sm:text-2xl mt-0.5">
                  Upload All Past Exam Papers & Tests
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Upload all available past papers for this course across different years. The AI will cross-reference recurrence, examine mathematical problem patterns, and detect difficulty.
                </p>
              </div>
            </div>

            {pastPapers.length > 0 && (
              <button
                onClick={() => setActiveStepTab(3)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-glow-cyan flex items-center gap-2 transition-all self-end md:self-center"
              >
                <span>Ready for AI Analysis →</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Past Exam Year Selector & Dropzone */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Exam Academic Year:
              </label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={uploadYear}
                onChange={(e) => setUploadYear(parseInt(e.target.value, 10))}
                className="w-28 px-3 py-1.5 rounded-xl glass-input text-xs font-semibold text-center"
              />
            </div>

            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/20 scale-[1.01]'
                  : selectedFile
                  ? 'border-indigo-400/70 bg-indigo-500/10'
                  : 'border-white/15 hover:border-indigo-400/40 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-2 border border-indigo-500/30 shadow-glow-indigo">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-white text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Year: {uploadYear} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeUpload('past_questions');
                    }}
                    disabled={isUploading}
                    className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading Exam Paper...' : 'Add Past Exam Paper'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-white text-sm">
                    Click to select or drag & drop past exam question paper
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload multiple years (e.g. 2021, 2022, 2023, 2024) for comprehensive recurrence tracking
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Currently Uploaded Past Papers List */}
          {pastPapers.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Uploaded Past Exam Papers ({pastPapers.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pastPapers.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate" title={doc.filename}>
                            {doc.filename}
                          </p>
                          {doc.inferred_year && (
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                              {doc.inferred_year}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {doc.page_count ? `${doc.page_count} pages` : 'Past Exam'} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteUpload(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Ready to Analyze & Pattern Detection */}
      {activeStepTab === 3 && (
        <div className="p-6 sm:p-8 rounded-4xl glass-card relative overflow-hidden border border-cyan-400/30 shadow-glow-cyan">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                  Step 3 of 3
                </span>
                <span className="text-xs text-slate-400">AI Deep Analysis</span>
              </div>
              <h2 className="font-serif font-bold text-white text-xl sm:text-2xl">
                Start Exam Prediction & Mathematical Solving
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                ExamPredict AI will cluster repeated questions across {pastPapers.length} past exam papers, extract examiner question-setting patterns, isolate challenging problems, and solve calculations step-by-step with syllabus citations.
              </p>

              {/* Checklist Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lectureNotes.length} Course Notes</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-xl border border-indigo-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{pastPapers.length} Past Exam Papers</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Step-by-Step Math Solver Active</span>
                </div>
              </div>
            </div>

            {/* Run CTA Button */}
            <button
              onClick={onTriggerPipeline}
              disabled={isProcessing || pastPapers.length === 0}
              className="w-full md:w-auto px-8 py-4 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-serif font-bold text-sm sm:text-base shadow-glow-cyan hover:shadow-lg flex items-center justify-center gap-3 transition-all shrink-0"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              <span>{isProcessing ? 'Analyzing Recurrence & Patterns...' : 'Analyze & Predict Exam Questions'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
