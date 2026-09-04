import React, { useState } from 'react';
import {
  Menu,
  X,
  BookOpen,
  Plus,
  Layers,
  Sparkles,
  Settings
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileNav({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
  onOpenSettingsModal,
  getReviewStats,
  isOffline
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden glass-panel border-b border-white/10 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-glow-cyan text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base leading-none block">
                {activeWorkspace ? activeWorkspace.name : 'ExamPredict AI'}
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold tracking-wider uppercase">
                {activeWorkspace?.course_code || 'Study Companion'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewWorkspaceModal}
            className="p-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl transition-colors"
            title="Create Workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl animate-slide-in-right z-10 flex">
            <Sidebar
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={onSelectWorkspace}
              onOpenNewWorkspaceModal={onOpenNewWorkspaceModal}
              onOpenSettingsModal={onOpenSettingsModal}
              getReviewStats={getReviewStats}
              isOffline={isOffline}
              onCloseMobileDrawer={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
