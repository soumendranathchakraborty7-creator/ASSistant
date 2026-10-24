import React from 'react';
import { CalendarPlanItem } from '../types/index.ts';
import { formatDateWithDay, formatDateDDMMYY } from '../utils/engine.ts';
import { AlertTriangle, Clock, Calendar, ArrowRight, ShieldAlert, Award } from 'lucide-react';

interface DeadlinesSectionProps {
  deadlines: CalendarPlanItem[];
  onSelectDeadline?: (deadline: CalendarPlanItem) => void;
  onNavigateToCalendar?: () => void;
}

export const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({
  deadlines,
  onSelectDeadline,
  onNavigateToCalendar
}) => {
  const now = new Date();

  // Sort upcoming deadlines by date
  const sortedDeadlines = [...deadlines]
    .filter((d) => d.isDeadline || d.category === 'deadline')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-[#090D14] border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                High-Stakes Academic Deadlines &amp; Milestones
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {sortedDeadlines.length} Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Crucial exam dates, clinical logbook submissions, and nationwide mock tests
            </p>
          </div>
        </div>

        {onNavigateToCalendar && (
          <button
            onClick={onNavigateToCalendar}
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <span>Open Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {sortedDeadlines.map((dl) => {
          const targetDate = new Date(dl.date);
          const diffDays = Math.ceil(
            (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isImminent = diffDays <= 7 && diffDays >= 0;
          const isToday = diffDays === 0;

          return (
            <div
              key={dl.id}
              onClick={() => onSelectDeadline && onSelectDeadline(dl)}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                isToday
                  ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                  : isImminent
                  ? 'bg-neutral-900/80 border-amber-500/50'
                  : 'bg-black/50 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isImminent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {isToday
                      ? 'DUE TODAY'
                      : diffDays > 0
                      ? `${diffDays} DAYS REMAINING`
                      : 'PAST DUE'}
                  </span>

                  {dl.deadlineTime && (
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dl.deadlineTime}
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white mt-2 line-clamp-2">
                  {dl.title}
                </h4>

                {dl.description && (
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {dl.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/80 font-mono text-[10px]">
                <span className="text-neutral-400">
                  {formatDateWithDay(dl.date, true)}
                </span>
                {dl.xp && (
                  <span className="text-amber-400 font-semibold">
                    +{dl.xp} XP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
