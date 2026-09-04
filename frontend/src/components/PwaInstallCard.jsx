import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isDismissed || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="mx-3 mb-2 p-3.5 rounded-2xl glass-card relative group">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-glow-cyan">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="pr-4">
          <h4 className="text-xs font-serif font-bold text-white leading-tight">
            Install Mobile App
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Add ExamPredict to your phone or desktop for offline study.
          </p>
        </div>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan flex items-center justify-center gap-1.5 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    </div>
  );
}
