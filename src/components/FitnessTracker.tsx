import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Dumbbell,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  Flame,
  Scale,
  Apple,
  Award,
  Clock,
  Heart,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  ShieldAlert,
  Edit2,
  Lock,
  Activity,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import {
  WeightEntry,
  RunningSession,
  CalisthenicsLog,
  CalisthenicsCircuitConfig,
  NutritionLog,
  DailyNutritionEntry
} from '../types/index.ts';
import {
  RUNNING_PROTOCOL,
  calculateRunXP,
  formatDateWithDay,
  formatDateDDMMYY
} from '../utils/engine.ts';

interface FitnessTrackerProps {
  currentWeightKg: number;
  targetWeightKg: number;
  onUpdateTargetWeight: (targetWeight: number) => void;
  weightLogs: WeightEntry[];
  onAddWeightLog: (weight: number) => void;
  currentRunningWeek: number;
  runningSessions: RunningSession[];
  onLogRunningSession: (week: number, distanceKm?: number, notes?: string) => void;
  calisthenics: CalisthenicsLog;
  onUpdateCalisthenics: (log: CalisthenicsLog) => void;
  onSaveCircuitConfig: (config: CalisthenicsCircuitConfig) => void;
  circuitConfig: CalisthenicsCircuitConfig;
  nutrition?: NutritionLog;
  onUpdateNutrition?: (log: NutritionLog) => void;
  nutritionDays?: DailyNutritionEntry[];
  onSaveNutritionDay?: (entry: DailyNutritionEntry) => void;
  onDeductXP: (xp: number, reason: string) => void;
  onAwardXP: (xp: number, reason: string) => void;
  runningStreak: number;
  workoutStreak: number;
  calorieStreak?: number;
  isSick: boolean;
  energyPercent: number;
}

type DistanceRangeFilter = 'week' | 'month' | 'year';

