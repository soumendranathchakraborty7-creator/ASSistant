import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Calendar,
  Edit2,
  Archive,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MoreVertical,
  CalendarDays,
  AlertTriangle,
  X
} from 'lucide-react';
import { ActionItem } from '../utils/engine.ts';
import { CalendarPlanItem } from '../types/index.ts';

export interface UnifiedScheduleItem {
  id: string;
  source: 'action' | 'calendar';
  title: string;
  description?: string;
  durationMinutes: number;
  xpReward: number;
  pillar: string;
  priorityLevel: 1 | 2 | 3; // 1 = Critical, 2 = Medium, 3 = Standard
  priorityLabel: string;
  isDeadline: boolean;
  completed: boolean;
  date?: string;
  deadlineTime?: string;
}

interface DailyChecklistProps {
  actions: ActionItem[];
  onToggleAction: (actionId: string) => void;
  availableFreeHours: number;
  energyPercent: number;
  calendarPlansToday?: CalendarPlanItem[];
  onToggleCalendarPlan?: (planId: string) => void;
  onPostponePlan?: (planId: string, days: number) => void;
  onShelvePlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
  onAddCustomTask?: (
    title: string,
    duration: number,
    xp: number,
    pillar: string,
    priorityLevel: 1 | 2 | 3,
    isDeadline?: boolean
  ) => void;
  onUpdateAction?: (actionId: string, updated: Partial<ActionItem>) => void;
  onShelveAction?: (actionId: string) => void;
  shelvedActions?: ActionItem[];
  onRestoreAction?: (actionId: string) => void;
  onCancelAction?: (actionId: string) => void;
  onReassignActionDate?: (actionId: string, newDate: string) => void;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({
  actions,
  onToggleAction,
  availableFreeHours,
  energyPercent,
  calendarPlansToday = [],
  onToggleCalendarPlan,
  onPostponePlan,
  onShelvePlan,
  onDeletePlan,
  onAddCustomTask,
  onUpdateAction,
  onShelveAction,
  shelvedActions = [],
  onRestoreAction,
  onCancelAction,
  onReassignActionDate
}) => {
  const [showShelved, setShowShelved] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Operations modal / drawer for a selected task
  const [operationsItem, setOperationsItem] = useState<UnifiedScheduleItem | null>(null);

  // Edit task modal state
  const [editingItem, setEditingItem] = useState<UnifiedScheduleItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(45);
  const [editXp, setEditXp] = useState(50);
  const [editPriorityLevel, setEditPriorityLevel] = useState<1 | 2 | 3>(1);

  // Reassign date modal state
  const [reassignItem, setReassignItem] = useState<UnifiedScheduleItem | null>(null);
  const [reassignDate, setReassignDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskXp, setTaskXp] = useState(50);
  const [taskPillar, setTaskPillar] = useState<'Career' | 'Fitness' | 'Discipline' | 'Mind' | 'Social'>('Career');
  const [taskPriorityLevel, setTaskPriorityLevel] = useState<1 | 2 | 3>(1);
  const [taskIsDeadline, setTaskIsDeadline] = useState(false);

  // Unify action items and today's calendar plans into ONE SINGLE section
  const unifiedItems: UnifiedScheduleItem[] = [
    // 1. Actions from Engine / Custom Actions
    ...actions.map((a) => {
      let lvl: 1 | 2 | 3 = a.priorityLevel || (a.priority === 'high' ? 1 : a.priority === 'medium' ? 2 : 3);
      return {
        id: a.id,
        source: 'action' as const,
        title: a.title,
        description: a.description,
        durationMinutes: a.durationMinutes,
        xpReward: a.xpReward,
        pillar: a.pillar,
        priorityLevel: lvl,
        priorityLabel: lvl === 1 ? 'Priority 1 (Critical)' : lvl === 2 ? 'Priority 2 (Important)' : 'Priority 3 (Standard)',
        isDeadline: Boolean(a.isDeadline),
        completed: a.completed,
        date: a.dueDate
      };
    }),
    // 2. Calendar Plans due today
    ...calendarPlansToday.map((p) => {
      let lvl: 1 | 2 | 3 = p.priority === 'high' ? 1 : p.priority === 'medium' ? 2 : 3;
      if (p.isDeadline || p.category === 'deadline') {
        lvl = 1;
      }
      return {
        id: p.id,
        source: 'calendar' as const,
        title: p.title,
        description: p.description,
        durationMinutes: p.durationMinutes || 45,
        xpReward: p.xp || p.xpReward || 50,
        pillar: p.category.toUpperCase(),
        priorityLevel: lvl,
        priorityLabel: lvl === 1 ? 'Priority 1 (Critical)' : lvl === 2 ? 'Priority 2 (Important)' : 'Priority 3 (Standard)',
        isDeadline: Boolean(p.isDeadline || p.category === 'deadline'),
        completed: Boolean(p.status === 'completed' || p.isCompleted),
        date: p.date,
        deadlineTime: p.deadlineTime
      };
    })
  ];

  // Sort unified list: Priority 1 first, then Priority 2, then Priority 3; with Deadlines prioritized
  unifiedItems.sort((a, b) => {
    // Non-completed first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // High-stakes deadlines first within active tasks
    if (a.isDeadline !== b.isDeadline) {
      return a.isDeadline ? -1 : 1;
    }
    // Priority level 1 < 2 < 3
    if (a.priorityLevel !== b.priorityLevel) {
      return a.priorityLevel - b.priorityLevel;
    }
    return 0;
  });

  const completedCount = unifiedItems.filter((a) => a.completed).length;
  const totalCount = unifiedItems.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate total scheduled hours
  const totalMinutesScheduled = unifiedItems.reduce((sum, a) => sum + a.durationMinutes, 0);
  const totalHoursScheduled = (totalMinutesScheduled / 60).toFixed(1);
  const freeMinutesBudget = Math.round(availableFreeHours * 60);
  const budgetUtilizationPct = Math.min(
    100,
    Math.round((totalMinutesScheduled / Math.max(1, freeMinutesBudget)) * 100)
  );

  const handleToggleItem = (item: UnifiedScheduleItem) => {
    if (item.source === 'action') {
      onToggleAction(item.id);
    } else if (onToggleCalendarPlan) {
      onToggleCalendarPlan(item.id);
    }
  };

  const handleOpenOperations = (item: UnifiedScheduleItem) => {
    setOperationsItem(item);
  };

  const handleTriggerEdit = () => {
    if (!operationsItem) return;
    setEditingItem(operationsItem);
    setEditTitle(operationsItem.title);
    setEditDuration(operationsItem.durationMinutes);
    setEditXp(operationsItem.xpReward);
    setEditPriorityLevel(operationsItem.priorityLevel);
    setOperationsItem(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;

    if (editingItem.source === 'action' && onUpdateAction) {
      onUpdateAction(editingItem.id, {
        title: editTitle.trim(),
        durationMinutes: editDuration,
        xpReward: editXp,
        priorityLevel: editPriorityLevel,
        priority: editPriorityLevel === 1 ? 'high' : editPriorityLevel === 2 ? 'medium' : 'survival'
      });
    }
    setEditingItem(null);
  };

  const handleTriggerShelve = () => {
    if (!operationsItem) return;
    if (operationsItem.source === 'action' && onShelveAction) {
      onShelveAction(operationsItem.id);
    } else if (operationsItem.source === 'calendar' && onShelvePlan) {
      onShelvePlan(operationsItem.id);
    }
    setOperationsItem(null);
  };

  const handleTriggerReassign = () => {
    if (!operationsItem) return;
    setReassignItem(operationsItem);
    setOperationsItem(null);
  };

  const handleConfirmReassign = () => {
    if (!reassignItem) return;
    if (reassignItem.source === 'action') {
      if (onReassignActionDate) {
        onReassignActionDate(reassignItem.id, reassignDate);
      } else if (onShelveAction) {
        onShelveAction(reassignItem.id);
      }
    } else if (reassignItem.source === 'calendar') {
      if (onPostponePlan) {
        const today = new Date();
        const target = new Date(reassignDate);
        const diffDays = Math.max(1, Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        onPostponePlan(reassignItem.id, diffDays);
      }
    }
    setReassignItem(null);
  };

  const handleTriggerCancel = () => {
    if (!operationsItem) return;
    if (operationsItem.source === 'action') {
      if (onCancelAction) {
        onCancelAction(operationsItem.id);
      } else if (onShelveAction) {
        onShelveAction(operationsItem.id);
      }
    } else if (operationsItem.source === 'calendar' && onDeletePlan) {
      onDeletePlan(operationsItem.id);
    }
    setOperationsItem(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    if (onAddCustomTask) {
      onAddCustomTask(
        taskTitle.trim(),
        taskDuration,
        taskXp,
        taskPillar,
        taskPriorityLevel,
        taskIsDeadline
      );
    }
    setTaskTitle('');
    setTaskIsDeadline(false);
    setShowAddTaskModal(false);
  };

  return (
    <div className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Adaptable Daily Schedule &amp; To-Do
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-sky-950/40 border-sky-800/40 text-sky-400">
              {energyPercent}% Energy · {availableFreeHours}h Budget
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Unified priority-ranked schedule integrating clinical tasks, deadlines, and daily actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          {shelvedActions.length > 0 && (
            <button
              onClick={() => setShowShelved(!showShelved)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-amber-300 text-xs font-mono font-medium transition cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Shelved ({shelvedActions.length})</span>
              {showShelved ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className="text-right hidden sm:block pl-2 border-l border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 block">
              Budget Utilization
            </span>
            <span className="text-xs font-mono font-bold text-white">
              <strong className="text-sky-400">{totalHoursScheduled}h</strong> / {availableFreeHours}h ({budgetUtilizationPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <span>Unified Daily Progress</span>
        <span className="text-sky-400 font-bold">{completedCount}/{totalCount} Completed ({completionPct}%)</span>
      </div>
      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* UNIFIED SINGLE LIST (NO SPLIT SECTIONS) */}
      <div className="divide-y divide-neutral-800/60 mt-1">
        {unifiedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-mono">
            No active tasks scheduled for today. Tap "+ Add Task" to populate your queue.
          </div>
        ) : (
          unifiedItems.map((item) => {
            const isPriority1 = item.priorityLevel === 1;
            const isPriority2 = item.priorityLevel === 2;

            return (
              <div
                key={`${item.source}-${item.id}`}
                className={`py-3 px-2 rounded-xl transition flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-neutral-900/30 opacity-70'
                    : isPriority1
                    ? 'hover:bg-neutral-900/70 border-l-2 border-l-rose-500/80 pl-3'
                    : isPriority2
                    ? 'hover:bg-neutral-900/60 border-l-2 border-l-amber-500/80 pl-3'
                    : 'hover:bg-neutral-900/50 border-l-2 border-l-neutral-700 pl-3'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Mark as Complete Checkbox (ALLOWED IN COMMAND TAB) */}
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item)}
                    className="mt-0.5 text-neutral-400 hover:text-emerald-400 transition shrink-0 cursor-pointer"
                    aria-label={item.completed ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-500 hover:text-emerald-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {/* Priority Badge */}
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isPriority1
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isPriority2
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          P{item.priorityLevel}
                        </span>

                        {item.isDeadline && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold shrink-0">
                            DEADLINE
                          </span>
                        )}

                        <span
                          className={`text-xs sm:text-sm font-semibold break-words leading-tight ${
                            item.completed ? 'line-through text-neutral-400' : 'text-neutral-100'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-emerald-400 text-[11px] sm:text-xs font-mono font-medium">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>+{item.xpReward} XP</span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-1 flex-wrap">
                      <span className="uppercase text-neutral-400 font-semibold">{item.pillar}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.durationMinutes} min
                      </span>
                      {item.deadlineTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-400 font-bold">Due {item.deadlineTime}</span>
                        </>
                      )}
                      {item.source === 'calendar' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-400">Calendar Synced</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* OPERATIONS EXPANDER BUTTON - Optimized for Phone */}
                <div className="flex items-center shrink-0 self-center ml-1">
                  <button
                    onClick={() => handleOpenOperations(item)}
                    className="p-1 sm:px-2 sm:py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition cursor-pointer border border-neutral-700/60 flex items-center gap-1"
                    title="Expand task operations (Edit, Shelve, Reassign, Cancel)"
                    aria-label={`Operations for ${item.title}`}
                  >
                    <span className="hidden sm:inline text-[11px]">Ops</span>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* OPERATIONS EXPANDER MODAL */}
      {operationsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Task Operations
                </span>
              </div>
              <button
                onClick={() => setOperationsItem(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white line-clamp-2">
                {operationsItem.title}
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono mt-1">
                Priority {operationsItem.priorityLevel} · {operationsItem.durationMinutes}m · +{operationsItem.xpReward} XP
              </p>
            </div>

            {/* 4 Core Operations */}
            <div className="space-y-2 pt-1">
              {/* 1. Edit */}
              <button
                onClick={handleTriggerEdit}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Edit2 className="w-4 h-4 text-sky-400" />
                  <span>Edit Parameters</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Title, time, XP, 1-3 rating</span>
              </button>

              {/* 2. Shelve */}
              <button
                onClick={handleTriggerShelve}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-amber-400" />
                  <span>Shelve Task</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Move to overflow backlog</span>
              </button>

              {/* 3. Reassign Date */}
              <button
                onClick={handleTriggerReassign}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-teal-400" />
                  <span>Reassign Date</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Postpone or reschedule</span>
              </button>

              {/* 4. Cancel / Delete */}
              <button
                onClick={handleTriggerCancel}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Cancel Task</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400/80">Delete from queue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN DATE MODAL */}
      {reassignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">Reassign Task Date</h3>
              <button
                onClick={() => setReassignItem(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Reschedule <strong className="text-white font-semibold">"{reassignItem.title}"</strong> to:
            </p>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Target Date</label>
              <input
                type="date"
                value={reassignDate}
                onChange={(e) => setReassignDate(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setReassignDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-1 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300 hover:text-white cursor-pointer"
              >
                Tomorrow (+1d)
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  setReassignDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-1 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300 hover:text-white cursor-pointer"
              >
                +2 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setReassignDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-1 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300 hover:text-white cursor-pointer"
              >
                Next Week (+7d)
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setReassignItem(null)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white cursor-pointer"
              >
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shelved Items Drawer */}
      {showShelved && (
        <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Archive className="w-4 h-4" />
              <span>Shelved &amp; Postponed Tasks ({shelvedActions.length})</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">Preserved in Overflow Backlog</span>
          </div>

          <div className="space-y-2">
            {shelvedActions.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-semibold text-neutral-300">{item.title}</span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <span>{item.pillar}</span>
                    <span>·</span>
                    <span>{item.durationMinutes}m</span>
                    <span>·</span>
                    <span className="text-amber-400">+{item.xpReward} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onRestoreAction && (
                    <button
                      onClick={() => onRestoreAction(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-[11px] font-mono transition cursor-pointer"
                      title="Restore to Today's Active Schedule"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Un-shelve</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Task Modal WITH 1 TO 3 RATING SELECTION */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h3 className="text-sm font-bold text-white font-mono">Add Task to Schedule</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Rapid Pathology Slide Review, 20 Core Squats"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none focus:border-sky-500"
                />
              </div>

              {/* REQUIREMENT: IMPORTANCE 1 TO 3 RATING */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                  Importance Rating (1 to 3)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskPriorityLevel(1)}
                    className={`py-2 px-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      taskPriorityLevel === 1
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                        : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">1 · High / Critical</span>
                    <span className="text-[10px] mt-0.5 opacity-80">Immediate priority</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskPriorityLevel(2)}
                    className={`py-2 px-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      taskPriorityLevel === 2
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                        : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">2 · Medium</span>
                    <span className="text-[10px] mt-0.5 opacity-80">Core daily work</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskPriorityLevel(3)}
                    className={`py-2 px-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      taskPriorityLevel === 3
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">3 · Standard</span>
                    <span className="text-[10px] mt-0.5 opacity-80">Flexible routine</span>
                  </button>
                </div>
              </div>

              {/* Deadline Checkbox */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-neutral-800">
                <input
                  type="checkbox"
                  id="taskDeadlineCheck"
                  checked={taskIsDeadline}
                  onChange={(e) => setTaskIsDeadline(e.target.checked)}
                  className="rounded border-neutral-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="taskDeadlineCheck" className="text-xs text-neutral-300 cursor-pointer flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mark as High-Stakes Exam/Clinical Deadline</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Pillar</label>
                  <select
                    value={taskPillar}
                    onChange={(e) => setTaskPillar(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none"
                  >
                    <option value="Career">Career</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Mind">Mind</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md cursor-pointer"
                >
                  Integrate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h3 className="text-sm font-bold text-white font-mono">Edit Task Parameters</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={editXp}
                    onChange={(e) => setEditXp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Importance Rating (1 to 3)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEditPriorityLevel(lvl as 1 | 2 | 3)}
                      className={`py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
                        editPriorityLevel === lvl
                          ? 'bg-sky-600 text-white border-sky-500 font-bold'
                          : 'bg-black text-neutral-400 border-neutral-800'
                      }`}
                    >
                      Priority {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
