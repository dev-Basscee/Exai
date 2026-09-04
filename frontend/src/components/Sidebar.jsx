import React from 'react';
import {
  BookOpen,
  Plus,
  Settings,
  Layers,
  Sparkles,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import WorkspaceSidebarItem from './WorkspaceSidebarItem';
import PwaInstallCard from './PwaInstallCard';

export default function Sidebar({
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
  onOpenSettingsModal,
  getReviewStats,
  isOffline,
  onCloseMobileDrawer
}) {
  return (
    <aside className="w-72 glass-panel border-r border-white/10 flex flex-col h-screen shrink-0 sticky top-0 select-none z-30 transition-all duration-200">
      {/* Brand Header */}
      <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-glow-cyan shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-white text-lg leading-none tracking-tight">
                ExamPredict
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider uppercase border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Study Companion
            </p>
          </div>
        </div>

        {/* Connection status */}
        <div
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isOffline
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
          title={isOffline ? "Offline cache mode" : "Connected to live FastAPI backend"}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-2.5 h-2.5" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live API</span>
            </>
          )}
        </div>
      </div>

      {/* Workspaces Section Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Workspaces ({workspaces.length})
        </span>
        <button
          onClick={onOpenNewWorkspaceModal}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all"
          title="Create New Course Workspace"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Workspaces List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-1">
        {workspaces.map((ws) => (
          <WorkspaceSidebarItem
            key={ws.id}
            workspace={ws}
            isActive={ws.id === activeWorkspaceId}
            reviewStats={getReviewStats ? getReviewStats(ws) : { total: ws.predictions_count || 0, reviewed: 0, percentage: 0 }}
            onClick={() => {
              onSelectWorkspace(ws.id);
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }}
          />
        ))}

        {workspaces.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-slate-400">
            No course workspaces yet.
          </div>
        )}

        {/* Add Workspace Button */}
        <button
          onClick={onOpenNewWorkspaceModal}
          className="w-full mt-2 py-3 px-3.5 rounded-2xl border border-dashed border-white/15 hover:border-cyan-400/50 text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center gap-2 text-xs font-semibold transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-white/10 group-hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          Add Course Workspace
        </button>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-2 border-t border-white/10 bg-black/20">
        {/* PWA Install Card */}
        <PwaInstallCard />

        {/* User Profile & Settings Row */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Study Student
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                FastAPI Backend Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettingsModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
