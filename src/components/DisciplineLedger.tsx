import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  ShieldAlert,
  Flame,
  Zap,
  RotateCcw,
  Sparkles,
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Youtube,
  Calendar as CalendarIcon,
  Check,
  Heart,
  Smile,
  Frown,
  Smartphone,
  ShieldCheck,
  Plus,
  Edit2,
  Layers,
  Lock,
  X
} from 'lucide-react';
import {
  UrgeLog,
  UrgeTriggerType,
  ScreenTimeLog,
  MindLog,
  RewardItem
} from '../types/index.ts';
import {
  URGE_SLIP_PENALTIES,
  formatDateWithDay,
  formatDateDDMMYY
} from '../utils/engine.ts';
import { geminiService } from '../services/geminiService.ts';
import { storage } from '../services/supabaseStorage.ts';

interface DisciplineLedgerProps {
  urgeLogs: UrgeLog[];
  onAddUrgeLog: (log: Omit<UrgeLog, 'id' | 'timestamp'>) => void;
  onCompleteRedemption: (id: string, xpRecovered: number) => void;
  screenTime: ScreenTimeLog;
  onUpdateScreenTime: (log: ScreenTimeLog) => void;
  mindLog: MindLog;
  onUpdateMindLog: (log: MindLog) => void;
  onAwardXP: (xp: number, reason: string) => void;
  onDeductXP: (xp: number, reason: string) => void;
  energyPercent: number;
  streakDays: number;
  meditationStreak: number;
  screentimeStreak: number;
}

type TimeRangeFilter = 'week' | 'month' | 'year';

