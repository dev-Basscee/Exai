import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Plus,
  Play,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Clock,
  Flame,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import Navbar from './components/Navbar';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import UploadDropzone from './components/UploadDropzone';
import UploadsList from './components/UploadsList';
import PredictionsToolbar from './components/PredictionsToolbar';
import PredictionCard from './components/PredictionCard';
import ProcessingPipelineModal from './components/ProcessingPipelineModal';
import { api } from './services/api';

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('predictions'); // 'predictions' | 'materials'
  const [uploads, setUploads] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Modals & Toolbar state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hardOnly, setHardOnly] = useState(false);
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);

  // Monitor network status for PWA offline experience
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch all workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getWorkspaces();
      setWorkspaces(res.data || []);
      if (res.fromCache) setIsOffline(true);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Fetch workspace details (uploads + predictions)
  const fetchWorkspaceDetails = useCallback(async (wsId) => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.getUploads(wsId),
        api.getPredictions(wsId, {
          sort_by: sortBy,
          topic: selectedTopic,
          hard_only: hardOnly,
          unreviewed_only: unreviewedOnly
        })
      ]);
      setUploads(uRes || []);
      setPredictions(pRes.data || []);
      if (pRes.fromCache) setIsOffline(true);
    } catch (err) {
      console.error('Error fetching workspace details:', err);
    }
  }, [sortBy, selectedTopic, hardOnly, unreviewedOnly]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceDetails(currentWorkspace.id);
    }
  }, [currentWorkspace, fetchWorkspaceDetails]);

  // Handle workspace creation
  const handleCreateWorkspace = async (payload) => {
    const created = await api.createWorkspace(payload);
    await fetchWorkspaces();
    setCurrentWorkspace(created);
  };

  // Trigger processing pipeline
  const handleTriggerPipeline = async () => {
    if (!currentWorkspace || isOffline) return;

    try {
      const job = await api.triggerProcessing(currentWorkspace.id);
      setActiveJob(job);
      setPipelineModalOpen(true);

      // Poll pipeline status
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getProcessingStatus(currentWorkspace.id);
          setActiveJob(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
            fetchWorkspaceDetails(currentWorkspace.id);
            fetchWorkspaces();
          }
        } catch (pollErr) {
          console.error('Status polling error:', pollErr);
          clearInterval(pollInterval);
        }
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to trigger prediction pipeline');
    }
  };

  // User study feedback (US-6)
  const handleToggleHard = async (clusterId, markedHard) => {
    try {
      await api.updateFeedback(clusterId, { marked_hard: markedHard });
      // Optimistic local update
      setPredictions(prev =>
        prev.map(p => p.id === clusterId ? { ...p, feedback: { ...p.feedback, marked_hard: markedHard } } : p)
      );
    } catch (err) {
      console.error('Failed to update hard status:', err);
    }
  };

  const handleToggleReviewed = async (clusterId, markedReviewed) => {
    try {
      await api.updateFeedback(clusterId, { marked_reviewed: markedReviewed });
      // Optimistic local update
      setPredictions(prev =>
        prev.map(p => p.id === clusterId ? { ...p, feedback: { ...p.feedback, marked_reviewed: markedReviewed } } : p)
      );
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  // Explanation regeneration
  const handleRegenerateExplanation = async (clusterId, customPrompt = null) => {
    try {
      const newExp = await api.generateExplanation(clusterId, customPrompt, true);
      setPredictions(prev =>
        prev.map(p => p.id === clusterId ? { ...p, explanation: newExp } : p)
      );
    } catch (err) {
      alert(err.message || 'Failed to regenerate explanation');
    }
  };

  // Extract unique topics for filter dropdown
  const uniqueTopics = Array.from(new Set(predictions.map(p => p.topic_label).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={setCurrentWorkspace}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onBackToDashboard={() => setCurrentWorkspace(null)}
        isOffline={isOffline}
      />

      {/* Offline banner notification if disconnected */}
      {isOffline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Offline Mode: Displaying cached courses, predictions, and model answers. New uploads and pipeline runs require connectivity.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!currentWorkspace ? (
          /* ========================================================================= */
          /* DASHBOARD VIEW: Course Workspaces Grid                                    */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Hero / Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Gemini AI Exam Recurrence Intelligence</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Stop Guessing. Predict What's on Your Exam.
                </h1>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Upload multiple years of past exam papers alongside your course notes. ExamPredict AI discovers recurring patterns, calculates repeat frequencies, and builds syllabus-grounded model answers.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Course Workspace</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Workspaces Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>Your Course Workspaces</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">{workspaces.length} Courses</span>
              </div>

              {workspaces.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-4 bg-slate-900/40">
                  <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-200">No courses yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Create your first course workspace (e.g. Organic Chemistry, Calculus, Constitutional Law) to start uploading materials.
                  </p>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Course</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      onClick={() => setCurrentWorkspace(ws)}
                      className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-6 shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        {ws.course_code && (
                          <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {ws.course_code}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                          {ws.name}
                        </h3>
                        {ws.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{ws.description}</p>
                        )}
                      </div>

                      {/* Stats badge row */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span title="Past Question papers" className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                            <span>{ws.past_questions_count || 0} papers</span>
                          </span>
                          <span title="Study notes" className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{ws.study_materials_count || 0} notes</span>
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>{ws.predictions_count || 0} Predicted</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* WORKSPACE DETAIL VIEW: Ingestion, Pipeline Trigger & Predictions Feed     */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Course Header Banner */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {currentWorkspace.course_code && (
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {currentWorkspace.course_code}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">Course Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentWorkspace.name}
                </h1>
                {currentWorkspace.description && (
                  <p className="text-xs text-slate-400 max-w-xl">{currentWorkspace.description}</p>
                )}
              </div>

              {/* Action Button: Predict Exam Questions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTriggerPipeline}
                  disabled={isOffline || uploads.filter(u => u.upload_type === 'past_questions').length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 animate-glow"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Exam Prediction Pipeline</span>
                </button>
              </div>
            </div>

            {/* Workspace View Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'predictions'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Predicted Questions ({predictions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'materials'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Uploaded Documents ({uploads.length})</span>
              </button>
            </div>

            {/* TAB 1: PREDICTIONS FEED */}
            {activeTab === 'predictions' && (
              <div className="space-y-5">
                {predictions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-4 bg-slate-900/40">
                    <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-200">No predictions generated yet</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Switch to the <strong>"Uploaded Documents"</strong> tab to add your past papers and lecture notes, then click <strong>"Run Exam Prediction Pipeline"</strong>.
                    </p>
                    <button
                      onClick={() => setActiveTab('materials')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Go to Documents Tab</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Toolbar */}
                    <PredictionsToolbar
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      selectedTopic={selectedTopic}
                      onTopicChange={setSelectedTopic}
                      topics={uniqueTopics}
                      hardOnly={hardOnly}
                      onToggleHardOnly={() => setHardOnly(!hardOnly)}
                      unreviewedOnly={unreviewedOnly}
                      onToggleUnreviewedOnly={() => setUnreviewedOnly(!unreviewedOnly)}
                      totalCount={predictions.length}
                    />

                    {/* Cards Feed */}
                    <div className="space-y-4">
                      {predictions.map((pred) => (
                        <PredictionCard
                          key={pred.id}
                          prediction={pred}
                          onToggleHard={handleToggleHard}
                          onToggleReviewed={handleToggleReviewed}
                          onRegenerateExplanation={handleRegenerateExplanation}
                          isOffline={isOffline}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: COURSE DOCUMENTS & UPLOADS */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <UploadDropzone
                  workspaceId={currentWorkspace.id}
                  onUploadSuccess={() => fetchWorkspaceDetails(currentWorkspace.id)}
                  isOffline={isOffline}
                />

                <UploadsList
                  uploads={uploads}
                  onDeleteUpload={async (uploadId) => {
                    await api.deleteUpload(currentWorkspace.id, uploadId);
                    fetchWorkspaceDetails(currentWorkspace.id);
                  }}
                  isOffline={isOffline}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />

      <ProcessingPipelineModal
        isOpen={pipelineModalOpen}
        job={activeJob}
        onClose={() => setPipelineModalOpen(false)}
      />
    </div>
  );
}
