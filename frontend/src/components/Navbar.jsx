import React from 'react';
import { Sparkles, BookOpen, Plus, Wifi, WifiOff, Cpu, ArrowLeft } from 'lucide-react';

export default function Navbar({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onOpenCreateModal,
  onBackToDashboard,
  isOffline
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-4">
          {currentWorkspace && (
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Back to all courses"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={onBackToDashboard}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                ExamPredict AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PWA
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Gemini AI Engine Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Engine</span>
          </div>

          {/* Offline / Online Status */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>Connected</span>
            </div>
          )}

          {/* Workspace Quick Switcher if inside a course */}
          {currentWorkspace && workspaces.length > 1 && (
            <select
              value={currentWorkspace.id}
              onChange={(e) => {
                const found = workspaces.find(w => w.id === e.target.value);
                if (found) onSelectWorkspace(found);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.course_code ? `${w.course_code} - ` : ''}{w.name}
                </option>
              ))}
            </select>
          )}

          {/* New Workspace CTA */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Course</span>
          </button>
        </div>
      </div>
    </header>
  );
}
