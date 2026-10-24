import React from 'react';
import { MultiPillarStreaks } from '../types/index.ts';
import {
  Flame,
  Dumbbell,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Apple,
  Award
} from 'lucide-react';

interface StreaksMatrixProps {
  streaks: MultiPillarStreaks;
}

export const StreaksMatrix: React.FC<StreaksMatrixProps> = ({ streaks }) => {
  const streakItems = [
    {
      id: 'running',
      label: 'Running Interval',
      days: streaks.runningStreak,
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      sub: '11-Wk Protocol'
    },
    {
      id: 'workout',
      label: 'Calisthenics Strength',
      days: streaks.workoutStreak,
      icon: Dumbbell,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      sub: 'Circuit & Core'
    },
    {
      id: 'anki',
      label: 'Anki Flashcards',
      days: streaks.ankiStreak,
      icon: BookOpen,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
      sub: 'Spaced Recall'
    },
    {
      id: 'mcqs',
      label: 'Solving MCQs',
      days: streaks.mcqStreak,
      icon: Sparkles,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      sub: 'Marrow Modules'
    },
    {
      id: 'meditation',
      label: 'Meditation & Journal',
      days: streaks.meditationStreak,
      icon: ShieldCheck,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/30',
      sub: 'Autonomic Reset'
    },
    {
      id: 'screentime',
      label: 'ScreenZen Cap',
      days: streaks.screentimeStreak,
      icon: Smartphone,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
      sub: '≤ 30m YouTube'
    }
  ];

  return (
    <div className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Individual Multi-Pillar Streaks Matrix
            </h3>
            <p className="text-xs text-neutral-400">
              Isolated accountability across all core disciplinary dimensions
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 border border-neutral-800 rounded px-2 py-0.5 self-start sm:self-auto">
          6 Pillars Monitored
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {streakItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-black/60 border border-neutral-800/90 flex flex-col justify-between hover:border-neutral-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm sm:text-base font-mono font-bold text-white">
                  {item.days}d
                </span>
              </div>

              <div className="mt-2">
                <h4 className="text-xs font-semibold text-neutral-200 truncate">
                  {item.label}
                </h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
