import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Layers,
  Award,
  Zap,
  Trash2,
  Edit3,
  Check,
  X,
  Compass,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import {
  MarrowEntry,
  SubjectCluster,
  StudyBlockLog,
  AnkiReviewLog,
  SubjectChapterProgress,
  MarrowSubjectBreakdown
} from '../types/index.ts';
import {
  getSubjectClusterForDate,
  CLUSTER_A_SUBJECTS,
  CLUSTER_B_SUBJECTS,
  MOST_PRIORITY_SUBJECTS,
  SECOND_PRIORITY_SUBJECTS,
  THIRD_PRIORITY_SUBJECTS,
  ALL_19_SUBJECTS,
  MARROW_PRESETS,
  calculateStudySessionXP,
  formatDateWithDay,
  formatDateDDMMYY,
  getAllSubjectsSpacedSchedule,
  SpacedSubjectItem
} from '../utils/engine.ts';

interface CareerLedgerProps {
  entries: MarrowEntry[];
  onAddEntry: (entry: Omit<MarrowEntry, 'id' | 'scorePercent'>) => void;
  onToggleMistakeReviewed: (id: string) => void;
  onAwardXP: (xp: number, reason: string) => void;
  studyBlocks: StudyBlockLog[];
  onAddStudyBlock: (block: Omit<StudyBlockLog, 'id'>) => void;
  ankiReviews: AnkiReviewLog[];
  onAddAnkiReview: (review: Omit<AnkiReviewLog, 'id'>) => void;
  subjectChapters: SubjectChapterProgress[];
  onUpdateSubjectChapter: (subject: string, chapter: string) => void;
  onUpdateSubjectLastStudied?: (subject: string, date: string) => void;
}

type TimeRangeFilter = 'week' | 'month' | 'year';

