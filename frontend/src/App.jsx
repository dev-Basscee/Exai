import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  BookOpen,
  ArrowUpDown,
  AlertCircle,
  FileUp,
  Brain
} from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import WorkspaceHeader from './components/WorkspaceHeader';
import GuidedWorkflow from './components/GuidedWorkflow';
import PatternInsightsCard from './components/PatternInsightsCard';
import FilterChipsRow from './components/FilterChipsRow';
import PredictionCard from './components/PredictionCard';
import PredictionDetailPanel from './components/PredictionDetailPanel';
import UploadModal from './components/UploadModal';
import NewWorkspaceModal from './components/NewWorkspaceModal';
import SettingsModal from './components/SettingsModal';

// API Services
import {
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
  fetchUploads,
  uploadDocument,
  deleteUpload,
  fetchPredictions,
  triggerPredictionPipeline,
  updatePredictionFeedback,
  checkBackendHealth
} from './services/api';

export default function App() {
  // Application State
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('frequency'); // 'frequency', 'difficulty', 'mark'

  // View toggle when predictions exist: 'predictions' or 'manage_materials'
  const [currentViewMode, setCurrentViewMode] = useState('predictions');

  // Processing & UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // 1. Initial Load: Check backend and load workspaces
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoadingInitial(true);
        const health = await checkBackendHealth();
        setBackendHealth(health);
        setIsOffline(health.status !== 'online');

        const wsList = await fetchWorkspaces();
        setWorkspaces(wsList);
        if (wsList.length > 0) {
          setActiveWorkspaceId(wsList[0].id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setApiError('Unable to connect to FastAPI backend server.');
        setIsOffline(true);
      } finally {
        setLoadingInitial(false);
      }
    };

    initApp();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Load Uploads & Predictions whenever Active Workspace Changes
  useEffect(() => {
    if (!activeWorkspaceId) {
      setUploads([]);
      setPredictions([]);
      return;
    }

    const loadWorkspaceData = async () => {
      try {
        setLoadingData(true);
        setApiError(null);
        const [ups, preds] = await Promise.all([
          fetchUploads(activeWorkspaceId),
          fetchPredictions(activeWorkspaceId)
        ]);
        setUploads(ups);
        setPredictions(preds);
        if (preds.length > 0) {
          setCurrentViewMode('predictions');
        } else {
          setCurrentViewMode('guided');
        }
      } catch (err) {
        console.error('Error loading workspace data:', err);
        setApiError(err.message || 'Error loading course data from backend.');
      } finally {
        setLoadingData(false);
      }
    };

    loadWorkspaceData();
  }, [activeWorkspaceId]);

  // Active workspace object
  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || null;
  }, [workspaces, activeWorkspaceId]);

  // Distinct Topics for topic filter chips
  const distinctTopics = useMemo(() => {
    const set = new Set();
    predictions.forEach((p) => {
      if (p.topic) set.add(p.topic);
    });
    return Array.from(set);
  }, [predictions]);

  // Counts for filter chips
  const filterCounts = useMemo(() => {
    return {
      all: predictions.length,
      math: predictions.filter((p) => {
        const text = (p.question_text || '').toLowerCase();
        const core = (p.explanation?.core_concept || '').toLowerCase();
        return (
          /\b(calculate|compute|solve|derive|evaluate|formula|equation|find the value|determine the rate|integral|derivative|matrix|vector|proof)\b/i.test(text) ||
          /\b(step-by-step|calculation|formula|working)\b/i.test(core)
        );
      }).length,
      high_freq: predictions.filter((p) => (p.frequency_score || 0) >= 0.7 || (p.recurrence_count || 1) >= 3).length,
      challenging: predictions.filter((p) => (p.difficulty_level || '').toLowerCase() === 'challenging').length,
      intermediate: predictions.filter((p) => (p.difficulty_level || '').toLowerCase() === 'intermediate').length,
      foundation: predictions.filter((p) => (p.difficulty_level || '').toLowerCase() === 'foundation').length,
      bookmarked: predictions.filter((p) => p.bookmarked).length,
      unreviewed: predictions.filter((p) => !p.is_reviewed).length,
      reviewed: predictions.filter((p) => p.is_reviewed).length,
      grounded: predictions.filter((p) => p.explanation?.grounding_type === 'grounded_in_notes').length
    };
  }, [predictions]);

  // Review Progress stats per workspace
  const getWorkspaceReviewStats = (ws) => {
    if (ws.id === activeWorkspaceId) {
      const total = predictions.length;
      const reviewed = predictions.filter((p) => p.is_reviewed).length;
      const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;
      return { total, reviewed, percentage };
    }
    const total = ws.predictions_count || 0;
    const reviewed = ws.reviewed_count || 0;
    const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    return { total, reviewed, percentage };
  };

  // Filtered and Sorted Predictions
  const filteredPredictions = useMemo(() => {
    return predictions
      .filter((p) => {
        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchQ = p.question_text?.toLowerCase().includes(q);
          const matchTopic = p.topic?.toLowerCase().includes(q);
          const matchCore = p.explanation?.core_concept?.toLowerCase().includes(q);
          if (!matchQ && !matchTopic && !matchCore) return false;
        }

        // Topic Filter
        if (selectedTopic && p.topic !== selectedTopic) {
          return false;
        }

        // Primary Filter
        switch (activeFilter) {
          case 'math': {
            const text = (p.question_text || '').toLowerCase();
            const core = (p.explanation?.core_concept || '').toLowerCase();
            return (
              /\b(calculate|compute|solve|derive|evaluate|formula|equation|find the value|determine the rate|integral|derivative|matrix|vector|proof)\b/i.test(text) ||
              /\b(step-by-step|calculation|formula|working)\b/i.test(core)
            );
          }
          case 'high_freq':
            return (p.frequency_score || 0) >= 0.7 || (p.recurrence_count || 1) >= 3;
          case 'challenging':
            return (p.difficulty_level || '').toLowerCase() === 'challenging';
          case 'intermediate':
            return (p.difficulty_level || '').toLowerCase() === 'intermediate';
          case 'foundation':
            return (p.difficulty_level || '').toLowerCase() === 'foundation';
          case 'bookmarked':
            return Boolean(p.bookmarked);
          case 'unreviewed':
            return !p.is_reviewed;
          case 'reviewed':
            return Boolean(p.is_reviewed);
          case 'grounded':
            return p.explanation?.grounding_type === 'grounded_in_notes';
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortBy === 'frequency') {
          return (b.recurrence_count || 0) - (a.recurrence_count || 0) || (b.frequency_score || 0) - (a.frequency_score || 0);
        }
        if (sortBy === 'difficulty') {
          const order = { challenging: 3, intermediate: 2, foundation: 1 };
          return (order[(b.difficulty_level || '').toLowerCase()] || 0) - (order[(a.difficulty_level || '').toLowerCase()] || 0);
        }
        if (sortBy === 'mark') {
          return (b.mark_allocation || 0) - (a.mark_allocation || 0);
        }
        return 0;
      });
  }, [predictions, searchQuery, activeFilter, selectedTopic, sortBy]);

  // Actions
  const handleCreateWorkspace = async (data) => {
    const created = await createWorkspace(data);
    setWorkspaces((prev) => [created, ...prev]);
    setActiveWorkspaceId(created.id);
  };

  const handleDeleteWorkspace = async (id) => {
    await deleteWorkspace(id);
    const updated = workspaces.filter((w) => w.id !== id);
    setWorkspaces(updated);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(updated[0]?.id || null);
    }
  };

  const handleUploadFile = async (data) => {
    if (!activeWorkspaceId) return;
    const uploadRes = await uploadDocument(activeWorkspaceId, data);
    setUploads((prev) => [...prev, uploadRes]);
  };

  const handleDeleteUpload = async (uploadId) => {
    await deleteUpload(uploadId);
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  };

  const handleTriggerPipeline = async () => {
    if (!activeWorkspaceId) return;
    try {
      setIsProcessing(true);
      setApiError(null);
      const res = await triggerPredictionPipeline(activeWorkspaceId);
      setPredictions(res.predictions || []);
      setCurrentViewMode('predictions');
    } catch (err) {
      console.error('Pipeline error:', err);
      setApiError(err.message || 'Error running AI prediction pipeline.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBookmark = async (id) => {
    const item = predictions.find((p) => p.id === id);
    if (!item) return;
    const newStatus = !item.bookmarked;

    setPredictions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmarked: newStatus } : p))
    );
    if (selectedPrediction?.id === id) {
      setSelectedPrediction((prev) => ({ ...prev, bookmarked: newStatus }));
    }

    try {
      await updatePredictionFeedback(id, { bookmarked: newStatus });
    } catch (err) {
      console.error('Bookmark feedback error:', err);
    }
  };

  const handleToggleReviewed = async (id) => {
    const item = predictions.find((p) => p.id === id);
    if (!item) return;
    const newStatus = !item.is_reviewed;

    setPredictions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_reviewed: newStatus } : p))
    );
    if (selectedPrediction?.id === id) {
      setSelectedPrediction((prev) => ({ ...prev, is_reviewed: newStatus }));
    }

    try {
      await updatePredictionFeedback(id, { is_reviewed: newStatus });
    } catch (err) {
      console.error('Reviewed feedback error:', err);
    }
  };

  const handleToggleHard = async (id) => {
    const item = predictions.find((p) => p.id === id);
    if (!item) return;
    const newStatus = !item.is_hard;

    setPredictions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_hard: newStatus } : p))
    );
    if (selectedPrediction?.id === id) {
      setSelectedPrediction((prev) => ({ ...prev, is_hard: newStatus }));
    }

    try {
      await updatePredictionFeedback(id, { is_hard: newStatus });
    } catch (err) {
      console.error('Hard feedback error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col lg:flex-row antialiased select-none font-sans">
      {/* Mobile Top Header */}
      <MobileNav
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={setActiveWorkspaceId}
        onOpenNewWorkspaceModal={() => setNewWorkspaceModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        getReviewStats={getWorkspaceReviewStats}
        isOffline={isOffline}
      />

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={setActiveWorkspaceId}
          onOpenNewWorkspaceModal={() => setNewWorkspaceModalOpen(true)}
          onOpenSettingsModal={() => setSettingsModalOpen(true)}
          getReviewStats={getWorkspaceReviewStats}
          isOffline={isOffline}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 lg:py-8 max-w-7xl mx-auto w-full select-text pb-24 lg:pb-12">
        {apiError && (
          <div className="mb-6 p-4 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {loadingInitial ? (
          /* Initial Skeleton Loading Screen */
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-white/10 rounded-2xl" />
            <div className="h-28 w-full bg-white/5 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-44 bg-white/5 rounded-3xl" />
              <div className="h-44 bg-white/5 rounded-3xl" />
            </div>
          </div>
        ) : !activeWorkspace ? (
          /* No Workspaces Empty State */
          <div className="p-8 sm:p-12 rounded-4xl glass-card text-center my-12 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Welcome to ExamPredict AI
            </h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Create your course workspace to upload lecture notes and past exam papers for deep AI prediction.
            </p>
            <button
              onClick={() => setNewWorkspaceModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-glow-cyan flex items-center gap-2 mx-auto transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course Workspace</span>
            </button>
          </div>
        ) : (
          /* WORKSPACE MAIN VIEW */
          <>
            {/* 1. Workspace Header */}
            <WorkspaceHeader
              workspace={activeWorkspace}
              uploads={uploads}
              predictions={predictions}
              onDeleteWorkspace={handleDeleteWorkspace}
              reviewStats={getWorkspaceReviewStats(activeWorkspace)}
            />

            {/* Navigation toggle if predictions exist */}
            {predictions.length > 0 && (
              <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentViewMode('predictions')}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      currentViewMode === 'predictions'
                        ? 'bg-cyan-500/25 text-white border border-cyan-400/50 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Predicted Exam Questions ({predictions.length})</span>
                  </button>

                  <button
                    onClick={() => setCurrentViewMode('guided')}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      currentViewMode === 'guided'
                        ? 'bg-indigo-500/25 text-white border border-indigo-400/50 shadow-glow-indigo'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileUp className="w-4 h-4 text-indigo-400" />
                    <span>Add More Notes / Past Papers</span>
                  </button>
                </div>
              </div>
            )}

            {/* GUIDED WORKFLOW (Step 1 -> Step 2 -> Step 3) */}
            {(predictions.length === 0 || currentViewMode === 'guided') && (
              <GuidedWorkflow
                workspace={activeWorkspace}
                uploads={uploads}
                onUploadFile={handleUploadFile}
                onDeleteUpload={handleDeleteUpload}
                onTriggerPipeline={handleTriggerPipeline}
                isProcessing={isProcessing}
              />
            )}

            {/* PREDICTIONS & PATTERN INSIGHTS VIEW */}
            {predictions.length > 0 && currentViewMode === 'predictions' && (
              <>
                {/* 2. Exam Question Setting Pattern Insights */}
                <PatternInsightsCard
                  predictions={predictions}
                  uploads={uploads}
                />

                {/* 3. Filter Chips & Search Bar */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions, topics, formulas..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm placeholder-slate-500"
                      />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                        Sort:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-xl glass-input text-xs font-semibold cursor-pointer"
                      >
                        <option value="frequency" className="bg-[#0B1326] text-white">Highest Recurrence 🔥</option>
                        <option value="difficulty" className="bg-[#0B1326] text-white">Difficulty Level ⚡</option>
                        <option value="mark" className="bg-[#0B1326] text-white">Mark Weighting 🎯</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter Chips Row */}
                  <FilterChipsRow
                    activeFilter={activeFilter}
                    onSelectFilter={setActiveFilter}
                    selectedTopic={selectedTopic}
                    onSelectTopic={setSelectedTopic}
                    topics={distinctTopics}
                    counts={filterCounts}
                  />
                </div>

                {/* 4. Predictions Masonry Grid */}
                {loadingData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 rounded-3xl glass-card skeleton-shimmer" />
                    <div className="h-40 rounded-3xl glass-card skeleton-shimmer" />
                  </div>
                ) : filteredPredictions.length === 0 ? (
                  <div className="text-center py-12 rounded-3xl glass-card">
                    <p className="text-slate-300 font-serif font-bold text-base">
                      No questions match your current filter.
                    </p>
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setSelectedTopic(null);
                        setSearchQuery('');
                      }}
                      className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPredictions.map((prediction) => (
                      <PredictionCard
                        key={prediction.id}
                        prediction={prediction}
                        isSelected={selectedPrediction?.id === prediction.id}
                        onClick={() => setSelectedPrediction(prediction)}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleReviewed={handleToggleReviewed}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 5. Right-Side Slide-Over Detail Panel */}
      <PredictionDetailPanel
        prediction={selectedPrediction}
        isOpen={Boolean(selectedPrediction)}
        onClose={() => setSelectedPrediction(null)}
        onToggleBookmark={handleToggleBookmark}
        onToggleReviewed={handleToggleReviewed}
        onToggleHard={handleToggleHard}
      />

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadFile={handleUploadFile}
        workspace={activeWorkspace}
      />

      <NewWorkspaceModal
        isOpen={newWorkspaceModalOpen}
        onClose={() => setNewWorkspaceModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        backendHealth={backendHealth}
      />
    </div>
  );
}
