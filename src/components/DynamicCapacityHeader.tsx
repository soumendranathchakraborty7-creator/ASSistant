import React from 'react';
import {
  BatteryCharging,
  Clock,
  Stethoscope,
  Thermometer,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { CapacityState, ProfileState } from '../types/index.ts';
import { calculateScheduleMode, isUniversityProfExamNear } from '../utils/engine.ts';

interface DynamicCapacityHeaderProps {
  capacity: CapacityState;
  onUpdateCapacity: (newCap: CapacityState) => void;
  profile: ProfileState;
  staleSubjects: { subject: string; daysSinceLast: number }[];
}

export const DynamicCapacityHeader: React.FC<DynamicCapacityHeaderProps> = ({
  capacity,
  onUpdateCapacity,
  profile,
  staleSubjects
}) => {
  const mode = calculateScheduleMode(capacity);
  const isProfNear = isUniversityProfExamNear(profile.universityProfExamDate);

  // Compute days until University Prof exam
  let daysToProf = 0;
  if (profile.universityProfExamDate) {
    const examDate = new Date(profile.universityProfExamDate);
    const now = new Date();
    daysToProf = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Energy color scale
  const getEnergyBadge = () => {
    if (capacity.isSick) {
      return {
        label: 'SICK TARGET FREEZE',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        detail: 'Streak locked without guilt. Rest & fluid recovery active.'
      };
    }
    if (capacity.isOnCall) {
      return {
        label: 'ON-CALL DUTY PAUSE',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        detail: 'Clinical ward shift active. Circadian sleep disruption accepted. Streaks shielded.'
      };
    }
    if (capacity.energyPercent <= 30) {
      return {
        label: 'MINIMUM SURVIVAL PROTOCOL',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        detail: 'Calisthenics dropped. Low-cortisol essentials: 1h Anki, ≥2km walk, 1h review, 5m meditation.'
      };
    }
    if (capacity.energyPercent <= 60) {
      return {
        label: 'MODERATE FATIGUE SCALING',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        detail: 'Strength circuit volume halved (2 sets). MCQ blocks scaled down.'
      };
    }
    return {
      label: 'BASELINE FULL CAPACITY',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      detail: 'Full high-yield schedule: MCQs, 4h theory, interval run & 4-set calisthenics.'
    };
  };

  const status = getEnergyBadge();

  return (
    <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400 shrink-0">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                Dynamic Capacity Engine
              </span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              {status.detail}
            </p>
          </div>
        </div>

        {/* Quick Duty Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onUpdateCapacity({ ...capacity, isOnCall: !capacity.isOnCall })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              capacity.isOnCall
                ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>On-Call Duty</span>
          </button>

          <button
            onClick={() => onUpdateCapacity({ ...capacity, isSick: !capacity.isSick })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              capacity.isSick
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Sick Mode</span>
          </button>
        </div>
      </div>

      {/* Capacity Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {/* Energy Slider */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Somatic Energy Battery
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {capacity.energyPercent}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={capacity.energyPercent}
            onChange={(e) =>
              onUpdateCapacity({ ...capacity, energyPercent: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
            <span>Burnout (&le;30%)</span>
            <span>Moderate (50%)</span>
            <span>Optimal (100%)</span>
          </div>
        </div>

        {/* Available Hours */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Available Free Time Budget
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {capacity.availableFreeHours} hrs
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={capacity.availableFreeHours}
            onChange={(e) =>
              onUpdateCapacity({ ...capacity, availableFreeHours: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
            <span>Post-Duty (2-3h)</span>
            <span>Standard (6h)</span>
            <span>Sunday Deep (10h+)</span>
          </div>
        </div>
      </div>

      {/* University Prof Exam Theory Priority Banner */}
      {isProfNear && (
        <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-800/60 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-indigo-300">
              University Professional Exams in {daysToProf} Days (&le; 6 Weeks)
            </span>
            <p className="text-neutral-300 mt-0.5">
              Theory deep-study blocks dynamically prioritized over custom modules: Clinical Medicine (Kundu), Surgery (SRB), OBG (Dutta), Pediatrics (Ghai).
            </p>
          </div>
        </div>
      )}

      {/* Spaced Stale Alert Banner: Core 4th-Year Subjects >= 7 Days */}
      {staleSubjects.length > 0 && (
        <div className="mt-3 p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-rose-300">
              Spaced Stale Alert: 4th-Year Subjects Inactive for &ge; 7 Days
            </span>
            <p className="text-neutral-300 mt-0.5">
              The following high-stakes clinical subjects need immediate question review:{' '}
              {staleSubjects.map((s, idx) => (
                <span key={s.subject} className="font-mono text-rose-200 font-medium">
                  {s.subject} ({s.daysSinceLast >= 90 ? 'Never' : `${s.daysSinceLast}d ago`})
                  {idx < staleSubjects.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