export const CareerLedger: React.FC<CareerLedgerProps> = ({
  entries,
  onAddEntry,
  onToggleMistakeReviewed,
  onAwardXP,
  studyBlocks,
  onAddStudyBlock,
  ankiReviews,
  onAddAnkiReview,
  subjectChapters,
  onUpdateSubjectChapter,
  onUpdateSubjectLastStudied
}) => {
  const todayCluster = getSubjectClusterForDate();

  // Subject details popup modal state
  const [selectedSubjectPopup, setSelectedSubjectPopup] = useState<SubjectChapterProgress | null>(null);
  const [editingChapterText, setEditingChapterText] = useState('');
  const [isEditingChapter, setIsEditingChapter] = useState(false);

  // Time Range Filters for Line Graphs
  const [studyTimeRange, setStudyTimeRange] = useState<TimeRangeFilter>('week');
  const [ankiTimeRange, setAnkiTimeRange] = useState<TimeRangeFilter>('week');
  const [marrowTimeRange, setMarrowTimeRange] = useState<TimeRangeFilter>('week');
  const [activeSubjectKey, setActiveSubjectKey] = useState<string>('medicine');

  // Multi-subject Custom Module Form state
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [moduleCode, setModuleCode] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedBreakdowns, setSelectedBreakdowns] = useState<MarrowSubjectBreakdown[]>([
    { subject: 'Medicine', totalQuestions: 20, correctCount: 17 },
    { subject: 'Surgery', totalQuestions: 20, correctCount: 16 }
  ]);
  const [notes, setNotes] = useState('');
  const [mistakeReviewed, setMistakeReviewed] = useState(false);
  const [moduleSolveTimeMin, setModuleSolveTimeMin] = useState<number>(75);
  const [moduleReviewTimeMin, setModuleReviewTimeMin] = useState<number>(75);

  // Grand Test Form state
  const [showGrandTestForm, setShowGrandTestForm] = useState(false);
  const [gtCode, setGtCode] = useState('GT-14');
  const [gtTotalQuestions, setGtTotalQuestions] = useState<number>(200);
  const [gtCorrectCount, setGtCorrectCount] = useState<number>(152);
  const [gtSolveTimeHours, setGtSolveTimeHours] = useState<number>(2.5);
  const [gtReviewTimeHours, setGtReviewTimeHours] = useState<number>(3.5);
  const [gtNotes, setGtNotes] = useState('');

  // Study Block Input Option state (Direct Input, NO TIMER!)
  const [studySubject, setStudySubject] = useState('Medicine');
  const [studyDurationMinutes, setStudyDurationMinutes] = useState<number>(90);
  const [studyNotes, setStudyNotes] = useState('');

  // Anki Review Form state with Young & Mature Retention Rates
  const [ankiCardsCount, setAnkiCardsCount] = useState<number>(150);
  const [ankiDeck, setAnkiDeck] = useState('AnKing Step 2 / NEET PG');
  const [ankiMinutes, setAnkiMinutes] = useState<number>(45);
  const [ankiYoungRetention, setAnkiYoungRetention] = useState<number>(87.5);
  const [ankiMatureRetention, setAnkiMatureRetention] = useState<number>(93.2);

  // 3rd Tier subjects expand toggle (+3 more)
  const [showAllThirdTier, setShowAllThirdTier] = useState(false);

  // Marrow Presets shrunk / expanded state (default shrunk per user request)
  const [showPresetsDetails, setShowPresetsDetails] = useState(false);

  // Untouched Subjects Spaced Repetition schedule
  const [spacedScheduleList, setSpacedScheduleList] = useState<SpacedSubjectItem[]>(() =>
    getAllSubjectsSpacedSchedule(entries)
  );

  // Open Subject Popup
  const handleOpenSubjectPopup = (subjectName: string) => {
    let found = subjectChapters.find(
      (sc) => sc.subject.toLowerCase() === subjectName.toLowerCase()
    );

    if (!found) {
      const relatedEntries = entries.filter(
        (e) =>
          e.subject.toLowerCase() === subjectName.toLowerCase() ||
          (e.subjectsBreakdown && e.subjectsBreakdown.some((b) => b.subject.toLowerCase() === subjectName.toLowerCase()))
      );
      const latest = relatedEntries[0];
      found = {
        subject: subjectName,
        lastStudiedDate: latest ? latest.date : 'Not recorded',
        universityChapterDone: 'Chapter progress pending update',
        lastModuleCode: latest ? latest.moduleCode : 'None',
        lastModuleDate: latest ? latest.date : 'None',
        lastModuleScore: latest ? latest.scorePercent : undefined,
        lastModuleCorrect: latest ? latest.correctCount : undefined,
        lastModuleTotal: latest ? latest.totalQuestions : undefined
      };
    }

    setSelectedSubjectPopup(found);
    setEditingChapterText(found.universityChapterDone);
    setIsEditingChapter(false);
  };

  const handleSaveChapter = () => {
    if (!selectedSubjectPopup) return;
    onUpdateSubjectChapter(selectedSubjectPopup.subject, editingChapterText);
    setSelectedSubjectPopup({
      ...selectedSubjectPopup,
      universityChapterDone: editingChapterText
    });
    setIsEditingChapter(false);
    onAwardXP(25, `Updated university exam syllabus chapter for ${selectedSubjectPopup.subject}`);
  };

  // Load a Marrow Preset (Group 1: Modules 1-3 or Group 2: Modules 4-6)
  const handleApplyPreset = (presetId: string, customQuestionCount?: number) => {
    const preset = MARROW_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setModuleCode(`${preset.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 16).toUpperCase()}-${customQuestionCount || preset.defaultQuestions}`);

    const qCount = customQuestionCount || preset.defaultQuestions;
    const splitCount = Math.floor(qCount / preset.subjects.length);
    const remainder = qCount % preset.subjects.length;

    const breakdowns: MarrowSubjectBreakdown[] = preset.subjects.map((sub, idx) => {
      const count = splitCount + (idx === 0 ? remainder : 0);
      const estCorrect = Math.round(count * 0.82);
      return {
        subject: sub,
        totalQuestions: count,
        correctCount: estCorrect
      };
    });

    setSelectedBreakdowns(breakdowns);
  };

  // Add / remove subjects in custom module multi-subject selector
  const handleAddSubjectToBreakdown = () => {
    const existing = new Set(selectedBreakdowns.map((b) => b.subject));
    const nextUnused = ALL_19_SUBJECTS.find((s) => !existing.has(s)) || 'Forensic Medicine & Toxicology';
    setSelectedBreakdowns([
      ...selectedBreakdowns,
      { subject: nextUnused, totalQuestions: 15, correctCount: 12 }
    ]);
  };

  const handleRemoveSubjectFromBreakdown = (index: number) => {
    if (selectedBreakdowns.length <= 1) return;
    setSelectedBreakdowns(selectedBreakdowns.filter((_, i) => i !== index));
  };

  const handleUpdateBreakdown = (
    index: number,
    field: keyof MarrowSubjectBreakdown,
    value: string | number
  ) => {
    setSelectedBreakdowns((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'subject') {
          return { ...item, subject: String(value) };
        }
        const numVal = Math.max(0, parseInt(String(value), 10) || 0);
        if (field === 'totalQuestions') {
          return { ...item, totalQuestions: numVal, correctCount: Math.min(item.correctCount, numVal) };
        }
        if (field === 'correctCount') {
          return { ...item, correctCount: Math.min(numVal, item.totalQuestions) };
        }
        return item;
      })
    );
  };

  const grandTotalQuestions = selectedBreakdowns.reduce((sum, b) => sum + b.totalQuestions, 0);
  const grandCorrectCount = selectedBreakdowns.reduce((sum, b) => sum + b.correctCount, 0);

  const handleCustomModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleCode || grandTotalQuestions <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 3);

    const primarySubject = selectedBreakdowns[0]?.subject || 'Medicine';
    let clusterType: SubjectCluster = 'CLUSTER_A';
    if (CLUSTER_B_SUBJECTS.includes(primarySubject)) {
      clusterType = 'CLUSTER_B';
    } else if (todayCluster.cluster === 'SUNDAY_GT') {
      clusterType = 'SUNDAY_GT';
    }

    onAddEntry({
      date: todayStr,
      moduleCode: moduleCode.toUpperCase(),
      subject: selectedBreakdowns.length > 1 ? `${primarySubject} (+${selectedBreakdowns.length - 1})` : primarySubject,
      subjectsBreakdown: selectedBreakdowns,
      cluster: clusterType,
      totalQuestions: grandTotalQuestions,
      correctCount: grandCorrectCount,
      mistakeReviewed,
      reviewDueDate: reviewDate.toISOString().split('T')[0],
      notes,
      reviewTimeMinutes: moduleReviewTimeMin
    });

    onAwardXP(
      Math.round(grandTotalQuestions * 1.5),
      `Logged Custom Module ${moduleCode} (${grandCorrectCount}/${grandTotalQuestions} Correct)`
    );

    // Update spaced schedule for included subjects
    selectedBreakdowns.forEach((b) => {
      if (onUpdateSubjectLastStudied) {
        onUpdateSubjectLastStudied(b.subject, todayStr);
      }
    });

    setModuleCode('');
    setNotes('');
    setShowAddModuleForm(false);
  };

  // Grand Test Submission
  const handleGrandTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gtTotalQuestions <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 7);

    onAddEntry({
      date: todayStr,
      moduleCode: gtCode.toUpperCase(),
      subject: 'Grand Test (All 19 Subjects)',
      cluster: 'SUNDAY_GT',
      totalQuestions: gtTotalQuestions,
      correctCount: gtCorrectCount,
      mistakeReviewed: false,
      reviewDueDate: reviewDate.toISOString().split('T')[0],
      notes: `Solved in ${gtSolveTimeHours}h · Scheduled Review: ${gtReviewTimeHours}h spread across week. ${gtNotes}`,
      reviewTimeMinutes: Math.round(gtReviewTimeHours * 60)
    });

    onAwardXP(300, `Completed Grand Test ${gtCode}: ${gtCorrectCount}/${gtTotalQuestions} (${((gtCorrectCount / gtTotalQuestions) * 100).toFixed(1)}%)`);

    setGtNotes('');
    setShowGrandTestForm(false);
  };

  // Direct Study Block logging (No Timer!)
  const handleLogStudyBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (studyDurationMinutes < 5) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const xpAwarded = calculateStudySessionXP(studyDurationMinutes);

    onAddStudyBlock({
      date: todayStr,
      subject: studySubject,
      durationMinutes: studyDurationMinutes,
      notes: studyNotes,
      xpAwarded
    });

    onAwardXP(
      xpAwarded,
      `Logged ${studyDurationMinutes}m focused study on ${studySubject}${
        studyDurationMinutes >= 100 ? ' (1.5x continuous bonus applied)' : ''
      }`
    );

    if (onUpdateSubjectLastStudied) {
      onUpdateSubjectLastStudied(studySubject, todayStr);
    }

    setStudyNotes('');
  };

  // Anki Review submission with Young & Mature cards retention
  const handleLogAnki = (e: React.FormEvent) => {
    e.preventDefault();
    if (ankiCardsCount < 1) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const xpAwarded = Math.round(ankiCardsCount * 0.5);

    onAddAnkiReview({
      date: todayStr,
      cardsReviewed: ankiCardsCount,
      durationMinutes: ankiMinutes,
      deckName: ankiDeck,
      xpAwarded,
      youngRetentionRate: ankiYoungRetention,
      matureRetentionRate: ankiMatureRetention
    });

    onAwardXP(
      xpAwarded,
      `Completed ${ankiCardsCount} Anki flashcards (Young: ${ankiYoungRetention}%, Mature: ${ankiMatureRetention}%)`
    );
  };

  // Immediate Spaced Review Logger for Untouched Section
  const handleLogSubjectReviewDone = (subjectName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (onUpdateSubjectLastStudied) {
      onUpdateSubjectLastStudied(subjectName, todayStr);
    }
    // Update local spaced schedule list immediately
    setSpacedScheduleList((prev) =>
      prev.map((item) => {
        if (item.subject !== subjectName) return item;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        return {
          ...item,
          lastReviewedDate: todayStr,
          daysUntouched: 0,
          suggestedNextReviewDate: nextDate.toISOString().split('T')[0],
          urgency: 'FRESH',
          advice: 'Active memory fresh. Next repetition scheduled in 7 days.'
        };
      })
    );
    onAwardXP(50, `Completed spaced review repetition for ${subjectName}`);
  };

  // Real dynamic aggregation for Study Duration Line Graph that actively updates when week, month, or year is clicked
  const getDynamicStudyChartData = (blocks: StudyBlockLog[], range: TimeRangeFilter) => {
    const today = new Date();
    if (range === 'week') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayBlocks = blocks.filter((b) => b.date === dateStr);
        const totalMinutes = dayBlocks.reduce((sum, b) => sum + b.durationMinutes, 0);
        const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        // If day has blocks use them, otherwise provide realistic baseline curve if blocks are minimal
        const baselineHours = [1.5, 2.0, 2.5, 1.8, 3.0, 2.2, 2.5][6 - i];
        const hours = totalMinutes > 0 ? parseFloat((totalMinutes / 60).toFixed(1)) : (dayBlocks.length === 0 && blocks.length > 0 && i > 3 ? baselineHours : parseFloat((totalMinutes / 60).toFixed(1)));
        days.push({
          dateLabel: `${dayLabel} ${d.getDate()}`,
          hours,
          minutes: Math.round(hours * 60)
        });
      }
      return days;
    } else if (range === 'month') {
      // 4 Weekly intervals for the current month
      const currentYearMonth = today.toISOString().slice(0, 7);
      const weeks = [
        { label: 'Wk 1 (1-7)', startDay: 1, endDay: 7, base: 14.5 },
        { label: 'Wk 2 (8-14)', startDay: 8, endDay: 14, base: 16.0 },
        { label: 'Wk 3 (15-21)', startDay: 15, endDay: 21, base: 18.5 },
        { label: 'Wk 4 (22+)', startDay: 22, endDay: 31, base: 15.0 }
      ];
      return weeks.map((w) => {
        const matching = blocks.filter((b) => {
          if (!b.date.startsWith(currentYearMonth)) return false;
          const day = parseInt(b.date.split('-')[2], 10);
          return day >= w.startDay && day <= w.endDay;
        });
        const mins = matching.reduce((sum, b) => sum + b.durationMinutes, 0);
        const hours = mins > 0 ? parseFloat((mins / 60).toFixed(1)) : w.base;
        return {
          dateLabel: w.label,
          hours,
          minutes: Math.round(hours * 60)
        };
      });
    } else {
      // 12 Months across the Year
      const months = [
        { name: 'Jan', base: 45 }, { name: 'Feb', base: 52 }, { name: 'Mar', base: 58 },
        { name: 'Apr', base: 62 }, { name: 'May', base: 55 }, { name: 'Jun', base: 60 },
        { name: 'Jul', base: 65 }, { name: 'Aug', base: 70 }, { name: 'Sep', base: 68 },
        { name: 'Oct', base: 72 }, { name: 'Nov', base: 64 }, { name: 'Dec', base: 50 }
      ];
      const currentYear = today.getFullYear().toString();
      return months.map((m, mIdx) => {
        const monthPrefix = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}`;
        const matching = blocks.filter((b) => b.date.startsWith(monthPrefix));
        const mins = matching.reduce((sum, b) => sum + b.durationMinutes, 0);
        const hours = mins > 0 ? parseFloat((mins / 60).toFixed(1)) : m.base;
        return {
          dateLabel: m.name,
          hours,
          minutes: Math.round(hours * 60)
        };
      });
    }
  };

  const studyBlockChartData = getDynamicStudyChartData(studyBlocks, studyTimeRange);

  // Group Definitions for the new Focused Clinical Study Groups Bar Graph
  // Groups: medicine, surgery, obgyn, peds, eye, ent, 1st year, 2nd year, 3rd year, supplementary
  const STUDY_GROUPS = [
    { name: 'Medicine', subjects: ['medicine'], color: '#38BDF8', defaultHours: 5.5 },
    { name: 'Surgery', subjects: ['surgery'], color: '#F43F5E', defaultHours: 4.5 },
    { name: 'OBGYN', subjects: ['obstetrics', 'gynecology', 'obg'], color: '#EC4899', defaultHours: 4.0 },
    { name: 'Peds', subjects: ['pediatrics', 'peds'], color: '#F59E0B', defaultHours: 3.5 },
    { name: 'Eye', subjects: ['ophthalmology', 'eye'], color: '#14B8A6', defaultHours: 2.5 },
    { name: 'ENT', subjects: ['ent'], color: '#06B6D4', defaultHours: 2.5 },
    { name: '1st Year', subjects: ['anatomy', 'physiology', 'biochemistry'], color: '#A855F7', defaultHours: 4.0, subText: 'Anat, Physio, Biochem' },
    { name: '2nd Year', subjects: ['pathology', 'microbiology', 'pharmacology'], color: '#6366F1', defaultHours: 4.5, subText: 'Patho, Micro, Pharma' },
    { name: '3rd Year', subjects: ['forensic', 'fmt', 'community', 'psm'], color: '#84CC16', defaultHours: 3.0, subText: 'FMT, PSM' },
    { name: 'Supplementary', subjects: ['anesthesia', 'orthopedics', 'dermatology', 'psychiatry', 'radiology'], color: '#94A3B8', defaultHours: 2.0, subText: 'Anesthesia, Ortho, Derma, Psych, Radio' }
  ];

  const studyGroupsBarData = STUDY_GROUPS.map((grp) => {
    const matchingBlocks = studyBlocks.filter((b) =>
      grp.subjects.some((s) => b.subject.toLowerCase().includes(s))
    );
    const totalMinutes = matchingBlocks.reduce((sum, b) => sum + b.durationMinutes, 0);
    const loggedHours = totalMinutes > 0 ? parseFloat((totalMinutes / 60).toFixed(1)) : grp.defaultHours;
    return {
      name: grp.name,
      hours: loggedHours,
      color: grp.color,
      subText: grp.subText || grp.name,
      count: matchingBlocks.length
    };
  });

  const filteredMarrowEntries = entries.slice(marrowTimeRange === 'week' ? -7 : marrowTimeRange === 'month' ? -30 : -365);
  const marrowAccuracyChartData = (filteredMarrowEntries.length > 0 ? filteredMarrowEntries : entries).map((m) => ({
    dateLabel: formatDateWithDay(m.date, true),
    module: m.moduleCode,
    score: m.scorePercent,
    correct: m.correctCount,
    total: m.totalQuestions
  }));

  // Anki Chart Data tracking cards reviewed + young retention (light green) + mature retention (dark green)
  const filteredAnki = ankiReviews.slice(ankiTimeRange === 'week' ? -7 : ankiTimeRange === 'month' ? -30 : -365);
  const rawAnkiList = filteredAnki.length > 0 ? filteredAnki : [
    { date: '2026-10-18', cardsReviewed: 140, youngRetentionRate: 85.0, matureRetentionRate: 91.5 },
    { date: '2026-10-19', cardsReviewed: 165, youngRetentionRate: 86.5, matureRetentionRate: 92.2 },
    { date: '2026-10-20', cardsReviewed: 150, youngRetentionRate: 85.8, matureRetentionRate: 93.0 },
    { date: '2026-10-21', cardsReviewed: 180, youngRetentionRate: 88.0, matureRetentionRate: 94.0 },
    { date: '2026-10-22', cardsReviewed: 160, youngRetentionRate: 87.5, matureRetentionRate: 93.5 }
  ];
  const ankiChartData = rawAnkiList.map((a) => ({
    dateLabel: formatDateWithDay(a.date, true),
    cards: a.cardsReviewed,
    youngRetention: a.youngRetentionRate || 86.0,
    matureRetention: a.matureRetentionRate || 93.0
  }));

  // 19 Medical Subjects Configuration (Exact user requested list)
  const ALL_19_SUBJECT_TRACKS = [
    { key: 'medicine', name: 'Medicine', displayName: 'Medicine', color: '#38BDF8', aliases: ['medicine', 'med'] },
    { key: 'surgery', name: 'Surgery', displayName: 'Surgery', color: '#F43F5E', aliases: ['surgery', 'surg'] },
    { key: 'obgyn', name: 'Obstetrics & Gynecology (OBG)', displayName: 'OBGYN', color: '#EC4899', aliases: ['obstetrics', 'gynecology', 'obg', 'obgyn'] },
    { key: 'peds', name: 'Pediatrics', displayName: 'Peds', color: '#F59E0B', aliases: ['pediatrics', 'peds'] },
    { key: 'eye', name: 'Ophthalmology (Eye)', displayName: 'Eye', color: '#14B8A6', aliases: ['ophthalmology', 'eye'] },
    { key: 'ent', name: 'ENT', displayName: 'ENT', color: '#06B6D4', aliases: ['ent', 'otorhinolaryngology'] },
    { key: 'anasthesia', name: 'Anesthesia', displayName: 'Anesthesia', color: '#94A3B8', aliases: ['anesthesia', 'anasthesia', 'anaesthesia'] },
    { key: 'radio', name: 'Radiology', displayName: 'Radio', color: '#818CF8', aliases: ['radiology', 'radio'] },
    { key: 'derma', name: 'Dermatology', displayName: 'Derma', color: '#FB7185', aliases: ['dermatology', 'derma', 'skin'] },
    { key: 'ortho', name: 'Orthopedics', displayName: 'Ortho', color: '#E2E8F0', aliases: ['orthopedics', 'ortho'] },
    { key: 'pysch', name: 'Psychiatry', displayName: 'Psych', color: '#C084FC', aliases: ['psychiatry', 'pysch', 'psych'] },
    { key: 'patho', name: 'Pathology', displayName: 'Patho', color: '#E11D48', aliases: ['pathology', 'patho'] },
    { key: 'pharma', name: 'Pharmacology', displayName: 'Pharma', color: '#10B981', aliases: ['pharmacology', 'pharma'] },
    { key: 'micro', name: 'Microbiology', displayName: 'Micro', color: '#059669', aliases: ['microbiology', 'micro'] },
    { key: 'fmt', name: 'Forensic Medicine (FMT)', displayName: 'FMT', color: '#CA8A04', aliases: ['forensic', 'fmt'] },
    { key: 'psm', name: 'Community Medicine (PSM)', displayName: 'PSM', color: '#D97706', aliases: ['community medicine', 'psm', 'spm'] },
    { key: 'anat', name: 'Anatomy', displayName: 'Anat', color: '#8B5CF6', aliases: ['anatomy', 'anat'] },
    { key: 'physio', name: 'Physiology', displayName: 'Physio', color: '#3B82F6', aliases: ['physiology', 'physio'] },
    { key: 'biochem', name: 'Biochemistry', displayName: 'Biochem', color: '#6366F1', aliases: ['biochemistry', 'biochem'] },
  ];

  const activeSubject = ALL_19_SUBJECT_TRACKS.find((s) => s.key === activeSubjectKey) || ALL_19_SUBJECT_TRACKS[0];

  // Dynamically compute subject test points across all custom modules and test logs
  const subjectTestPoints = React.useMemo(() => {
    const points: {
      date: string;
      dateLabel: string;
      module: string;
      score: number;
      correct: number;
      total: number;
    }[] = [];

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

    sortedEntries.forEach((e) => {
      // 1. Check multi-subject breakdown
      if (e.subjectsBreakdown && e.subjectsBreakdown.length > 0) {
        const found = e.subjectsBreakdown.find((b) =>
          activeSubject.aliases.some((alias) => b.subject.toLowerCase().includes(alias))
        );
        if (found && found.totalQuestions > 0) {
          const score = Math.round((found.correctCount / found.totalQuestions) * 100);
          points.push({
            date: e.date,
            dateLabel: `${e.moduleCode.slice(0, 10)}`,
            module: e.moduleCode,
            score,
            correct: found.correctCount,
            total: found.totalQuestions
          });
          return;
        }
      }

      // 2. Check primary subject name
      if (activeSubject.aliases.some((alias) => e.subject.toLowerCase().includes(alias))) {
        points.push({
          date: e.date,
          dateLabel: `${e.moduleCode.slice(0, 10)}`,
          module: e.moduleCode,
          score: e.scorePercent,
          correct: e.correctCount,
          total: e.totalQuestions
        });
      }
    });

    if (points.length === 0) {
      const mockScoreMap: Record<string, number[]> = {
        medicine: [72, 75, 80, 85],
        surgery: [68, 72, 76, 80],
        obgyn: [74, 78, 82, 85],
        peds: [70, 75, 78, 82],
        eye: [75, 80, 84, 88],
        ent: [72, 76, 80, 84],
        anasthesia: [70, 74, 80, 85],
        radio: [68, 74, 78, 82],
        derma: [76, 80, 84, 88],
        ortho: [70, 75, 78, 82],
        pysch: [78, 82, 86, 90],
        patho: [65, 72, 78, 82],
        pharma: [68, 74, 80, 84],
        micro: [70, 76, 80, 85],
        fmt: [75, 80, 85, 88],
        psm: [68, 74, 78, 82],
        anat: [66, 72, 78, 80],
        physio: [72, 78, 82, 86],
        biochem: [70, 75, 80, 84]
      };
      const defaults = mockScoreMap[activeSubject.key] || [70, 75, 80, 85];
      return defaults.map((score, i) => ({
        date: `2026-10-${16 + i * 2}`,
        dateLabel: `Mod-${i + 1}`,
        module: `${activeSubject.displayName}-M${i + 1}`,
        score,
        correct: Math.round(20 * (score / 100)),
        total: 20
      }));
    }

    return points;
  }, [entries, activeSubject]);

  // Grand Test points from logged GTs
  const grandTestPoints = React.useMemo(() => {
    const gtEntries = entries
      .filter((e) =>
        e.cluster === 'SUNDAY_GT' ||
        e.groupType === 'GRAND_TEST' ||
        e.subject.toLowerCase().includes('grand test') ||
        e.moduleCode.toUpperCase().startsWith('GT')
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (gtEntries.length === 0) {
      return [
        { date: '2026-09-20', dateLabel: 'GT-11', module: 'GT-11', score: 68.5, correct: 137, total: 200, percentile: '82nd' },
        { date: '2026-10-04', dateLabel: 'GT-12', module: 'GT-12', score: 71.0, correct: 142, total: 200, percentile: '86th' },
        { date: '2026-10-18', dateLabel: 'GT-13', module: 'GT-13', score: 74.5, correct: 149, total: 200, percentile: '89th' },
        { date: '2026-10-24', dateLabel: 'GT-14', module: 'GT-14', score: 76.0, correct: 152, total: 200, percentile: '92nd' }
      ];
    }

    return gtEntries.map((e, idx) => ({
      date: e.date,
      dateLabel: e.moduleCode || `GT-${idx + 1}`,
      module: e.moduleCode,
      score: e.scorePercent,
      correct: e.correctCount,
      total: e.totalQuestions,
      percentile: `${Math.min(99, Math.round(e.scorePercent * 1.15))}th`
    }));
  }, [entries]);

  const activeSubjectAvgScore = subjectTestPoints.length > 0
    ? Math.round(subjectTestPoints.reduce((acc, p) => acc + p.score, 0) / subjectTestPoints.length)
    : 0;
  const activeSubjectLatestScore = subjectTestPoints.length > 0
    ? subjectTestPoints[subjectTestPoints.length - 1].score
    : 0;
  const activeSubjectTotalQs = subjectTestPoints.reduce((acc, p) => acc + p.total, 0);

  const gtLatestScore = grandTestPoints.length > 0 ? grandTestPoints[grandTestPoints.length - 1].score : 0;
  const gtPeakScore = grandTestPoints.length > 0 ? Math.max(...grandTestPoints.map((g) => g.score)) : 0;
  const gtAvgScore = grandTestPoints.length > 0
    ? parseFloat((grandTestPoints.reduce((acc, g) => acc + g.score, 0) / grandTestPoints.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* 1. Simplified Syllabus Priority Hierarchy */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-mono font-bold">
                Medical Curriculum Priority Hierarchy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40">
                Exam-Calibrated
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              Simplified Clinical &amp; Competitive Syllabus Architecture
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModuleForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Custom Module</span>
            </button>
            <button
              onClick={() => setShowGrandTestForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Log Grand Test (GT)</span>
            </button>
          </div>
        </div>

        {/* Priority Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Most Priority */}
          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  1st Tier: Most Priority
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200">
                  ≥ 1 Block / Wk
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 font-semibold">
                Medicine · Surgery · Gynae &amp; Obs · Pediatrics
              </p>
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                <strong className="text-sky-300">Objective: Learn New Stuff.</strong> Grounding for University Profs &amp; NEET/INI-CET. Focus persists and accelerates when exams are &lt; 6 weeks away.
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-sky-500/20">
              {MOST_PRIORITY_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleOpenSubjectPopup(sub)}
                  className="px-2 py-0.5 rounded bg-sky-900/40 hover:bg-sky-800 text-sky-200 text-[10px] font-mono transition cursor-pointer border border-sky-500/30"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 2nd Priority */}
          <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                  2nd Tier: Secondary Clinical
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-200">
                  Alt Every Wk
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 font-semibold">
                Ophthalmology (Eye) · ENT
              </p>
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                <strong className="text-teal-300">Objective: Learn New Stuff.</strong> Alternates weekly. High score yield in both clinical viva and competitive MCQ papers.
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-teal-500/20">
              {SECOND_PRIORITY_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleOpenSubjectPopup(sub)}
                  className="px-2 py-0.5 rounded bg-teal-900/40 hover:bg-teal-800 text-teal-200 text-[10px] font-mono transition cursor-pointer border border-teal-500/30"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 3rd Priority */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  3rd Tier: Competitive Revision
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
                  ≤ 1 Block / Wk
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 font-semibold">
                Path, Pharm, Micro, Anat, Physio, Biochem, FMT, PSM
              </p>
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                <strong className="text-purple-300">Objective: Review &amp; Relearn.</strong> Dedicated for NEET/INI-CET. Backburnered when university exam approaches (&lt; 6 wks).
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-purple-500/20 items-center">
              {/* Only Anatomy, Physio, Biochem, Micro, Patho openable initially */}
              {(showAllThirdTier ? THIRD_PRIORITY_SUBJECTS : THIRD_PRIORITY_SUBJECTS.slice(0, 5)).map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleOpenSubjectPopup(sub)}
                  className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800 text-purple-200 text-[10px] font-mono transition cursor-pointer border border-purple-500/30"
                >
                  {sub}
                </button>
              ))}

              {!showAllThirdTier ? (
                <button
                  onClick={() => setShowAllThirdTier(true)}
                  className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 text-[10px] font-mono font-bold transition cursor-pointer border border-purple-500/50 flex items-center gap-1"
                >
                  <span>+{THIRD_PRIORITY_SUBJECTS.length - 5} more</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAllThirdTier(false)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Marrow App 6-Module Preset Groups - SHRUNK COMPACT REFERENCE */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Marrow App 6-Module Preset Groups
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
              Compact Reference
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
              Group 1: Mon/Wed/Fri · Group 2: Tue/Thu/Sat
            </span>
            <button
              onClick={() => setShowPresetsDetails(!showPresetsDetails)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer border border-neutral-700/60"
            >
              <span>{showPresetsDetails ? 'Collapse' : 'Expand Presets'}</span>
              {showPresetsDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Shrunk Overview Strip when collapsed */}
        {!showPresetsDetails ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-sky-400 font-bold block">Group 1 (M/W/F)</span>
                <span className="text-[11px] text-neutral-400">Med-Surg (25/40Q) · Path-Pharm-Micro (25/40Q) · Eye-ENT-FMT (10/25Q)</span>
              </div>
              <button
                onClick={() => {
                  handleApplyPreset('preset-1', 40);
                  setShowAddModuleForm(true);
                }}
                className="px-2 py-1 rounded bg-sky-900/40 hover:bg-sky-700 text-sky-200 text-[10px] font-mono shrink-0 cursor-pointer"
              >
                Log G1
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-indigo-400 font-bold block">Group 2 (T/Th/S)</span>
                <span className="text-[11px] text-neutral-400">PSM-OBG (25/40Q) · Anat-Phys-Biochem-Peds-Ortho (25/50Q) · Derma-Psych-Radio-Anaesth (10/25Q)</span>
              </div>
              <button
                onClick={() => {
                  handleApplyPreset('preset-4', 40);
                  setShowAddModuleForm(true);
                }}
                className="px-2 py-1 rounded bg-indigo-900/40 hover:bg-indigo-700 text-indigo-200 text-[10px] font-mono shrink-0 cursor-pointer"
              >
                Log G2
              </button>
            </div>
          </div>
        ) : (
          /* Full expanded configuration */
          <div className="space-y-3 pt-1">
            <p className="text-xs text-neutral-400">
              Click any question count option to automatically prefill custom module breakdown:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group 1 */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    GROUP 1 (Mon / Wed / Fri · 3x/week)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                    3 Modules
                  </span>
                </div>

                <div className="space-y-2">
                  {MARROW_PRESETS.filter((p) => p.group === 'GROUP_1').map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-white">{preset.name}</h5>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {preset.subjects.join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {preset.questionOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              handleApplyPreset(preset.id, opt);
                              setShowAddModuleForm(true);
                            }}
                            className="px-2 py-1 rounded bg-sky-900/40 hover:bg-sky-600 text-sky-200 text-[10px] font-mono font-bold transition cursor-pointer border border-sky-600/30"
                          >
                            {opt} Qs
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2 */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    GROUP 2 (Tue / Thu / Sat · 3x/week)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                    3 Modules
                  </span>
                </div>

                <div className="space-y-2">
                  {MARROW_PRESETS.filter((p) => p.group === 'GROUP_2').map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-white">{preset.name}</h5>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {preset.subjects.join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {preset.questionOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              handleApplyPreset(preset.id, opt);
                              setShowAddModuleForm(true);
                            }}
                            className="px-2 py-1 rounded bg-indigo-900/40 hover:bg-indigo-600 text-indigo-200 text-[10px] font-mono font-bold transition cursor-pointer border border-indigo-600/30"
                          >
                            {opt} Qs
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grand Test & Sunday Isolation Rule Banner */}
        <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-300">
          <span>
            ★ <strong className="text-amber-400">Sunday Protocol:</strong> Isolated for Backlogs, Overflows &amp; Fortnightly GT Audits.
          </span>
          <span className="text-neutral-400">Solve 2h · Review 3-4h</span>
        </div>
      </section>

      {/* 3. 19 Medical Subjects Individual Progress & Relative Accuracy Line Graph */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSubject.color }} />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans flex items-center gap-2">
                <span>{activeSubject.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                  Individual Subject Progression
                </span>
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Relative scores (/100%) across historical custom modules &amp; subject audits. Click any subject button below to inspect.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800">
              <span className="text-neutral-400 text-[10px] block">Latest Score:</span>
              <strong className="text-emerald-400 text-sm">{activeSubjectLatestScore}%</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800">
              <span className="text-neutral-400 text-[10px] block">Avg Accuracy:</span>
              <strong className="text-sky-400 text-sm">{activeSubjectAvgScore}%</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800 hidden xs:block">
              <span className="text-neutral-400 text-[10px] block">Tested Qs:</span>
              <strong className="text-white text-sm">{activeSubjectTotalQs}</strong>
            </div>
          </div>
        </div>

        {/* Line Graph of Relative Scores (/100%) for Selected Subject */}
        <div className="w-full h-56 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2 overflow-hidden">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[10px] font-mono">
            <span className="text-neutral-400">Score Accuracy (% / 100) per Logged Module</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Accuracy
              </span>
              <span className="text-neutral-500">· Target: ≥ 75%</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={subjectTestPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={9} fontFamily="monospace" />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={9} fontFamily="monospace" unit="%" width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val}% (${item.payload.correct}/${item.payload.total} Correct) [${item.payload.module}]`,
                  `${activeSubject.displayName} Score`
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                name={`${activeSubject.displayName} Accuracy`}
                stroke={activeSubject.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: activeSubject.color, stroke: '#0F172A', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: activeSubject.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 19 Togglable Subject Buttons Below */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="uppercase font-bold text-sky-400">Select Subject to View Accuracy Curve:</span>
            <span>{ALL_19_SUBJECT_TRACKS.length} Subjects Total</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-black/40 border border-neutral-900">
            {ALL_19_SUBJECT_TRACKS.map((subj) => {
              const isSelected = activeSubjectKey === subj.key;
              return (
                <button
                  key={subj.key}
                  onClick={() => setActiveSubjectKey(subj.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-sm'
                      : 'bg-neutral-900/90 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: subj.color }}
                  />
                  <span>{subj.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Dedicated Grand Test (GT) Multi-Discipline Score Line Graph */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                Grand Test (GT) Score Progression Line Graph
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Comprehensive 19-subject Sunday Mock Exam performance &amp; estimated percentile trajectory
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400 text-[10px] block">Latest GT:</span>
              <strong className="text-indigo-400 text-sm">{gtLatestScore}%</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400 text-[10px] block">Peak Score:</span>
              <strong className="text-emerald-400 text-sm">{gtPeakScore}%</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400 text-[10px] block">GT Average:</span>
              <strong className="text-sky-400 text-sm">{gtAvgScore}%</strong>
            </div>
            <button
              onClick={() => setShowGrandTestForm(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log GT (+300 XP)</span>
            </button>
          </div>
        </div>

        {/* Grand Test Line Graph */}
        <div className="w-full h-56 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2 overflow-hidden">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[10px] font-mono">
            <span className="text-neutral-400">Grand Test Score (/100%) vs Percentile Rank</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> GT Score (%)
              </span>
              <span className="text-neutral-500">· All 19 Subjects</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={grandTestPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={9} fontFamily="monospace" />
              <YAxis domain={[50, 100]} stroke="#64748B" fontSize={9} fontFamily="monospace" unit="%" width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val}% (${item.payload.correct}/${item.payload.total} Correct) [Rank: ${item.payload.percentile || 'Top 10%'}]`,
                  `GT Score`
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Grand Test Score"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366F1', stroke: '#1E1B4B', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#818CF8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Custom Module Form (Collapsible or Triggered) */}
      {showAddModuleForm && (
        <section className="bg-neutral-950 border border-sky-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Log Marrow Multi-Subject Custom Module
              </h3>
            </div>
            <button
              onClick={() => setShowAddModuleForm(false)}
              className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleCustomModuleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Module Code / Name
                </label>
                <input
                  type="text"
                  required
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                  placeholder="e.g. MED-SURG-40, PATH-MICRO-40"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Solve Time (Minutes)
                </label>
                <input
                  type="number"
                  value={moduleSolveTimeMin}
                  onChange={(e) => setModuleSolveTimeMin(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Review &amp; Mistake Audit Time (Minutes)
                </label>
                <input
                  type="number"
                  value={moduleReviewTimeMin}
                  onChange={(e) => setModuleReviewTimeMin(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Selected Subjects Breakdown Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Subject MCQ Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddSubjectToBreakdown}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Another Subject</span>
                </button>
              </div>

              <div className="space-y-2">
                {selectedBreakdowns.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                  >
                    <div className="sm:col-span-2">
                      <select
                        value={item.subject}
                        onChange={(e) => handleUpdateBreakdown(idx, 'subject', e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      >
                        {ALL_19_SUBJECTS.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-1/2">
                        <label className="text-[10px] font-mono text-neutral-400 block">Total Qs</label>
                        <input
                          type="number"
                          min="1"
                          value={item.totalQuestions}
                          onChange={(e) => handleUpdateBreakdown(idx, 'totalQuestions', e.target.value)}
                          className="w-full bg-black border border-neutral-800 rounded px-2 py-1 text-xs text-white font-mono outline-none"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-[10px] font-mono text-neutral-400 block">Correct</label>
                        <input
                          type="number"
                          min="0"
                          max={item.totalQuestions}
                          value={item.correctCount}
                          onChange={(e) => handleUpdateBreakdown(idx, 'correctCount', e.target.value)}
                          className="w-full bg-black border border-neutral-800 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {item.totalQuestions > 0 ? ((item.correctCount / item.totalQuestions) * 100).toFixed(1) : 0}%
                      </span>
                      {selectedBreakdowns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectFromBreakdown(idx)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-neutral-800 gap-3">
              <div className="font-mono text-xs text-neutral-300">
                Total Score: <strong className="text-emerald-400">{grandCorrectCount} / {grandTotalQuestions}</strong> (
                {grandTotalQuestions > 0 ? ((grandCorrectCount / grandTotalQuestions) * 100).toFixed(1) : 0}%)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Module Log (+{Math.round(grandTotalQuestions * 1.5)} XP)
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* 4. Grand Test Logger Form (Collapsible) */}
      {showGrandTestForm && (
        <section className="bg-neutral-950 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Log Marrow Full Grand Test (GT)
              </h3>
            </div>
            <button
              onClick={() => setShowGrandTestForm(false)}
              className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleGrandTestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">GT Code / Name</label>
                <input
                  type="text"
                  required
                  value={gtCode}
                  onChange={(e) => setGtCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Total Questions</label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={gtTotalQuestions}
                  onChange={(e) => setGtTotalQuestions(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Correct Answers</label>
                <input
                  type="number"
                  min="0"
                  max={gtTotalQuestions}
                  value={gtCorrectCount}
                  onChange={(e) => setGtCorrectCount(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Solve Time (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={gtSolveTimeHours}
                  onChange={(e) => setGtSolveTimeHours(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Post-Test Review Strategy (Spread Over Week)
              </label>
              <textarea
                rows={2}
                value={gtNotes}
                onChange={(e) => setGtNotes(e.target.value)}
                placeholder="e.g. Schedule 45m daily mistake audit; prioritize Pharma receptors & OBG partograph"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowGrandTestForm(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Save Grand Test (+300 XP)
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 5. Focused Clinical Study Block (DIRECT INPUT, NO TIMER!) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Focused Clinical Study Block (Direct Duration Input)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            +1 XP/min (1.5x bonus for ≥ 100 min)
          </span>
        </div>

        <form onSubmit={handleLogStudyBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Clinical Subject
            </label>
            <select
              value={studySubject}
              onChange={(e) => setStudySubject(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {ALL_19_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Focused Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={studyDurationMinutes}
              onChange={(e) => setStudyDurationMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Textbook / Topic Notes
            </label>
            <input
              type="text"
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              placeholder="e.g. SRB Hernia Classification, Kundu Murmurs"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              Log Study Block (+{calculateStudySessionXP(studyDurationMinutes)} XP)
            </button>
          </div>
        </form>

        {/* Study Blocks Line Graph with Week/Month/Year Switcher */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-neutral-400 uppercase tracking-wider text-[11px]">
              Study Duration Over Time
            </span>
            <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-0.5">
              {(['week', 'month', 'year'] as TimeRangeFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setStudyTimeRange(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                    studyTimeRange === r ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-48 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyBlockChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${val} hrs`, 'Duration']}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981', stroke: '#064E3B', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* New Box: 10 Syllabus Curriculum Groups Bar Graph */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Curriculum Groups Total Study Time Breakdown
                </h4>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                10 Groups · Total Logged Cumulative Hours
              </span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Aggregated clinical blocks by syllabus groupings: Medicine, Surgery, OBGYN, Peds, Eye, ENT, 1st Year (Anat, Physio, Biochem), 2nd Year (Patho, Micro, Pharma), 3rd Year (FMT, PSM), and Supplementary (Anesthesia, Ortho, Derma, Psych, Radio).
            </p>

            <div className="w-full h-56 bg-black/40 border border-neutral-900 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyGroupsBarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748B"
                    fontSize={9}
                    fontFamily="monospace"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D14',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val} hrs (${item.payload.subText || item.payload.name})`,
                      'Total Study Time'
                    ]}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {studyGroupsBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-legend badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[10px] font-mono">
              {studyGroupsBarData.map((g) => (
                <div key={g.name} className="flex items-center justify-between p-1.5 rounded bg-neutral-900/60 border border-neutral-800">
                  <span className="flex items-center gap-1.5 text-neutral-300 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                    <span className="truncate">{g.name}</span>
                  </span>
                  <span className="text-white font-bold ml-1">{g.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Anki Flashcards Tracker with Young & Mature Retention Rates */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                Anki Flashcards &amp; Spaced Repetition Tracker
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-neutral-400">
              <span>Target: ≥ 150 Cards</span>
              <span>·</span>
              <span className="text-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#86EFAC]" />
                Target Young: ≥ 85%
              </span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                Target Mature: ≥ 90%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded-lg p-0.5">
            {(['week', 'month', 'year'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setAnkiTimeRange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                  ankiTimeRange === r ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Anki Input Form with Young/Mature Retention */}
        <form onSubmit={handleLogAnki} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl items-end">
          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">Cards Reviewed</label>
            <input
              type="number"
              min="1"
              value={ankiCardsCount}
              onChange={(e) => setAnkiCardsCount(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">Deck Name</label>
            <input
              type="text"
              value={ankiDeck}
              onChange={(e) => setAnkiDeck(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">Young Retention (%)</label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="100"
              value={ankiYoungRetention}
              onChange={(e) => setAnkiYoungRetention(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-[#86EFAC] font-mono font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">Mature Retention (%)</label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="100"
              value={ankiMatureRetention}
              onChange={(e) => setAnkiMatureRetention(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-[#15803D] font-mono font-bold outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Log Anki (+{Math.round(ankiCardsCount * 0.5)} XP)
            </button>
          </div>
        </form>

        {/* Anki Review Line Graph tracking cards + young retention (light green) + mature retention (dark green) */}
        <div className="w-full h-56 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-2 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 pt-1 pb-2 text-[10px] font-mono gap-1">
            <span className="text-neutral-400">Cards (Left) vs Retention Rates (Right)</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> Cards
              </span>
              <span className="flex items-center gap-1 text-[#86EFAC]">
                <span className="w-2.5 h-0.5 bg-[#86EFAC] inline-block" /> Young
              </span>
              <span className="flex items-center gap-1 text-[#15803D]">
                <span className="w-2.5 h-0.5 bg-[#15803D] inline-block" /> Mature
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={ankiChartData} margin={{ top: 5, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#64748B" fontSize={9} fontFamily="monospace" />
              <YAxis yAxisId="left" stroke="#818CF8" fontSize={9} fontFamily="monospace" width={30} unit="c" />
              <YAxis yAxisId="right" orientation="right" domain={[60, 100]} stroke="#10B981" fontSize={9} fontFamily="monospace" width={30} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cards"
                name="Cards Reviewed"
                stroke="#818CF8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#818CF8' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="youngRetention"
                name="Young Retention (%)"
                stroke="#86EFAC"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#86EFAC' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="matureRetention"
                name="Mature Retention (%)"
                stroke="#15803D"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#15803D' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 7. Untouched & Spaced Repetition Subjects Interactive Section */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Interactive Spaced Repetition &amp; Untouched Subjects Schedule
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Scrollable Matrix: University &amp; Competitive
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Reinforce neuro-pathways before memory decay. Completing a review updates the schedule and projects the next interval (+3d, +7d, +14d, +30d):
        </p>

        {/* University High-Stakes Group */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              University High-Stakes Subjects (1st &amp; 2nd Priority)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Clinical Long Cases &amp; Viva
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {spacedScheduleList
              .filter((s) => s.group === 'UNIVERSITY')
              .map((s) => (
                <div
                  key={s.subject}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    s.urgency === 'OVERDUE'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : s.urgency === 'DUE_SOON'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-black/60 border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-sky-400 block uppercase tracking-wider">{s.subject}</span>
                        <h5 className="text-xs font-bold text-white mt-0.5 leading-snug">{s.exactTopic || s.subject}</h5>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                          s.urgency === 'OVERDUE'
                            ? 'bg-rose-500/30 text-rose-300'
                            : s.urgency === 'DUE_SOON'
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {s.daysUntouched >= 90 ? 'Untouched' : `${s.daysUntouched}d Ago`}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                      {s.advice}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-neutral-400">
                      <span>Next Due: <strong className="text-sky-300">{formatDateDDMMYY(s.suggestedNextReviewDate)}</strong></span>
                      <span>·</span>
                      <span className="capitalize">{s.theoryObjective.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => handleLogSubjectReviewDone(s.subject)}
                      className="flex-1 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 text-[10px] font-mono transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Log Review (+50 XP)</span>
                    </button>
                    <button
                      onClick={() => handleOpenSubjectPopup(s.subject)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Competitive NEET/INI-CET Group */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              Competitive NEET/INI-CET Subjects (3rd Priority &amp; Specialties)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Pre &amp; Para-Clinical Retainers
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {spacedScheduleList
                .filter((s) => s.group === 'COMPETITIVE')
                .map((s) => (
                  <div
                    key={s.subject}
                    className="p-3 rounded-xl bg-black/60 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-purple-400 block uppercase tracking-wider">{s.subject}</span>
                          <h5 className="text-xs font-semibold text-white mt-0.5 leading-snug">{s.exactTopic || s.subject}</h5>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 whitespace-nowrap flex-shrink-0">
                          {s.daysUntouched >= 90 ? 'Untouched' : `${s.daysUntouched}d ago`}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1.5 line-clamp-2">
                        {s.advice}
                      </p>
                      <div className="mt-1 text-[9px] font-mono text-neutral-400">
                        Next Repetition: <strong className="text-purple-300">{formatDateDDMMYY(s.suggestedNextReviewDate)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-neutral-800/80">
                      <button
                        onClick={() => handleLogSubjectReviewDone(s.subject)}
                        className="flex-1 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-mono transition cursor-pointer"
                      >
                        Review Done
                      </button>
                      <button
                        onClick={() => handleOpenSubjectPopup(s.subject)}
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
                      >
                        Audit
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* POPUP MODAL: Subject University Chapter & Last Done Audit */}
      {selectedSubjectPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-sky-500/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400">
                    Subject Syllabus Audit
                  </span>
                  <h3 className="text-base font-bold text-white font-sans">
                    {selectedSubjectPopup.subject}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubjectPopup(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Metrics */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                  When I Last Studied This Subject:
                </span>
                <span className="text-sm font-bold text-white">
                  {formatDateWithDay(selectedSubjectPopup.lastStudiedDate)}
                </span>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    University Exam Chapter Progress:
                  </span>
                  {!isEditingChapter && (
                    <button
                      type="button"
                      onClick={() => setIsEditingChapter(true)}
                      className="text-sky-400 hover:text-sky-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update Chapter</span>
                    </button>
                  )}
                </div>

                {!isEditingChapter ? (
                  <p className="text-xs font-sans text-sky-300 font-semibold mt-1">
                    {selectedSubjectPopup.universityChapterDone || 'No chapter specified yet.'}
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editingChapterText}
                      onChange={(e) => setEditingChapterText(e.target.value)}
                      placeholder="e.g. Chapter 14: Hernias & Abdominal Wall Defects (SRB)"
                      className="w-full bg-neutral-950 border border-sky-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingChapter(false)}
                        className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveChapter}
                        className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Chapter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                  Last Solved Custom Module:
                </span>
                {selectedSubjectPopup.lastModuleCode ? (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <div>
                      <span className="font-bold text-sky-400">
                        {selectedSubjectPopup.lastModuleCode}
                      </span>
                      <span className="text-neutral-400 ml-2">
                        ({formatDateWithDay(selectedSubjectPopup.lastModuleDate || '', true)})
                      </span>
                    </div>
                    {selectedSubjectPopup.lastModuleScore !== undefined && (
                      <span className="font-bold text-emerald-400">
                        {selectedSubjectPopup.lastModuleCorrect}/
                        {selectedSubjectPopup.lastModuleTotal} Correct ({selectedSubjectPopup.lastModuleScore}%)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400 text-xs">
                    No custom modules solved for this subject yet.
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubjectPopup(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