export const DisciplineLedger: React.FC<DisciplineLedgerProps> = ({
  urgeLogs,
  onAddUrgeLog,
  onCompleteRedemption,
  screenTime,
  onUpdateScreenTime,
  mindLog,
  onUpdateMindLog,
  onAwardXP,
  onDeductXP,
  energyPercent,
  streakDays,
  meditationStreak,
  screentimeStreak
}) => {
  // Urge Entry state
  const [triggerType, setTriggerType] = useState<UrgeTriggerType>('SEXUAL_URGE');
  const [intensity, setIntensity] = useState<number>(3);
  const [wasSlip, setWasSlip] = useState<boolean>(false);
  const [context, setContext] = useState<string>('');
  const [isGeneratingRedemption, setIsGeneratingRedemption] = useState(false);

  // Stoic Meditation direct input (timer removed per user instruction)
  const [typedMeditationMinutes, setTypedMeditationMinutes] = useState<number>(15);

  // Time range filters
  const [screenRange, setScreenRange] = useState<TimeRangeFilter>('week');
  const [meditationRange, setMeditationRange] = useState<TimeRangeFilter>('week');

  // Evening Journal & Gratitude fields
  const [journalGratitude, setJournalGratitude] = useState(mindLog.gratitude);
  const [journalRegrets, setJournalRegrets] = useState(mindLog.regrets);
  const [journalEvents, setJournalEvents] = useState(mindLog.notableEvents);
  const [journalIntentions, setJournalIntentions] = useState(mindLog.tomorrowIntentions);

  // Last week's reviews (gratitudes and regrets)
  const lastWeekReviews = storage.getLastWeekReviews();

  const handleLogTypedMeditation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typedMeditationMinutes < 1) return;
    const blocksOf5 = Math.floor(typedMeditationMinutes / 5);
    const xp = Math.max(20, blocksOf5 * 50);
    onAwardXP(xp, `Completed ${typedMeditationMinutes} min stoic meditation`);
    onUpdateMindLog({ ...mindLog, meditationMinutes: mindLog.meditationMinutes + typedMeditationMinutes });
  };

  const handleUrgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const penalty = wasSlip ? URGE_SLIP_PENALTIES[triggerType] || -300 : 0;

    let redemptionAction = '';
    if (wasSlip) {
      setIsGeneratingRedemption(true);
      try {
        const redemption = await geminiService.generateRedemption(
          { type: triggerType, context },
          energyPercent
        );
        redemptionAction = redemption.tacticalAction;
      } catch {
        redemptionAction =
          'Immediate Counter-Action: Drop phone immediately, perform 30 pushups, splash cold water on face, and begin a 45-min clinical theory reading block.';
      } finally {
        setIsGeneratingRedemption(false);
      }
    }

    onAddUrgeLog({
      triggerType,
      intensity,
      wasSlip,
      penaltyXp: Math.abs(penalty),
      context: context || (wasSlip ? 'Slip breach recorded' : 'Resisted urge successfully'),
      redemptionAction,
      redemptionCompleted: !wasSlip
    });

    const displayCategory =
      triggerType === 'SEXUAL_URGE' || triggerType === 'MASTURBATION'
        ? 'sexual urge(-500exp)'
        : triggerType;

    if (wasSlip) {
      onDeductXP(Math.abs(penalty), `Disciplinary breach: ${displayCategory}`);
    } else {
      onAwardXP(50, `Urge resisted (+50 XP): ${displayCategory}`);
    }

    setContext('');
  };

  const handleSaveJournal = () => {
    onUpdateMindLog({
      ...mindLog,
      gratitude: journalGratitude,
      regrets: journalRegrets,
      notableEvents: journalEvents,
      tomorrowIntentions: journalIntentions
    });
    onAwardXP(40, 'Completed evening gratitude & stoic reflection journal');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Daily Total Screen Time state (minutes)
  const [dailyScreenMinutes, setDailyScreenMinutes] = useState<number>(
    screenTime.totalScreenTimeMinutes || 115
  );

  // YouTube Limit Breach days (> 30 min limit)
  const [youtubeBreachDays, setYoutubeBreachDays] = useState<
    Array<{ id: string; date: string; youtubeMinutes: number; reason: string }>
  >([
    {
      id: 'ytb-1',
      date: '2026-10-17',
      youtubeMinutes: 48,
      reason: 'Watched surgical laparoscopic hernia repair video case study'
    },
    {
      id: 'ytb-2',
      date: '2026-10-12',
      youtubeMinutes: 45,
      reason: 'Biochemistry high-yield pathway walkthrough'
    }
  ]);
  const [showLogBreachForm, setShowLogBreachForm] = useState(false);
  const [newBreachDate, setNewBreachDate] = useState(todayStr);
  const [newBreachMinutes, setNewBreachMinutes] = useState(45);
  const [newBreachReason, setNewBreachReason] = useState('');

  // Complete Rewards Master Catalog state
  const [allRewardsPool, setAllRewardsPool] = useState<RewardItem[]>(() =>
    storage.getAllRewardsPool()
  );
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(300);
  const [newRewardCategory, setNewRewardCategory] = useState<RewardItem['category']>('LEISURE');
  const [rewardActionMsg, setRewardActionMsg] = useState<string | null>(null);

  // Mock History for Screentime & Meditation Line Graphs (Week / Month / Year)
  const generateHistory = (count: number, baseMinutes: number, variance: number) => {
    const list = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const val = Math.max(0, Math.round(baseMinutes + Math.sin(i * 1.5) * variance));
      list.push({
        date: d.toISOString().split('T')[0],
        dateLabel: formatDateWithDay(d.toISOString().split('T')[0], true),
        minutes: val
      });
    }
    return list;
  };

  const screenCount = screenRange === 'week' ? 7 : screenRange === 'month' ? 30 : 60;
  const screenChartData = generateHistory(screenCount, 120, 45);

  const medCount = meditationRange === 'week' ? 7 : meditationRange === 'month' ? 30 : 60;
  const medChartData = generateHistory(medCount, 15, 6);

  // 14-day Calendar streak tracker data:
  // green: clean
  // yellow: exceeded screentime (4hrs / 240 mins)
  // red: acted on sexual urge
  const calendarDays = [];
  const curr = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(curr);
    d.setDate(curr.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayUrges = urgeLogs.filter((u) => u.timestamp.startsWith(dateStr));
    const sexualSlip = dayUrges.find(
      (u) =>
        u.wasSlip &&
        (u.triggerType === 'SEXUAL_URGE' ||
          u.triggerType === 'MASTURBATION' ||
          (URGE_SLIP_PENALTIES[u.triggerType] || 0) <= -500)
    );

    // Baseline screen time: 4 hours is 240 mins
    const dayScreenMinutes =
      dateStr === todayStr
        ? dailyScreenMinutes
        : i === 4
        ? 265
        : i === 9
        ? 280
        : 110 + ((i * 19) % 70);
    const exceededScreenTime = dayScreenMinutes > 240;

    let status: 'green' | 'yellow' | 'red' = 'green';
    let statusLabel = 'Clean · Dopamine & Screentime Compliant';
    if (sexualSlip) {
      status = 'red';
      statusLabel = 'Acted on Sexual Urge (-500 XP)';
    } else if (exceededScreenTime) {
      status = 'yellow';
      statusLabel = `Exceeded Screentime: ${dayScreenMinutes}m (> 4 hrs)`;
    }

    calendarDays.push({
      dateStr,
      status,
      statusLabel,
      dayUrges,
      dayScreenMinutes,
      sexualSlip,
      exceededScreenTime
    });
  }

  const selectedCalendarData =
    calendarDays.find((cd) => cd.dateStr === selectedCalendarDate) ||
    calendarDays[calendarDays.length - 1];

  const handleSaveScreenTime = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateScreenTime({
      ...screenTime,
      totalScreenTimeMinutes: dailyScreenMinutes,
      isOverLimit: dailyScreenMinutes > 240
    });
    if (dailyScreenMinutes > 240) {
      onDeductXP(50, `ScreenZen: Exceeded 4-hour daily screen time limit (${dailyScreenMinutes} mins)`);
    } else {
      onAwardXP(30, `ScreenZen: Logged daily screen time (${dailyScreenMinutes} mins, within 4-hr boundary)`);
    }
  };

  const handleAddYouTubeBreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBreachMinutes <= 30) return;
    const newBreach = {
      id: `ytb-${Date.now()}`,
      date: newBreachDate,
      youtubeMinutes: newBreachMinutes,
      reason: newBreachReason || 'Exceeded 30-min YouTube threshold'
    };
    setYoutubeBreachDays([newBreach, ...youtubeBreachDays]);
    onDeductXP(75, `Exceeded 30-min YouTube limit on ${formatDateDDMMYY(newBreachDate)} (${newBreachMinutes} mins)`);
    setNewBreachReason('');
    setShowLogBreachForm(false);
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;
    const customReward: RewardItem = {
      id: `custom-rew-${Date.now()}`,
      title: newRewardTitle.trim(),
      description: newRewardDescription.trim() || 'Custom residency reward',
      xpCost: newRewardCost,
      category: newRewardCategory,
      icon: 'Award',
      isCustom: true
    };
    storage.addCustomReward(customReward);
    setAllRewardsPool(storage.getAllRewardsPool());
    setNewRewardTitle('');
    setNewRewardDescription('');
    setShowAddRewardModal(false);
    setRewardActionMsg(`Added "${customReward.title}" to Master Rewards Rotation!`);
    setTimeout(() => setRewardActionMsg(null), 3500);
  };

  const handleSaveEditReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    storage.updateReward(editingReward);
    setAllRewardsPool(storage.getAllRewardsPool());
    setRewardActionMsg(`Updated "${editingReward.title}" in Master Catalog!`);
    setEditingReward(null);
    setTimeout(() => setRewardActionMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* 1. Header with Multi-Streaks & Colored Calendar */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-violet-400 font-mono font-bold">
                  Mental Chastity &amp; Dopamine Governance
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Clean Streak: {streakDays}d
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Mental Discipline &amp; Self-Mastery Command
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400 border border-neutral-800 rounded-lg px-2.5 py-1">
              ScreenZen: <strong className="text-teal-400">{screentimeStreak}d Streak</strong>
            </span>
            <span className="text-xs font-mono text-neutral-400 border border-neutral-800 rounded-lg px-2.5 py-1">
              Meditation: <strong className="text-violet-400">{meditationStreak}d Streak</strong>
            </span>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-neutral-400">14-Day Calendar Status (Tap day to inspect):</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Green: Clean
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Yellow: Exceeded Screentime (&gt;4hrs)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
              Red: Acted on Sexual Urge
            </span>
          </div>
        </div>

        {/* 14-Day Calendar Streak Tracker (Dots Only, No "Clean" text) */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          {calendarDays.map((cd) => {
            const d = new Date(cd.dateStr);
            const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
            const dayNum = d.getDate();
            const isSelected = selectedCalendarDate === cd.dateStr;

            let dotClass = 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
            let borderClass = 'border-emerald-500/30 bg-emerald-950/20';
            if (cd.status === 'yellow') {
              dotClass = 'bg-amber-400 shadow-sm shadow-amber-400/50';
              borderClass = 'border-amber-500/40 bg-amber-950/20';
            } else if (cd.status === 'red') {
              dotClass = 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse';
              borderClass = 'border-rose-500/60 bg-rose-950/30';
            }

            return (
              <button
                key={cd.dateStr}
                onClick={() => setSelectedCalendarDate(cd.dateStr)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[58px] transition cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-sky-400 bg-sky-950/40 border-sky-400'
                    : borderClass
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-400">{dayOfWeek}</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5">{dayNum}</span>
                <div className="mt-1 flex items-center justify-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Expandable Day Details on Click */}
        {selectedCalendarData && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 mt-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-800 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
                  Day Inspector &amp; Discipline Audit
                </span>
                <h4 className="text-sm font-bold text-white">
                  {formatDateWithDay(selectedCalendarData.dateStr)}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                {selectedCalendarData.status === 'green' && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Clean Day · Full Dopamine Discipline
                  </span>
                )}
                {selectedCalendarData.status === 'yellow' && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Exceeded Screen Time ({selectedCalendarData.dayScreenMinutes}m &gt; 4 hrs)
                  </span>
                )}
                {selectedCalendarData.status === 'red' && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Breach: Acted on Sexual Urge (-500 XP)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                  Screentime Status
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Total Recorded:</span>
                  <span className={`font-mono font-bold ${selectedCalendarData.dayScreenMinutes > 240 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedCalendarData.dayScreenMinutes} min ({parseFloat((selectedCalendarData.dayScreenMinutes / 60).toFixed(1))} hrs)
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Target threshold: ≤ 240 min (4 hrs daily)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                  Urges &amp; Dopamine Events
                </span>
                {selectedCalendarData.dayUrges.length === 0 ? (
                  <p className="text-emerald-400 text-[11px] font-mono">No slips or triggers recorded. Mind remained uncompromised.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedCalendarData.dayUrges.map((u) => (
                      <div key={u.id} className="text-[11px] text-neutral-300 flex items-center justify-between">
                        <span className="truncate">{u.context || u.triggerType}</span>
                        <span className={`font-mono ${u.wasSlip ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                          {u.wasSlip ? `Slip (-${u.penaltyXp} XP)` : 'Resisted (+50 XP)'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Urge Ledger & Immediate Dopamine Accountability */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Urge Ledger &amp; Immediate Accountability
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Resist: +50 XP · Slip: Penalty
          </span>
        </div>

        <form onSubmit={handleUrgeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Trigger Category
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as UrgeTriggerType)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500 font-sans"
              >
                <option value="SEXUAL_URGE">sexual urge(-500exp)</option>
                <option value="DOOMSCROLLING">Doomscrolling (-300 XP)</option>
                <option value="DISTRACTION_TEXTING">Distraction / Texting (-50 XP)</option>
                <option value="BOREDOM">Boredom (-50 XP)</option>
                <option value="EMOTIONAL">Emotional Fatigue (-50 XP)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Intensity Rating: <strong className="text-white">{intensity}/5</strong>
              </label>
              <div className="flex gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      intensity === lvl
                        ? 'bg-rose-600 text-white border-rose-500 font-bold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Outcome Log
              </label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setWasSlip(false)}
                  className={`py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer border ${
                    !wasSlip
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  Resisted (+50 XP)
                </button>
                <button
                  type="button"
                  onClick={() => setWasSlip(true)}
                  className={`py-1.5 rounded-xl text-xs font-semibold font-mono transition cursor-pointer border ${
                    wasSlip
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  Slip Breach
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Context / Vulnerability Trigger Notes
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Late night study exhaustion. Stopped and took 10 deep breaths."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-neutral-400">
              {wasSlip
                ? `Breach deducts ${Math.abs(URGE_SLIP_PENALTIES[triggerType] || 500)} XP and generates counter-action.`
                : 'Resisting reinforces prefrontal dopamine pathways (+50 XP).'}
            </span>

            <button
              type="submit"
              disabled={isGeneratingRedemption}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer ${
                wasSlip ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isGeneratingRedemption ? 'Generating Counter-Action...' : 'Record In Ledger'}
            </button>
          </div>
        </form>
      </section>

      {/* 3. ScreenZen Daily Screen Time (Track total screentime only, not YouTube) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                ScreenZen Daily Screen Time
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target quota: &le; 240 min (4 hrs daily) · Streak: <strong className="text-teal-300">{screentimeStreak}d within limits</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-0.5">
            {(['week', 'month', 'year'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setScreenRange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                  screenRange === r ? 'bg-teal-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Total Screentime Log Input */}
        <form onSubmit={handleSaveScreenTime} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-neutral-400">Today's Total Screen Time:</label>
            <input
              type="number"
              min="0"
              max="1440"
              value={dailyScreenMinutes}
              onChange={(e) => setDailyScreenMinutes(Number(e.target.value))}
              className={`w-24 bg-neutral-900 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none ${
                dailyScreenMinutes > 240 ? 'border-amber-500 text-amber-400' : 'border-neutral-800 text-teal-400'
              }`}
            />
            <span className="text-xs font-mono text-neutral-400">min ({parseFloat((dailyScreenMinutes / 60).toFixed(1))} hrs)</span>
          </div>

          <div className="flex items-center gap-2">
            {dailyScreenMinutes > 240 ? (
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Exceeded 4hr limit (-50 XP)
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Disciplined (&le;4 hrs)
              </span>
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Update Screentime
            </button>
          </div>
        </form>

        {/* Screentime Line Graph with 240m Limit Threshold */}
        <div className="w-full h-44 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={screenChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" unit="m" />
              <ReferenceLine y={240} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '4h Limit (240m)', fill: '#F59E0B', fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(val: any) => [`${val} min`, 'Total Screen Time']}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#14B8A6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#14B8A6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Dedicated Separate Section: Days Exceeded YouTube 30-min Limit */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                YouTube Limit Breach Log (Days &gt; 30-Min Threshold)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Separate disciplinary ledger for days YouTube exceeded the strict 30-minute daily ceiling
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogBreachForm(!showLogBreachForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showLogBreachForm ? 'Close Form' : 'Log YouTube Breach'}</span>
          </button>
        </div>

        {/* Breach Logger Form */}
        {showLogBreachForm && (
          <form onSubmit={handleAddYouTubeBreach} className="p-3.5 bg-neutral-950 border border-rose-500/30 rounded-xl space-y-3 animate-in fade-in">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
              Record YouTube Limit Overrun
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">Breach Date</label>
                <input
                  type="date"
                  value={newBreachDate}
                  onChange={(e) => setNewBreachDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">Total YouTube Minutes (Limit: 30m)</label>
                <input
                  type="number"
                  min="31"
                  max="600"
                  value={newBreachMinutes}
                  onChange={(e) => setNewBreachMinutes(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-rose-500/50 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">Reason / Context</label>
                <input
                  type="text"
                  placeholder="e.g. Watched podcast or medical animation clips"
                  value={newBreachReason}
                  onChange={(e) => setNewBreachReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-rose-400">
                Logging a YouTube breach deducts <strong className="text-rose-300">-75 XP</strong> from Dopamine Reserve.
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Record Breach
              </button>
            </div>
          </form>
        )}

        {/* Breach Days Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {youtubeBreachDays.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {formatDateDDMMYY(b.date)}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 font-bold">
                    +{b.youtubeMinutes - 30}m Over Limit
                  </span>
                </div>
                <div className="mt-1 text-xs text-white font-medium">
                  Total YouTube: <strong className="text-rose-300">{b.youtubeMinutes} mins</strong>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  {b.reason}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-rose-900/40 text-[10px] font-mono text-rose-400 flex items-center justify-between">
                <span>Accountability: -75 XP</span>
                <span className="text-neutral-500">Recorded</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Stoic Meditation & Line Graph (Expandable: Week / Month / Year) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                Stoic Meditation &amp; Autonomic Equilibrium
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Breathing reset to prevent clinical burnout · Streak: <strong className="text-violet-300">{meditationStreak}d</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-0.5">
            {(['week', 'month', 'year'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setMeditationRange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                  meditationRange === r ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Meditation Minutes Input (Timer Removed per request) */}
        <form onSubmit={handleLogTypedMeditation} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-neutral-400">Duration:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="240"
                value={typedMeditationMinutes}
                onChange={(e) => setTypedMeditationMinutes(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-20 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-violet-300 font-mono font-bold outline-none focus:border-violet-500 text-center"
              />
              <span className="text-xs font-mono text-neutral-400">minutes</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {[10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTypedMeditationMinutes(mins)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer border ${
                    typedMeditationMinutes === mins
                      ? 'bg-violet-600 text-white border-violet-500 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Log Meditation (+{Math.max(20, Math.floor(typedMeditationMinutes / 5) * 50)} XP)</span>
          </button>
        </form>

        {/* Meditation Line Graph */}
        <div className="w-full h-44 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={medChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" unit="m" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(val: any) => [`${val} min`, 'Meditation']}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#A855F7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#A855F7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. Separate Gratitude & Evening Review Section */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Dedicated Evening Gratitude &amp; Reflection Sanctuary
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">+40 XP</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Gratitude (What grounded you today)
            </label>
            <input
              type="text"
              value={journalGratitude}
              onChange={(e) => setJournalGratitude(e.target.value)}
              placeholder="e.g. Grateful for clean physical findings in OPD; supportive registrar."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Regrets / Friction (Where discipline wavered)
            </label>
            <input
              type="text"
              value={journalRegrets}
              onChange={(e) => setJournalRegrets(e.target.value)}
              placeholder="e.g. Delayed opening the 40-MCQ module by 15 mins."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveJournal}
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              Save Evening Reflection
            </button>
          </div>
        </div>

        {/* Small List of Gratitudes and Regrets from Last Week */}
        <div className="pt-3 border-t border-neutral-800/80 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold block">
            Archived Reflections from Last Week:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Gratitudes list */}
            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                <span>Last Week's Gratitudes</span>
              </span>
              <div className="space-y-1.5">
                {lastWeekReviews.gratitudes.map((item, idx) => (
                  <div key={idx} className="text-xs text-neutral-300 font-sans flex items-start gap-2">
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0 mt-0.5">{item.date}</span>
                    <p className="leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regrets list */}
            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Frown className="w-3.5 h-3.5" />
                <span>Last Week's Regrets &amp; Friction</span>
              </span>
              <div className="space-y-1.5">
                {lastWeekReviews.regrets.map((item, idx) => (
                  <div key={idx} className="text-xs text-neutral-300 font-sans flex items-start gap-2">
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0 mt-0.5">{item.date}</span>
                    <p className="leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Complete Rewards Master Catalog (16 Total in Rotation) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Complete Rewards Master Catalog ({allRewardsPool.length} Total in Rotation)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage all rewards in rotation. 8 randomized items selected daily.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddRewardModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reward to Rotation</span>
            </button>
          </div>
        </div>

        {rewardActionMsg && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono animate-in fade-in">
            {rewardActionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {allRewardsPool.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-black/60 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {item.xpCost} XP
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white mt-2 tracking-tight">
                  {item.title}
                </h5>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Rotation Pool</span>
                </span>
                <button
                  onClick={() => setEditingReward(item)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 font-semibold transition cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Custom Reward Modal */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">
                Add Reward to Master Rotation
              </h3>
              <button
                onClick={() => setShowAddRewardModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={newRewardTitle}
                  onChange={(e) => setNewRewardTitle(e.target.value)}
                  placeholder="e.g. 1hr Deep Sci-Fi Book Reading"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">XP Cost</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                  <select
                    value={newRewardCategory}
                    onChange={(e) => setNewRewardCategory(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LEISURE">Leisure</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="STUDY">Study Fuel</option>
                    <option value="EXPERIENCE">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newRewardDescription}
                  onChange={(e) => setNewRewardDescription(e.target.value)}
                  placeholder="What relaxation does this reward grant?"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Add to Master Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">
                Change Reward in Master Catalog
              </h3>
              <button
                onClick={() => setEditingReward(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditReward} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={editingReward.title}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">XP Cost</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={editingReward.xpCost}
                    onChange={(e) => setEditingReward({ ...editingReward, xpCost: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                  <select
                    value={editingReward.category}
                    onChange={(e) => setEditingReward({ ...editingReward, category: e.target.value as any })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LEISURE">Leisure</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="STUDY">Study Fuel</option>
                    <option value="EXPERIENCE">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    storage.deleteReward(editingReward.id);
                    setAllRewardsPool(storage.getAllRewardsPool());
                    setEditingReward(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  Remove Reward
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingReward(null)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
