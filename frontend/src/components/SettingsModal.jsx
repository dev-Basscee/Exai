import React from 'react';
import {
  X,
  Database,
  Cpu,
  ShieldCheck,
  Smartphone,
  HardDrive
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  backendHealth
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-4xl max-w-md w-full p-6 sm:p-7 shadow-2xl animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="font-serif font-bold text-white text-xl">
            Settings & System Status
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Backend connection and PWA information.
          </p>
        </div>

        <div className="space-y-5">
          {/* Backend Connection Card */}
          <div className="p-4 rounded-2xl glass-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                FastAPI Backend
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                backendHealth?.status === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {backendHealth?.status === 'online' ? 'Connected' : 'Offline Mode'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>LLM Engine:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {backendHealth?.gemini_model || 'gemini-2.5-flash'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Database:</span>
                <span className="font-mono text-slate-200">
                  SQLite (Async SQLAlchemy)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>RAG Retrieval:</span>
                <span className="font-mono text-emerald-300">
                  Active (TF-IDF & Embeddings)
                </span>
              </div>
            </div>
          </div>

          {/* PWA & Cache Details */}
          <div className="p-4 rounded-2xl glass-card space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              PWA & Mobile Install
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ExamPredict AI is configured as a progressive web app. You can install it directly to your home screen or desktop for fast offline review.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
