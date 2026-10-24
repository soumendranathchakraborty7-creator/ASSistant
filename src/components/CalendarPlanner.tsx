import React, { useState } from 'react';
import {
  CalendarPlanItem,
  PlanCategory
} from '../types/index.ts';
import {
  formatDateWithDay,
  formatDateDDMMYY
} from '../utils/engine.ts';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Archive,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Dumbbell,
  ShieldCheck,
  Edit2,
  CalendarDays,
  Lock,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Inbox
} from 'lucide-react';
import { ActionItem } from '../utils/engine.ts';

interface CalendarPlannerProps {
  plans: CalendarPlanItem[];
  onAddPlan: (plan: CalendarPlanItem) => void;
  onUpdatePlan: (plan: CalendarPlanItem) => void;
  onDeletePlan: (id: string) => void;
  onShelvePlan: (id: string) => void;
  onPostponePlan: (id: string, daysToAdd: number) => void;
  shelvedActions?: ActionItem[];
  onRestoreAction?: (id: string) => void;
}

type CalendarViewMode = 'week' | 'month' | 'year';

export const CalendarPlanner: React.FC<CalendarPlannerProps> = ({
  plans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onShelvePlan,
  onPostponePlan,
  shelvedActions = [],
  onRestoreAction
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showBacklogDrawer, setShowBacklogDrawer] = useState(false);

  // Operations Modals State
  const [editingPlan, setEditingPlan] = useState<CalendarPlanItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<PlanCategory>('career');
  const [editDuration, setEditDuration] = useState(45);
  const [editXp, setEditXp] = useState(50);
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'survival'>('high');

  const [reassignPlan, setReassignPlan] = useState<CalendarPlanItem | null>(null);
  const [reassignTargetDate, setReassignTargetDate] = useState(selectedDate);

  // New Plan Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PlanCategory>('career');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [newXp, setNewXp] = useState(60);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'survival'>('high');
  const [newIsDeadline, setNewIsDeadline] = useState(false);
  const [newDeadlineTime, setNewDeadlineTime] = useState('18:00');
  const [newIsVagueGoal, setNewIsVagueGoal] = useState(false);

  // Operational limits:
  // 1. Exact agenda / targets: assignable at least 3 months ahead (~92 days from today)
  // 2. Vague actionable goals: assignable anytime ahead (no horizon limit)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxExactAssignDate = new Date(today);
  maxExactAssignDate.setDate(today.getDate() + 92); // 3 months ahead
  const maxExactAssignDateStr = maxExactAssignDate.toISOString().split('T')[0];

  // Any day from today onwards is eligible for agenda assignment
  const isSelectedWithin3Months = selectedDate >= todayStr && selectedDate <= maxExactAssignDateStr;
  const isSelectedFuture = selectedDate >= todayStr;
  const canAssignToSelectedDate = isSelectedFuture;

  // Filter plans for selected date (excluding shelved items)
  const selectedDayPlans = plans.filter((p) => p.date === selectedDate && !p.isShelved && p.status !== 'shelved');
  const deadlinesForDay = selectedDayPlans.filter((p) => p.isDeadline || p.category === 'deadline');
  const careerForDay = selectedDayPlans.filter((p) => p.category === 'career');
  const fitnessForDay = selectedDayPlans.filter((p) => p.category === 'fitness');
  const disciplineForDay = selectedDayPlans.filter((p) => p.category === 'discipline');
  const socialForDay = selectedDayPlans.filter((p) => p.category === 'social');
  const recreationForDay = selectedDayPlans.filter((p) => p.category === 'recreation');
  const generalTodosForDay = selectedDayPlans.filter((p) => p.category === 'todo');

  // Shelved items aggregation
  const shelvedCalendarPlans = plans.filter((p) => p.isShelved || p.status === 'shelved');
  const totalShelvedCount = shelvedCalendarPlans.length + (shelvedActions?.length || 0);

  // Month navigation helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleOpenAddModal = (dateStr?: string) => {
    const targetDate = dateStr || selectedDate;
    setSelectedDate(targetDate);
    const within3m = targetDate >= todayStr && targetDate <= maxExactAssignDateStr;
    setNewIsVagueGoal(!within3m);
    setIsAddModalOpen(true);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!canAssignToSelectedDate) return;

    const newPlan: CalendarPlanItem = {
      id: `plan-${Date.now()}`,
      date: selectedDate,
      category: newIsDeadline ? 'deadline' : newCategory,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      durationMinutes: newDuration,
      xp: newXp,
      xpReward: newXp,
      priority: newPriority,
      status: 'scheduled',
      isDeadline: newIsDeadline,
      deadlineTime: newIsDeadline ? newDeadlineTime : undefined,
      isVagueGoal: newIsVagueGoal || !isSelectedWithin3Months
    };

    onAddPlan(newPlan);
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (plan: CalendarPlanItem) => {
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditDescription(plan.description || '');
    setEditCategory(plan.category);
    setEditDuration(plan.durationMinutes || 45);
    setEditXp(plan.xp || plan.xpReward || 50);
    setEditPriority(plan.priority || 'high');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editTitle.trim()) return;

    onUpdatePlan({
      ...editingPlan,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      category: editCategory,
      durationMinutes: editDuration,
      xp: editXp,
      xpReward: editXp,
      priority: editPriority
    });

    setEditingPlan(null);
  };

  const handleOpenReassign = (plan: CalendarPlanItem) => {
    setReassignPlan(plan);
    setReassignTargetDate(plan.date);
  };

  const handleSaveReassign = () => {
    if (!reassignPlan) return;
    onUpdatePlan({
      ...reassignPlan,
      date: reassignTargetDate
    });
    setReassignPlan(null);
  };

  // Generate days array for month view
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const fullDate = `${year}-${monthStr}-${dayStr}`;
    days.push(fullDate);
  }

  // Week view: 7 days around current selected date
  const getWeekDates = () => {
    const sel = new Date(selectedDate);
    const dayOfWeek = sel.getDay();
    const startOfWeek = new Date(sel);
    startOfWeek.setDate(sel.getDate() - dayOfWeek);

    const weekArr: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekArr.push(d.toISOString().split('T')[0]);
    }
    return weekArr;
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Header and Controls - Mobile Optimized */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                  Syllabus &amp; Life Planner
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 border border-emerald-900/60 bg-emerald-950/40 rounded px-1.5 py-0.2">
                  3-Mo Exact · Anytime Vague
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Projected Week, Month &amp; Year Horizon
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-black/60 border border-neutral-800 p-0.5">
              {(['week', 'month', 'year'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium uppercase font-mono transition-all cursor-pointer ${
                    viewMode === mode
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Backlog Drawer Button */}
            <button
              onClick={() => setShowBacklogDrawer(true)}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 text-[11px] sm:text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Open overflow backlog and shelved tasks"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Backlog ({totalShelvedCount})</span>
            </button>

            <button
              onClick={() => handleOpenAddModal(selectedDate)}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer bg-sky-600 hover:bg-sky-500 text-white"
              title="Add exact agenda (up to 3 months) or vague actionable goal (anytime)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add Plan / Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Month Window & Open-Horizon Vague Goals Policy Notice */}
      <div className="px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-neutral-300">
        <span className="truncate">
          ★ <strong className="text-sky-300">Strategic Planner:</strong> Exact targets permitted ≤ 3 months ({todayStr} to {maxExactAssignDateStr}). Vague actionable goals permitted anytime ahead.
        </span>
        <button
          onClick={() => setShowBacklogDrawer(true)}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] self-start sm:self-auto cursor-pointer"
        >
          <Archive className="w-3 h-3" />
          <span>{totalShelvedCount} Shelved Tasks</span>
        </button>
      </div>

      {/* MONTH VIEW - MOBILE CONDENSED */}
      {viewMode === 'month' && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-2 sm:p-5 shadow-lg">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-neutral-800 mb-2 sm:mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h3 className="text-xs sm:text-base font-bold text-white font-mono">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[8px] sm:text-[11px] text-neutral-400 font-semibold mb-1">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Grid: Compact & Optimized for Phone Screens */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-10 sm:h-20 rounded-lg sm:rounded-xl bg-neutral-950/40 border border-transparent" />;
              }

              const dayPlans = plans.filter((p) => p.date === dateStr && !p.isShelved && p.status !== 'shelved');
              const hasDeadline = dayPlans.some((p) => p.isDeadline || p.category === 'deadline');
              const hasVagueGoal = dayPlans.some((p) => p.isVagueGoal);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isWithin3Months = dateStr >= todayStr && dateStr <= maxExactAssignDateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-10 sm:h-20 rounded-lg sm:rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between text-left transition-all relative border cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-500/40'
                      : isToday
                      ? 'bg-neutral-800/90 border-sky-400/50'
                      : isWithin3Months
                      ? 'bg-black/70 border-neutral-800 hover:border-neutral-700'
                      : 'bg-black/40 border-neutral-900 opacity-80 hover:opacity-100 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] sm:text-xs font-mono font-bold leading-none ${
                        isSelected ? 'text-sky-400' : isToday ? 'text-white' : 'text-neutral-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {hasDeadline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="High-Stakes Deadline" />
                      )}
                      {hasVagueGoal && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Vague Actionable Goal" />
                      )}
                    </div>
                  </div>

                  <div className="w-full">
                    {dayPlans.length > 0 && (
                      <div className="flex items-center gap-0.5 truncate">
                        <span className="text-[7.5px] sm:text-[10px] font-mono font-semibold px-0.5 sm:px-1 py-0.2 rounded bg-neutral-800/90 text-neutral-300 truncate">
                          {dayPlans.length}
                          <span className="hidden sm:inline"> {dayPlans.length === 1 ? 'item' : 'items'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-3 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
            <h3 className="text-xs sm:text-sm font-mono text-neutral-300">
              Week of {formatDateWithDay(weekDates[0], true)} – {formatDateWithDay(weekDates[6], true)}
            </h3>
            <span className="text-[11px] font-mono text-sky-400 font-semibold">
              7-Day Micro-Cycle
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {weekDates.map((dateStr) => {
              const dayPlans = plans.filter((p) => p.date === dateStr);
              const isSelected = dateStr === selectedDate;
              const hasDeadline = dayPlans.some((p) => p.isDeadline || p.category === 'deadline');

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[90px] sm:min-h-[110px] ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 ring-2 ring-sky-500/30'
                      : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {formatDateWithDay(dateStr, true)}
                      </span>
                      {hasDeadline && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                      {dayPlans.length} planned
                    </p>
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayPlans.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="text-[9px] truncate px-1 py-0.5 rounded bg-neutral-800/80 text-neutral-300 font-mono"
                      >
                        {p.title}
                      </div>
                    ))}
                    {dayPlans.length > 2 && (
                      <span className="text-[9px] text-neutral-400 font-mono">
                        +{dayPlans.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* YEAR VIEW */}
      {viewMode === 'year' && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-3 sm:p-5 shadow-lg">
          <div className="pb-3 border-b border-neutral-800 mb-3">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono">
              Academic &amp; Exam Milestone Horizon ({year})
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inspect any month to view exam schedules, mock grand tests, and syllabus agendas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {monthNames.map((mName, mIdx) => {
              const monthPrefix = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
              const monthPlans = plans.filter((p) => p.date.startsWith(monthPrefix));
              const monthDeadlines = monthPlans.filter((p) => p.isDeadline || p.category === 'deadline');

              return (
                <div
                  key={mName}
                  onClick={() => {
                    setCurrentMonthDate(new Date(year, mIdx, 1));
                    setSelectedDate(`${monthPrefix}-01`);
                    setViewMode('month');
                  }}
                  className="p-3 rounded-xl bg-black/60 border border-neutral-800 hover:border-sky-500/50 transition cursor-pointer flex flex-col justify-between min-h-[85px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-white">
                      {mName}
                    </span>
                    {monthDeadlines.length > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {monthDeadlines.length} DL
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-neutral-400">
                    <p>{monthPlans.length} Total Plans</p>
                    {monthDeadlines.length > 0 && (
                      <p className="text-rose-400 truncate mt-0.5">
                        {monthDeadlines[0].title}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED DAY AGENDA DETAIL */}
      <div className="rounded-2xl bg-[#090D14] border border-neutral-800 p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
                Inspected Day Agenda
              </span>
              <span className="text-[11px] font-mono text-neutral-400 border border-neutral-800 rounded px-1.5 py-0.5">
                {formatDateDDMMYY(selectedDate)}
              </span>
              {canAssignToSelectedDate ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                  In 7d Window
                </span>
              ) : (
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>View Only</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {formatDateWithDay(selectedDate)}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-400">
              Total XP: <strong className="text-amber-400">{selectedDayPlans.reduce((acc, p) => acc + (p.xp || p.xpReward || 0), 0)} XP</strong>
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Duration: <strong className="text-sky-400">{selectedDayPlans.reduce((acc, p) => acc + (p.durationMinutes || 0), 0)} min</strong>
            </span>

            {canAssignToSelectedDate ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to this day</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-neutral-400 italic">
                Agenda assignment opens when date is ≤ 7 days away
              </span>
            )}
          </div>
        </div>

        {selectedDayPlans.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarIcon className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-neutral-400">
              No planned items or deadlines logged for {formatDateWithDay(selectedDate)}.
            </p>
            {canAssignToSelectedDate ? (
              <p className="text-xs text-neutral-500 mt-1">
                Tap "Add to this day" or use voice command log to schedule clinical study, fitness, or deadlines.
              </p>
            ) : (
              <p className="text-xs text-neutral-500 mt-1">
                You can browse any day of the year; daily agenda planning unlocks when within 7 days.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Note about completion behavior */}
            <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
              <span>Task execution &amp; completion is managed exclusively under the Command tab.</span>
              <span className="text-neutral-500">Edit / Shelve / Reassign / Cancel below</span>
            </div>

            {/* Section 1: Deadlines */}
            {deadlinesForDay.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High-Stakes Deadlines &amp; Submissions ({deadlinesForDay.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {deadlinesForDay.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-rose-300 px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/30">
                            DUE {p.deadlineTime || '18:00'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{p.title}</h4>
                        </div>
                        {p.description && (
                          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-1">
                          <span>+{p.xp || p.xpReward || 100} XP</span>
                          <span>·</span>
                          <span>{p.durationMinutes || 60} min</span>
                        </div>
                      </div>

                      {/* Operations buttons (No mark complete per user instruction) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReassign(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-teal-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Reassign Date"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShelvePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Shelve"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                          title="Cancel / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Career Plans */}
            {careerForDay.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Planned Career &amp; Marrow Theory ({careerForDay.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {careerForDay.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-3 hover:border-neutral-700 transition"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {p.title}
                        </h4>
                        {p.description && (
                          <p className="text-[11px] text-neutral-400 mt-0.5">{p.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-neutral-400">
                          {p.durationMinutes && <span>{p.durationMinutes} min</span>}
                          <span>·</span>
                          <span className="text-amber-400">+{p.xp || p.xpReward || 50} XP</span>
                          {p.isShelved && (
                            <span className="text-amber-400 font-bold bg-amber-950/40 px-1 rounded">Shelved</span>
                          )}
                        </div>
                      </div>

                      {/* Operations buttons (No mark complete per instruction) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReassign(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-teal-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Reassign Date"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShelvePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Shelve to Backlog"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                          title="Cancel / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Fitness Plans */}
            {fitnessForDay.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Planned Fitness &amp; Running ({fitnessForDay.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {fitnessForDay.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-3 hover:border-neutral-700 transition"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {p.title}
                        </h4>
                        {p.description && (
                          <p className="text-[11px] text-neutral-400 mt-0.5">{p.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-neutral-400">
                          {p.durationMinutes && <span>{p.durationMinutes} min</span>}
                          <span>·</span>
                          <span className="text-amber-400">+{p.xp || p.xpReward || 50} XP</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReassign(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-teal-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Reassign Date"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShelvePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition cursor-pointer"
                          title="Shelve to Backlog"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlan(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                          title="Cancel / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Discipline, Social, Recreation & To-Dos */}
            {(disciplineForDay.length > 0 || socialForDay.length > 0 || recreationForDay.length > 0 || generalTodosForDay.length > 0) && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Discipline, Social, Recreation &amp; To-Dos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...disciplineForDay, ...socialForDay, ...recreationForDay, ...generalTodosForDay].map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          {p.category}
                        </span>
                        <h5 className="text-xs font-semibold mt-0.5 text-white truncate">
                          {p.title}
                        </h5>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400 mt-1">
                          {p.durationMinutes && <span>{p.durationMinutes}m</span>}
                          <span>·</span>
                          <span className="text-amber-400">+{p.xp || p.xpReward || 50} XP</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReassign(p)}
                          className="p-1 rounded text-neutral-400 hover:text-teal-300 transition cursor-pointer"
                          title="Reassign Date"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShelvePlan(p.id)}
                          className="p-1 rounded text-neutral-400 hover:text-amber-300 transition cursor-pointer"
                          title="Shelve"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlan(p.id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                          title="Cancel / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD PLAN MODAL (CONSTRAINED TO 1 WEEK AHEAD) */}
      {/* ADD PLAN / GOAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-sky-400" />
                  <span>{newIsVagueGoal ? 'Set Vague Actionable Goal' : 'Schedule Exact Milestone'}</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Target Date: <strong className="text-sky-300">{formatDateDDMMYY(selectedDate)}</strong> {isSelectedWithin3Months ? '(Within 3-mo exact window)' : '(Open horizon)'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              {/* Type Switcher: Exact Agenda vs Vague Actionable Goal */}
              <div className="p-1 rounded-xl bg-black border border-neutral-800 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setNewIsVagueGoal(false)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                    !newIsVagueGoal
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Exact Agenda (≤ 3mo)
                </button>
                <button
                  type="button"
                  onClick={() => setNewIsVagueGoal(true)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                    newIsVagueGoal
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Vague Goal (Anytime)
                </button>
              </div>

              {!isSelectedWithin3Months && !newIsVagueGoal && (
                <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[10px] font-mono text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Selected date is &gt; 3 months away. It will be scheduled as a strategic Vague Actionable Goal.</span>
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  {newIsVagueGoal ? 'Actionable Goal / Vision Title' : 'Milestone / Plan Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    newIsVagueGoal
                      ? "e.g. Master Clinical Long Cases, Consolidate 1st Year Anatomy"
                      : "e.g. ObGyn Partograph Theory, 400m Track Intervals"
                  }
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              {/* Deadline Toggle */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-neutral-800">
                <input
                  type="checkbox"
                  id="modalIsDeadline"
                  checked={newIsDeadline}
                  onChange={(e) => setNewIsDeadline(e.target.checked)}
                  className="rounded border-neutral-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="modalIsDeadline" className="text-xs text-neutral-300 cursor-pointer flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mark as High-Stakes Exam/Clinical Submission</span>
                </label>
              </div>

              {newIsDeadline ? (
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Due Time</label>
                  <input
                    type="time"
                    value={newDeadlineTime}
                    onChange={(e) => setNewDeadlineTime(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-neutral-400 block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PlanCategory)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="career">Career / Theory</option>
                      <option value="fitness">Fitness / Running</option>
                      <option value="discipline">Discipline</option>
                      <option value="social">Social</option>
                      <option value="recreation">Recreation</option>
                      <option value="todo">General To-Do</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-neutral-400 block mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="high">High (Priority 1)</option>
                      <option value="medium">Medium (Priority 2)</option>
                      <option value="survival">Standard (Priority 3)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">Context / Action Steps</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={newIsVagueGoal ? "Actionable vision, key deliverables, or milestones" : "Clinical notes, chapters to cover, or specific objectives"}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer transition ${
                    newIsVagueGoal ? 'bg-purple-600 hover:bg-purple-500' : 'bg-sky-600 hover:bg-sky-500'
                  }`}
                >
                  {newIsVagueGoal ? 'Set Vague Goal' : 'Confirm Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">Edit Plan Parameters</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as PlanCategory)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="career">Career</option>
                    <option value="fitness">Fitness</option>
                    <option value="discipline">Discipline</option>
                    <option value="social">Social</option>
                    <option value="recreation">Recreation</option>
                    <option value="todo">To-Do</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN DATE MODAL */}
      {reassignPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">Reassign Milestone Date</h3>
              <button
                onClick={() => setReassignPlan(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Reschedule <strong className="text-white font-semibold">"{reassignPlan.title}"</strong>:
            </p>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">New Target Date</label>
              <input
                type="date"
                min={todayStr}
                value={reassignTargetDate}
                onChange={(e) => setReassignTargetDate(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                Exact targets ≤ {maxExactAssignDateStr} · Vague goals anytime
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setReassignPlan(null)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReassign}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white cursor-pointer"
              >
                Save Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERFLOW BACKLOG & SHELVED TASKS SECTION / MODAL */}
      {showBacklogDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>Overflow Backlog &amp; Shelved Tasks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300">
                      {totalShelvedCount} Total
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Tasks postponed or shelved from daily schedule and calendar planner
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBacklogDrawer(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {totalShelvedCount === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Inbox className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-sm font-medium text-neutral-300">
                    Overflow Backlog is Clean
                  </p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    No shelved tasks. Any task shelved from your adaptable daily schedule or calendar will be archived here for future reassignment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Shelved Calendar Plans */}
                  {shelvedCalendarPlans.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span className="uppercase font-bold text-sky-400">
                          Shelved Calendar Plans ({shelvedCalendarPlans.length})
                        </span>
                        <span>Click unshelve to restore date</span>
                      </div>

                      <div className="space-y-2">
                        {shelvedCalendarPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 hover:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold bg-sky-950/40 border border-sky-800/40 text-sky-300">
                                  {plan.category}
                                </span>
                                <span className="text-xs font-bold text-white truncate">{plan.title}</span>
                              </div>
                              {plan.description && (
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{plan.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-1">
                                <span>Original Date: {formatDateDDMMYY(plan.date)}</span>
                                <span>·</span>
                                <span>{plan.durationMinutes || 45} min</span>
                                <span>·</span>
                                <span className="text-emerald-400">+{plan.xpReward || plan.xp || 50} XP</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto flex-wrap">
                              <button
                                onClick={() => {
                                  onUpdatePlan({ ...plan, isShelved: false, status: 'scheduled', date: todayStr });
                                  setShowBacklogDrawer(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>To Today</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleOpenReassign(plan);
                                  setShowBacklogDrawer(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1"
                              >
                                <CalendarDays className="w-3 h-3" />
                                <span>Plan Date</span>
                              </button>
                              <button
                                onClick={() => onDeletePlan(plan.id)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                                title="Discard"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shelved Daily Checklist Actions */}
                  {shelvedActions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span className="uppercase font-bold text-amber-400">
                          Shelved Daily Schedule Tasks ({shelvedActions.length})
                        </span>
                        <span>Restorable to active queue</span>
                      </div>

                      <div className="space-y-2">
                        {shelvedActions.map((action) => (
                          <div
                            key={action.id}
                            className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 hover:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold bg-amber-950/40 border border-amber-800/40 text-amber-300">
                                  {action.pillar}
                                </span>
                                <span className="text-xs font-bold text-white truncate">{action.title}</span>
                              </div>
                              {action.description && (
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{action.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-1">
                                <span>{action.durationMinutes} min</span>
                                <span>·</span>
                                <span className="text-emerald-400">+{action.xpReward} XP</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                              {onRestoreAction && (
                                <button
                                  onClick={() => {
                                    onRestoreAction(action.id);
                                    setShowBacklogDrawer(false);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore to Today</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-black/40">
              <span className="text-[11px] font-mono text-neutral-400">
                Shelved items don't consume daily energy or cause penalties.
              </span>
              <button
                onClick={() => setShowBacklogDrawer(false)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 transition cursor-pointer"
              >
                Close Backlog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
