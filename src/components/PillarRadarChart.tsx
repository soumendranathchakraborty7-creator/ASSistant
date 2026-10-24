import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import {
  Award,
  Flame,
  ShoppingBag,
  TrendingUp,
  BookOpen,
  Dumbbell,
  ShieldCheck,
  Brain,
  Users,
  ArrowRight
} from 'lucide-react';
import { calculateLevelFromXP } from '../utils/engine.ts';

interface PillarRadarChartProps {
  xpPoints: number;
  streakDays: number;
  careerScore: number; // 0-100
  fitnessScore: number; // 0-100
  disciplineScore: number; // 0-100
  mindScore: number; // 0-100
  socialScore: number; // 0-100
  onNavigateToTab?: (tab: string) => void;
}

export const PillarRadarChart: React.FC<PillarRadarChartProps> = ({
  xpPoints,
  streakDays,
  careerScore,
  fitnessScore,
  disciplineScore,
  mindScore,
  socialScore,
  onNavigateToTab
}) => {
  const { level, currentLevelBaseXP, nextLevelXP, progressPercent } =
    calculateLevelFromXP(xpPoints);

  const streakMultiplier = Math.floor(streakDays / 4);

  const radarData = [
    { pillar: 'Career', value: Math.min(100, Math.max(15, careerScore)), fullMark: 100 },
    { pillar: 'Fitness', value: Math.min(100, Math.max(15, fitnessScore)), fullMark: 100 },
    { pillar: 'Discipline', value: Math.min(100, Math.max(15, disciplineScore)), fullMark: 100 },
    { pillar: 'Mind', value: Math.min(100, Math.max(15, mindScore)), fullMark: 100 },
    { pillar: 'Social', value: Math.min(100, Math.max(15, socialScore)), fullMark: 100 }
  ];

  return (
    <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-5">
      {/* 1. Level & Resident Rank Header */}
      <div className="pb-4 border-b border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-base shrink-0">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                  Resident Progression Architecture
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-950/40 border-amber-800/40 text-amber-300">
                  Level {level} Resident
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-sans mt-0.5">
                Resident Physician Rank {level}
              </h2>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-1">
            <div className="flex justify-between text-xs font-mono text-neutral-400">
              <span>
                <strong className="text-white font-bold">{xpPoints.toLocaleString()}</strong> XP Total
              </span>
              <span>
                Next: {nextLevelXP.toLocaleString()} XP ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5-Pillar Equilibrium Section: Radar Chart + 5 Pillar Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 5-Pillar Radar Visualizer */}
        <div className="lg:col-span-5 h-60 w-full bg-neutral-950/60 border border-neutral-800/70 rounded-xl p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              5-Pillar Equilibrium Radar
            </span>
            <span className="text-[10px] font-mono text-sky-400">
              Balanced Architecture
            </span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#1E293B" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="pillar"
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 9 }}
                  stroke="#1E293B"
                />
                <Radar
                  name="Student Equilibrium"
                  dataKey="value"
                  stroke="#38BDF8"
                  fill="#0284C7"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5 Pillar Interactive Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Pillar 1: Career */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('career')}
            className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-sky-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-sky-400" />
                Career
              </span>
              <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                {careerScore}%
              </span>
            </div>
            <div className="mt-2">
              <h4 className="text-xs font-bold text-white font-sans">
                Marrow &amp; Profs
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                Multi-subject accuracy
              </p>
            </div>
          </div>

          {/* Pillar 2: Fitness */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('fitness')}
            className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-emerald-400" />
                Fitness
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                {fitnessScore}%
              </span>
            </div>
            <div className="mt-2">
              <h4 className="text-xs font-bold text-white font-sans">
                11-Wk Running &amp; Macros
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                Caloric discipline &amp; runs
              </p>
            </div>
          </div>

          {/* Pillar 3: Discipline */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('discipline')}
            className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-rose-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-rose-400" />
                Discipline
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                {disciplineScore}%
              </span>
            </div>
            <div className="mt-2">
              <h4 className="text-xs font-bold text-white font-sans">
                Urges &amp; Chastity
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                Calendar streak tracking
              </p>
            </div>
          </div>

          {/* Pillar 4: Mind */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('discipline')}
            className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Brain className="w-3 h-3 text-indigo-400" />
                Mind
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400 tabular-nums">
                {mindScore}%
              </span>
            </div>
            <div className="mt-2">
              <h4 className="text-xs font-bold text-white font-sans">
                Stoic Journal
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                Meditation &amp; reflections
              </p>
            </div>
          </div>

          {/* Pillar 5: Social */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('social')}
            className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-purple-500/50 transition cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-400" />
                Social
              </span>
              <span className="text-xs font-mono font-bold text-purple-400 tabular-nums">
                {socialScore}%
              </span>
            </div>
            <div className="mt-2">
              <h4 className="text-xs font-bold text-white font-sans">
                Relationships &amp; Recreation
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                Cadence &amp; new hobbies
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
