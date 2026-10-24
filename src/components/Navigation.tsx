import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  BookOpen,
  Dumbbell,
  ShieldCheck,
  Users,
  ShoppingBag,
  Download,
  Mic,
  Database
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export type ActiveTab = 'dashboard' | 'calendar' | 'career' | 'fitness' | 'discipline' | 'social' | 'store';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenVoiceModal: () => void;
  onOpenSupabaseModal: () => void;
  streakDays: number;
  level: number;
  xpPoints: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenVoiceModal,
  onOpenSupabaseModal,
  streakDays,
  level,
  xpPoints
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      {/* Top Bar Contract: 3 zones, single line */}
      <header className="sticky top-0 z-40 w-full bg-[#05080E]/95 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-sm shrink-0">
              ΑΩ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                  Asclepius OS
                </span>
                <span className="text-[11px] font-mono text-neutral-400 border border-neutral-800 rounded px-1.5 py-0.2 hidden xs:inline">
                  Lv.{level} · {streakDays}d Streak
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate max-w-[200px] sm:max-w-xs">
                NEET PG · INI-CET · Clinical Residency
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-neutral-400">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => onSelectTab('calendar')}
              className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'calendar' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => onSelectTab('career')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'career' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Career &amp; Marrow
            </button>
            <button
              onClick={() => onSelectTab('fitness')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'fitness' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Fitness &amp; Running
            </button>
            <button
              onClick={() => onSelectTab('discipline')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'discipline' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Discipline Ledger
            </button>
            <button
              onClick={() => onSelectTab('social')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'social' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Social Matrix
            </button>
            <button
              onClick={() => onSelectTab('store')}
              className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'store' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop &amp; Rewards</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Removed XP shop button per request, keeping Voice Log) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* AI Multimodal Voice Log & Assistant button */}
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25 text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Dictate daily review, plans, to-dos and screenshot uploads"
            >
              <Mic className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Voice Log</span>
            </button>

            {/* Supabase Schema Modal */}
            <button
              onClick={onOpenSupabaseModal}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 border border-neutral-800 transition cursor-pointer"
              title="Supabase Schema &amp; Settings"
              aria-label="Database Settings"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* PWA Install Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install PWA</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-2.5 py-1 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-[11px] font-medium transition cursor-pointer"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </header>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Install on iPhone / iPad</h3>
            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              1. Tap the <strong className="text-sky-400">Share</strong> icon in the Safari toolbar below.<br />
              2. Scroll down the sheet and select <strong className="text-sky-400">Add to Home Screen</strong>.<br />
              3. Asclepius OS will launch in OLED deep black standalone mode.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-medium text-white transition cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Tab Bar: 7 touch-optimized destinations */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05080E]/95 backdrop-blur-lg border-t border-neutral-800 px-2 py-1.5">
        <div className="grid grid-cols-7 items-center max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Command</span>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'calendar' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Plan</span>
          </button>

          <button
            onClick={() => onSelectTab('career')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'career' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Career</span>
          </button>

          <button
            onClick={() => onSelectTab('fitness')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'fitness' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Fitness</span>
          </button>

          <button
            onClick={() => onSelectTab('discipline')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'discipline' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Discipline</span>
          </button>

          <button
            onClick={() => onSelectTab('social')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'social' ? 'text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Social</span>
          </button>

          <button
            onClick={() => onSelectTab('store')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'store' ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-[8px] font-medium mt-0.5">Shop</span>
          </button>
        </div>
      </div>
    </>
  );
};