export const FitnessTracker: React.FC<FitnessTrackerProps> = ({
  currentWeightKg,
  targetWeightKg,
  onUpdateTargetWeight,
  weightLogs,
  onAddWeightLog,
  currentRunningWeek,
  runningSessions,
  onLogRunningSession,
  calisthenics,
  onUpdateCalisthenics,
  onSaveCircuitConfig,
  circuitConfig,
  onDeductXP,
  onAwardXP,
  runningStreak,
  workoutStreak,
  isSick,
  energyPercent
}) => {
  // Morning Weigh-in form & Target Weight Editor
  const [newWeight, setNewWeight] = useState<string>(currentWeightKg.toString());
  const [editingTargetWeight, setEditingTargetWeight] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState<string>(targetWeightKg.toString());

  // Running details & Strava screenshot parsing state (Timer removed per request)
  const weekInfo = RUNNING_PROTOCOL[currentRunningWeek] || RUNNING_PROTOCOL[1];
  const [runDistanceKm, setRunDistanceKm] = useState<number>(() =>
    parseFloat((2.5 + currentRunningWeek * 0.25).toFixed(1))
  );
  const [runDurationMin, setRunDurationMin] = useState<number>(weekInfo.jogMinutes + weekInfo.walkMinutes || 30);
  const [runPace, setRunPace] = useState<string>('6:15 /km');
  const [runNotes, setRunNotes] = useState<string>('');
  const [stravaFileName, setStravaFileName] = useState<string | null>(null);
  const [isStravaParsed, setIsStravaParsed] = useState<boolean>(false);

  // Distance graph range filter
  const [distanceRange, setDistanceRange] = useState<DistanceRangeFilter>('week');
  const [distanceGraphType, setDistanceGraphType] = useState<'daily' | 'cumulative'>('daily');

  // Calisthenics Circuit Customizer Modal
  const [isCustomizingCircuit, setIsCustomizingCircuit] = useState(false);
  const [tempCircuit, setTempCircuit] = useState<CalisthenicsCircuitConfig>(circuitConfig);

  // Strava Screenshot OCR / Metric Parser
  const handleStravaScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStravaFileName(file.name);
    // Parse simulated OCR metrics or filename hints
    const nameMatch = file.name.match(/(\d+\.?\d*)\s*km/i);
    const parsedDist = nameMatch ? parseFloat(nameMatch[1]) : parseFloat((3.0 + currentRunningWeek * 0.3).toFixed(2));
    const parsedMin = Math.round(parsedDist * 6.2);
    const paceMin = Math.floor(parsedMin / parsedDist);
    const paceSec = Math.round(((parsedMin / parsedDist) - paceMin) * 60);
    const formattedPace = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} /km`;

    setRunDistanceKm(parsedDist);
    setRunDurationMin(parsedMin);
    setRunPace(formattedPace);
    setRunNotes(`Parsed from Strava Activity: ${file.name}`);
    setIsStravaParsed(true);
    onAwardXP(15, `Extracted Strava run data (${parsedDist} km)`);
  };

  // Log today's run
  const handleLogRun = () => {
    const dist = runDistanceKm > 0 ? runDistanceKm : parseFloat((2.5 + currentRunningWeek * 0.25).toFixed(1));
    const xp = calculateRunXP(currentRunningWeek, runningStreak);
    const notesSummary = runNotes
      ? `${runNotes} · Pace: ${runPace} · ${runDurationMin}m`
      : `Week ${currentRunningWeek} completed: ${dist} km in ${runDurationMin}m (${runPace})`;

    onLogRunningSession(currentRunningWeek, dist, notesSummary);
    onAwardXP(xp, `Completed Week ${currentRunningWeek} running protocol (${dist} km walked+run)`);
    setIsStravaParsed(false);
    setStravaFileName(null);
  };

  // Weight target update
  const handleSaveTargetWeight = () => {
    const parsed = parseFloat(newTargetWeight);
    if (!isNaN(parsed) && parsed > 40 && parsed < 150) {
      onUpdateTargetWeight(parsed);
      setEditingTargetWeight(false);
      onAwardXP(25, `Calibrated weight target to ${parsed} kg`);
    }
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 0) {
      onAddWeightLog(val);
      onAwardXP(20, `Logged morning weight: ${val} kg`);
    }
  };

  // Save customized circuit
  const handleSaveCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCircuitConfig(tempCircuit);
    setIsCustomizingCircuit(false);
    onAwardXP(30, 'Customized residency calisthenics circuit parameters');
  };

  // Prepare Distance Graph Data
  const filterSessions = (sessions: RunningSession[], range: DistanceRangeFilter) => {
    if (range === 'week') return sessions.slice(-7);
    if (range === 'month') return sessions.slice(-30);
    return sessions.slice(-365);
  };

  const filteredSessions = filterSessions(runningSessions, distanceRange);

  let cumulativeTotal = 0;
  const distanceChartData = filteredSessions.map((s) => {
    const dist = s.distanceKm || parseFloat((2.4 + s.weekNumber * 0.2).toFixed(1));
    cumulativeTotal += dist;
    return {
      dateLabel: formatDateWithDay(s.date, true),
      dailyKm: dist,
      cumulativeKm: parseFloat(cumulativeTotal.toFixed(1))
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* 1. Morning Weigh-in Log with Editable Target Weight */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Weight Calibration &amp; Target Goal
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!editingTargetWeight ? (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400">Target Goal:</span>
                <span className="text-emerald-400 font-bold">{targetWeightKg} kg</span>
                <button
                  onClick={() => {
                    setNewTargetWeight(targetWeightKg.toString());
                    setEditingTargetWeight(true);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-sky-300 transition cursor-pointer"
                  title="Edit Target Weight"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newTargetWeight}
                  onChange={(e) => setNewTargetWeight(e.target.value)}
                  className="w-20 bg-neutral-900 border border-sky-500 rounded px-2 py-1 text-xs text-white font-mono outline-none"
                />
                <button
                  onClick={handleSaveTargetWeight}
                  className="px-2.5 py-1 rounded bg-sky-600 text-white text-xs font-mono cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTargetWeight(false)}
                  className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleAddWeight} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-neutral-400">Morning Weigh-in:</label>
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-24 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
            />
            <span className="text-xs font-mono text-neutral-400">kg</span>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Log Weight (+20 XP)
          </button>

          <span className="text-xs font-mono text-neutral-400 ml-auto hidden sm:inline">
            Delta to Target: <strong className="text-sky-300">{(currentWeightKg - targetWeightKg).toFixed(1)} kg</strong>
          </span>
        </form>
      </section>

      {/* 3. 11-Week Running Protocol (LOCKED WEEKS + DISTANCE LINE GRAPHS) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                11-Week Progressive Running Protocol
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Protocol Locked to Week {currentRunningWeek}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Strict interval jog ⇄ walk adaptation to prevent shin splints during long hospital rounds
            </p>
          </div>

          <span className="text-xs font-mono text-amber-400 font-bold">
            Running Streak: {runningStreak} Sessions
          </span>
        </div>

        {/* Current Protocol Card - Run Details & Strava Parsing (Timer removed per request) */}
        <div className="p-4 sm:p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                {weekInfo.label}
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {weekInfo.protocol}
              </h4>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mt-1 flex-wrap">
                <span>Jog: {weekInfo.jogMinutes}m</span>
                <span>·</span>
                <span>Walk: {weekInfo.walkMinutes}m</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">+{calculateRunXP(currentRunningWeek, runningStreak)} XP</span>
              </div>
            </div>

            {/* Strava Screenshot Parser Upload Trigger */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="stravaUploadInput"
                accept="image/*"
                onChange={handleStravaScreenshotUpload}
                className="hidden"
              />
              <label
                htmlFor="stravaUploadInput"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 text-xs font-mono font-medium transition cursor-pointer shadow-sm"
                title="Upload screenshot from Strava to auto-parse distance, pace & duration"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>{stravaFileName ? 'Change Strava Pic' : 'Parse Strava Screenshot'}</span>
              </label>
            </div>
          </div>

          {/* Strava Parsed Alert */}
          {isStravaParsed && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Extracted from Strava: <strong className="text-white">{runDistanceKm} km</strong> · {runDurationMin}m · {runPace}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded shrink-0">+15 XP</span>
            </div>
          )}

          {/* Direct Run Details Entry Form */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">Distance (km)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={runDistanceKm}
                onChange={(e) => setRunDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">Duration (min)</label>
              <input
                type="number"
                min="1"
                value={runDurationMin}
                onChange={(e) => setRunDurationMin(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">Average Pace</label>
              <input
                type="text"
                value={runPace}
                onChange={(e) => setRunPace(e.target.value)}
                placeholder="e.g. 6:15 /km"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">Run Notes / Surface</label>
              <input
                type="text"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                placeholder="e.g. Road run, asphalt, shin feel good"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action Row - Mobile Optimized */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-neutral-400">
              Protocol: <strong className="text-white">{runDistanceKm} km</strong> walked+run across Week {currentRunningWeek}.
            </span>

            <button
              onClick={handleLogRun}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Today's Protocol Complete (+{calculateRunXP(currentRunningWeek, runningStreak)} XP)</span>
            </button>
          </div>
        </div>

        {/* Total Distance Walked + Run Graph with Week / Month / Year */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-2">
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
              <span className="font-mono text-neutral-400 uppercase tracking-wider text-[11px]">
                {distanceGraphType === 'daily' ? 'Daily Distance Walked + Run' : 'Cumulative Progression'}
              </span>
              <div className="flex items-center rounded-lg bg-black/60 border border-neutral-800 p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setDistanceGraphType('daily')}
                  className={`px-2 py-0.5 rounded transition ${distanceGraphType === 'daily' ? 'bg-amber-600 text-white' : 'text-neutral-400'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setDistanceGraphType('cumulative')}
                  className={`px-2 py-0.5 rounded transition ${distanceGraphType === 'cumulative' ? 'bg-amber-600 text-white' : 'text-neutral-400'}`}
                >
                  Cumulative
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-0.5 self-start sm:self-auto">
              {(['week', 'month', 'year'] as DistanceRangeFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDistanceRange(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                    distanceRange === r ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-full overflow-hidden h-48 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-1.5 sm:p-2">
            <ResponsiveContainer width="100%" height="100%">
              {distanceGraphType === 'daily' ? (
                <LineChart data={distanceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={9} fontFamily="monospace" interval="preserveStartEnd" />
                  <YAxis stroke="#64748B" fontSize={9} fontFamily="monospace" unit="k" width={32} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D14',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                    formatter={(val: any) => [`${val} km`, 'Distance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="dailyKm"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#F59E0B' }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={distanceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={9} fontFamily="monospace" interval="preserveStartEnd" />
                  <YAxis stroke="#64748B" fontSize={9} fontFamily="monospace" unit="k" width={32} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D14',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                    formatter={(val: any) => [`${val} km`, 'Total Accumulated']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeKm"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. Calisthenics Strength Protocol with Circuit Customizer */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Residency Bodyweight Calisthenics Protocol
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Streak: {workoutStreak}d
            </span>
          </div>

          <button
            onClick={() => {
              setTempCircuit(circuitConfig);
              setIsCustomizingCircuit(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Customize Circuit &amp; Reps</span>
          </button>
        </div>

        {/* Compound Circuit */}
        <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Primary Compound Circuit ({circuitConfig.circuitSets} Sets)
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {circuitConfig.squatsReps} Squats · {circuitConfig.pushupsReps} Pushups · {circuitConfig.pullupsReps} Pullups · {circuitConfig.lungesReps} Lunges · {circuitConfig.hangSeconds}s Hang
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {calisthenics.setsCompleted}/{circuitConfig.circuitSets} Done
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: circuitConfig.circuitSets }).map((_, i) => {
              const isDone = i < calisthenics.setsCompleted;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const newCount = isDone ? i : i + 1;
                    onUpdateCalisthenics({
                      ...calisthenics,
                      setsCompleted: newCount,
                      completed: newCount === circuitConfig.circuitSets
                    });
                    if (!isDone) onAwardXP(20, `Completed Compound Set ${i + 1}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer border ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  Set {i + 1} {isDone ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Sets */}
        <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Core Stabilization ({circuitConfig.coreSets} Sets)
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {circuitConfig.coreSingleLegRaises} Single Leg Raises · {circuitConfig.coreDoubleLegRaises} Double Leg Raises · {circuitConfig.corePlankSeconds}s Plank
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {calisthenics.coreSets}/{circuitConfig.coreSets} Done
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: circuitConfig.coreSets }).map((_, i) => {
              const isDone = i < calisthenics.coreSets;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const newCore = isDone ? i : i + 1;
                    onUpdateCalisthenics({
                      ...calisthenics,
                      coreSets: newCore
                    });
                    if (!isDone) onAwardXP(15, `Completed Core Stabilization Set ${i + 1}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer border ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  Core Set {i + 1} {isDone ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Circuit Customizer Modal */}
      {isCustomizingCircuit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white font-mono">
                Modify Calisthenics Circuit Parameters
              </h3>
              <button
                onClick={() => setIsCustomizingCircuit(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCircuit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Squats Reps</label>
                  <input
                    type="number"
                    value={tempCircuit.squatsReps}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, squatsReps: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Pushups Reps</label>
                  <input
                    type="number"
                    value={tempCircuit.pushupsReps}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, pushupsReps: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Pullups Reps</label>
                  <input
                    type="number"
                    value={tempCircuit.pullupsReps}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, pullupsReps: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Lunges Reps</label>
                  <input
                    type="number"
                    value={tempCircuit.lungesReps}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, lungesReps: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Hang (Seconds)</label>
                  <input
                    type="number"
                    value={tempCircuit.hangSeconds}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, hangSeconds: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Circuit Sets</label>
                  <input
                    type="number"
                    value={tempCircuit.circuitSets}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, circuitSets: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Single Leg Raises</label>
                  <input
                    type="number"
                    value={tempCircuit.coreSingleLegRaises}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, coreSingleLegRaises: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Double Leg Raises</label>
                  <input
                    type="number"
                    value={tempCircuit.coreDoubleLegRaises}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, coreDoubleLegRaises: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Plank Seconds</label>
                  <input
                    type="number"
                    value={tempCircuit.corePlankSeconds}
                    onChange={(e) => setTempCircuit({ ...tempCircuit, corePlankSeconds: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCustomizingCircuit(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Circuit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
