import React, { useState, useEffect } from 'react';
import {
  Navigation,
  ActiveTab
} from './components/Navigation.tsx';
import { DynamicCapacityHeader } from './components/DynamicCapacityHeader.tsx';
import { DailyChecklist } from './components/DailyChecklist.tsx';
import { PillarRadarChart } from './components/PillarRadarChart.tsx';
import { CareerLedger } from './components/CareerLedger.tsx';
import { FitnessTracker } from './components/FitnessTracker.tsx';
import { DisciplineLedger } from './components/DisciplineLedger.tsx';
import { SocialMatrix } from './components/SocialMatrix.tsx';
import { RewardStore } from './components/RewardStore.tsx';
import { CalendarPlanner } from './components/CalendarPlanner.tsx';
import { DeadlinesSection } from './components/DeadlinesSection.tsx';
import { StreaksMatrix } from './components/StreaksMatrix.tsx';
import { MultimodalDrawer } from './components/MultimodalDrawer.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { storage } from './services/supabaseStorage.ts';
import {
  ProfileState,
  CapacityState,
  MarrowEntry,
  WeightEntry,
  RunningSession,
  CalisthenicsLog,
  CalisthenicsCircuitConfig,
  NutritionLog,
  UrgeLog,
  ScreenTimeLog,
  MindLog,
  SocialContact,
  RewardItem,
  StudyBlockLog,
  AnkiReviewLog,
  SubjectChapterProgress,
  DailyNutritionEntry,
  RecreationEntry,
  CalendarPlanItem
} from './types/index.ts';
import {
  ActionItem,
  generateDailyActions,
  isUniversityProfExamNear,
  detectStaleFourthYearSubjects,
  calculateLevelFromXP,
  calculateRunningProgression,
  calculateMultiStreaks,
  formatDateWithDay
} from './utils/engine.ts';
import { AudioTranscriptionResult, ScreenshotOCRResult } from './services/geminiService.ts';
import { Sparkles, ArrowRight, ShieldCheck, ShoppingBag, Users, Calendar as CalendarIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application State
  const [profile, setProfile] = useState<ProfileState>(() => storage.getProfile());
  const [capacity, setCapacity] = useState<CapacityState>(() => storage.getCapacity());
  const [marrowEntries, setMarrowEntries] = useState<MarrowEntry[]>(() => storage.getMarrowModules());
  const [subjectChapters, setSubjectChapters] = useState<SubjectChapterProgress[]>(() => storage.getSubjectChapters());
  const [studyBlocks, setStudyBlocks] = useState<StudyBlockLog[]>(() => storage.getStudyBlocks());
  const [ankiReviews, setAnkiReviews] = useState<AnkiReviewLog[]>(() => storage.getAnkiReviews());
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>(() => storage.getWeightLogs());
  const [runningSessions, setRunningSessions] = useState<RunningSession[]>(() => storage.getRunningSessions());
  const [calisthenics, setCalisthenics] = useState<CalisthenicsLog>(() => storage.getCalisthenics());
  const [circuitConfig, setCircuitConfig] = useState<CalisthenicsCircuitConfig>(() => storage.getCalisthenicsCircuit());
  const [nutrition, setNutrition] = useState<NutritionLog>(() => storage.getNutrition());
  const [nutritionDays, setNutritionDays] = useState<DailyNutritionEntry[]>(() => storage.getNutritionDays());
  const [urgeLogs, setUrgeLogs] = useState<UrgeLog[]>(() => storage.getUrgeLogs());
  const [screenTime, setScreenTime] = useState<ScreenTimeLog>(() => storage.getScreenTime());
  const [mindLog, setMindLog] = useState<MindLog>(() => storage.getMindLog());
  const [contacts, setContacts] = useState<SocialContact[]>(() => storage.getContacts());
  const [recreationList, setRecreationList] = useState<RecreationEntry[]>(() => storage.getRecreation());
  const [calendarPlans, setCalendarPlans] = useState<CalendarPlanItem[]>(() => storage.getCalendarPlans());
  const [completedActionIds, setCompletedActionIds] = useState<string[]>(() => storage.getCompletedActionIds());
  const [shelvedActions, setShelvedActions] = useState<ActionItem[]>([]);
  const [customActions, setCustomActions] = useState<ActionItem[]>([]);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Synchronize to storage
  useEffect(() => {
    storage.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storage.saveCapacity(capacity);
  }, [capacity]);

  useEffect(() => {
    storage.saveMarrowModules(marrowEntries);
  }, [marrowEntries]);

  useEffect(() => {
    storage.saveSubjectChapters(subjectChapters);
  }, [subjectChapters]);

  useEffect(() => {
    storage.saveStudyBlocks(studyBlocks);
  }, [studyBlocks]);

  useEffect(() => {
    storage.saveAnkiReviews(ankiReviews);
  }, [ankiReviews]);

  useEffect(() => {
    storage.saveWeightLogs(weightLogs);
  }, [weightLogs]);

  useEffect(() => {
    storage.saveRunningSessions(runningSessions);
  }, [runningSessions]);

  useEffect(() => {
    storage.saveCalisthenics(calisthenics);
  }, [calisthenics]);

  useEffect(() => {
    storage.saveCalisthenicsCircuit(circuitConfig);
  }, [circuitConfig]);

  useEffect(() => {
    storage.saveNutrition(nutrition);
  }, [nutrition]);

  useEffect(() => {
    storage.saveNutritionDays(nutritionDays);
  }, [nutritionDays]);

  useEffect(() => {
    storage.saveUrgeLogs(urgeLogs);
  }, [urgeLogs]);

  useEffect(() => {
    storage.saveScreenTime(screenTime);
  }, [screenTime]);

  useEffect(() => {
    storage.saveMindLog(mindLog);
  }, [mindLog]);

  useEffect(() => {
    storage.saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    storage.saveRecreation(recreationList);
  }, [recreationList]);

  useEffect(() => {
    storage.saveCalendarPlans(calendarPlans);
  }, [calendarPlans]);

  useEffect(() => {
    storage.saveCompletedActionIds(completedActionIds);
  }, [completedActionIds]);

  // Award / Deduct XP helpers
  const handleAwardXP = (xp: number, reason: string) => {
    setProfile((prev) => {
      const newXP = Math.max(0, prev.xpPoints + xp);
      const { level } = calculateLevelFromXP(newXP);
      return { ...prev, xpPoints: newXP, level };
    });
    showNotification(`+${xp} XP: ${reason}`, 'success');
  };

  const handleDeductXP = (xp: number, reason: string) => {
    setProfile((prev) => {
      const newXP = Math.max(0, prev.xpPoints - xp);
      const { level } = calculateLevelFromXP(newXP);
      return { ...prev, xpPoints: newXP, level };
    });
    showNotification(`-${xp} XP penalty: ${reason}`, 'alert');
  };

  // Toggle checklist item
  const handleToggleAction = (actionId: string) => {
    const isCompleted = completedActionIds.includes(actionId);
    let newCompleted: string[];
    if (isCompleted) {
      newCompleted = completedActionIds.filter((id) => id !== actionId);
    } else {
      newCompleted = [...completedActionIds, actionId];
      handleAwardXP(50, 'Completed daily milestone');
    }
    setCompletedActionIds(newCompleted);
  };

  // Checklist Item Editing & Shelving
  const handleShelveAction = (actionId: string) => {
    const itemToShelve = dailyActions.find((a) => a.id === actionId);
    if (itemToShelve) {
      setShelvedActions((prev) => [...prev, itemToShelve]);
      showNotification(`Moved "${itemToShelve.title}" to overflow backlog`, 'alert');
    }
  };

  const handleRestoreAction = (actionId: string) => {
    setShelvedActions((prev) => prev.filter((a) => a.id !== actionId));
    showNotification('Restored task to active daily schedule', 'success');
  };

  const handleUpdateAction = (actionId: string, updated: Partial<ActionItem>) => {
    setCustomActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, ...updated } : a))
    );
    showNotification('Task parameters updated', 'success');
  };

  const handleAddCustomTask = (
    title: string,
    durationMinutes: number,
    xpReward: number,
    pillar: string,
    priorityLevel: 1 | 2 | 3 = 1,
    isDeadline: boolean = false
  ) => {
    const newTask: ActionItem = {
      id: `act-custom-${Date.now()}`,
      title,
      durationMinutes,
      pillar: (pillar as any) || 'Career',
      priority: priorityLevel === 1 ? 'high' : priorityLevel === 2 ? 'medium' : 'survival',
      priorityLevel,
      completed: false,
      xpReward,
      isDeadline,
      description: isDeadline ? 'High-stakes clinical / examination milestone' : 'Custom planned milestone'
    };
    setCustomActions((prev) => [newTask, ...prev]);
    showNotification(`Task "${title}" (P${priorityLevel}) added to daily schedule`, 'success');
  };

  const handleCancelAction = (actionId: string) => {
    setCustomActions((prev) => prev.filter((a) => a.id !== actionId));
    const item = dailyActions.find((a) => a.id === actionId);
    if (item) {
      setShelvedActions((prev) => [...prev.filter((a) => a.id !== actionId), item]);
    }
    showNotification('Task cancelled and removed from active schedule', 'alert');
  };

  const handleReassignActionDate = (actionId: string, newDate: string) => {
    const targetItem = dailyActions.find((a) => a.id === actionId);
    if (targetItem) {
      handleAddCalendarPlan({
        id: `plan-${Date.now()}`,
        date: newDate,
        category: (targetItem.pillar.toLowerCase() as any) || 'career',
        title: targetItem.title,
        description: targetItem.description,
        durationMinutes: targetItem.durationMinutes,
        xp: targetItem.xpReward,
        priority: targetItem.priority,
        status: 'scheduled',
        isDeadline: targetItem.isDeadline
      });
      handleShelveAction(actionId);
      showNotification(`Task reassigned to ${newDate}`, 'success');
    }
  };

  // Calendar Plans CRUD
  const handleAddCalendarPlan = (plan: CalendarPlanItem) => {
    setCalendarPlans((prev) => [plan, ...prev]);
    showNotification(`Added plan: ${plan.title}`, 'success');
  };

  const handleUpdateCalendarPlan = (plan: CalendarPlanItem) => {
    setCalendarPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    showNotification(`Updated plan: ${plan.title}`, 'success');
  };

  const handleDeleteCalendarPlan = (id: string) => {
    setCalendarPlans((prev) => prev.filter((p) => p.id !== id));
    showNotification('Plan removed from calendar', 'alert');
  };

  const handleShelveCalendarPlan = (id: string) => {
    setCalendarPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isShelved: !p.isShelved } : p))
    );
    showNotification('Plan shelved to overflow backlog', 'alert');
  };

  const handlePostponeCalendarPlan = (id: string, daysToAdd: number) => {
    setCalendarPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const currentDate = new Date(p.date);
          currentDate.setDate(currentDate.getDate() + daysToAdd);
          const newDateStr = currentDate.toISOString().split('T')[0];
          return { ...p, date: newDateStr };
        }
        return p;
      })
    );
    showNotification(`Plan postponed by +${daysToAdd} day(s)`, 'success');
  };

  const handleToggleCalendarPlanComplete = (id: string) => {
    setCalendarPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isCompleted;
          if (nextState) handleAwardXP(p.xpReward || 50, `Completed planned ${p.category}: ${p.title}`);
          return { ...p, isCompleted: nextState };
        }
        return p;
      })
    );
  };

  // Marrow Ledger Actions
  const handleAddMarrowModule = (entry: Omit<MarrowEntry, 'id' | 'scorePercent'>) => {
    const scorePercent = Number(((entry.correctCount / entry.totalQuestions) * 100).toFixed(2));
    const newEntry: MarrowEntry = {
      ...entry,
      id: `m-${Date.now()}`,
      scorePercent
    };
    setMarrowEntries((prev) => [newEntry, ...prev]);

    // Update chapter progress if matching
    if (entry.subjectsBreakdown) {
      entry.subjectsBreakdown.forEach((sb) => {
        setSubjectChapters((prev) =>
          prev.map((sc) => {
            if (sc.subject.toLowerCase() === sb.subject.toLowerCase()) {
              return {
                ...sc,
                lastStudiedDate: entry.date,
                lastModuleCode: entry.moduleCode,
                lastModuleDate: entry.date,
                lastModuleScore: scorePercent,
                lastModuleCorrect: sb.correctCount,
                lastModuleTotal: sb.totalQuestions
              };
            }
            return sc;
          })
        );
      });
    }

    // +2 XP per correct MCQ
    const xpEarned = entry.correctCount * 2;
    handleAwardXP(xpEarned, `Solved ${entry.correctCount}/${entry.totalQuestions} in ${entry.moduleCode}`);
  };

  const handleToggleMistakeReviewed = (id: string) => {
    setMarrowEntries((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newState = !m.mistakeReviewed;
          if (newState) handleAwardXP(20, `Audited mistakes for ${m.moduleCode}`);
          return { ...m, mistakeReviewed: newState };
        }
        return m;
      })
    );
  };

  const handleUpdateSubjectChapter = (subject: string, chapter: string) => {
    setSubjectChapters((prev) => {
      const exists = prev.find((sc) => sc.subject.toLowerCase() === subject.toLowerCase());
      if (exists) {
        return prev.map((sc) =>
          sc.subject.toLowerCase() === subject.toLowerCase()
            ? { ...sc, universityChapterDone: chapter }
            : sc
        );
      }
      return [
        ...prev,
        {
          subject,
          lastStudiedDate: new Date().toISOString().split('T')[0],
          universityChapterDone: chapter
        }
      ];
    });
  };

  const handleUpdateSubjectLastStudied = (subject: string, date: string) => {
    setSubjectChapters((prev) => {
      const exists = prev.find((sc) => sc.subject.toLowerCase() === subject.toLowerCase());
      if (exists) {
        return prev.map((sc) =>
          sc.subject.toLowerCase() === subject.toLowerCase()
            ? { ...sc, lastStudiedDate: date }
            : sc
        );
      }
      return [
        ...prev,
        {
          subject,
          lastStudiedDate: date,
          universityChapterDone: 'General Introduction'
        }
      ];
    });
    handleAwardXP(35, `Updated spaced repetition review for ${subject}`);
  };

  // Focused Study Block Action
  const handleAddStudyBlock = (block: Omit<StudyBlockLog, 'id'>) => {
    const newBlock: StudyBlockLog = {
      ...block,
      id: `sb-${Date.now()}`
    };
    setStudyBlocks((prev) => [newBlock, ...prev]);

    // Also update chapter progress lastStudiedDate for that subject
    handleUpdateSubjectLastStudied(block.subject, block.date);
  };

  // Anki Review Action
  const handleAddAnkiReview = (review: Omit<AnkiReviewLog, 'id'>) => {
    const newReview: AnkiReviewLog = {
      ...review,
      id: `ak-${Date.now()}`
    };
    setAnkiReviews((prev) => [newReview, ...prev]);
  };

  // Nutrition Days Action
  const handleSaveNutritionDay = (entry: DailyNutritionEntry) => {
    setNutritionDays((prev) => {
      const filtered = prev.filter((d) => d.date !== entry.date);
      return [entry, ...filtered];
    });
  };

  // Weight Logging
  const handleAddWeightLog = (weight: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      id: `w-${Date.now()}`,
      date: todayStr,
      weightKg: weight
    };
    setWeightLogs((prev) => [...prev.filter((w) => w.date !== todayStr), newEntry]);
    setProfile((prev) => ({ ...prev, currentWeightKg: weight }));
    handleAwardXP(25, `Morning weigh-in recorded: ${weight.toFixed(1)} kg`);
  };

  const handleUpdateTargetWeight = (weight: number) => {
    setProfile((prev) => ({ ...prev, targetWeightKg: weight }));
    storage.updateTargetWeight(weight);
    showNotification(`Target weight adjusted to ${weight.toFixed(1)} kg`, 'success');
  };

  // Running Logging
  const handleLogRunningSession = (week: number, distanceKm?: number, notes?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dist = distanceKm || (week * 0.4 + 2.0);
    const newSession: RunningSession = {
      id: `r-${Date.now()}`,
      date: todayStr,
      weekNumber: week,
      completed: true,
      durationMinutes: 30,
      distanceKm: dist,
      walkKm: 1.5,
      runKm: dist - 1.5,
      xpAwarded: 150,
      notes
    };
    setRunningSessions((prev) => [newSession, ...prev]);

    // Check if auto-progression to next week
    if (week === profile.currentRunningWeek && week < 11) {
      setProfile((prev) => ({
        ...prev,
        currentRunningWeek: prev.currentRunningWeek + 1,
        streakDays: prev.streakDays + 1
      }));
      showNotification(`Week ${week} Complete! Advanced to Week ${week + 1}`, 'success');
    } else {
      setProfile((prev) => ({ ...prev, streakDays: prev.streakDays + 1 }));
    }

    handleAwardXP(150, `Running Interval Session completed (${dist.toFixed(1)} km)`);
  };

  // Calisthenics Circuit Config
  const handleSaveCircuitConfig = (cfg: CalisthenicsCircuitConfig) => {
    setCircuitConfig(cfg);
    showNotification('Calisthenics circuit & core parameters saved', 'success');
  };

  // Urge & Slip Logging
  const handleAddUrgeLog = (log: Omit<UrgeLog, 'id' | 'timestamp'>) => {
    const newLog: UrgeLog = {
      ...log,
      id: `u-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setUrgeLogs((prev) => [newLog, ...prev]);
  };

  const handleCompleteRedemption = (id: string, xpRecovered: number) => {
    setUrgeLogs((prev) =>
      prev.map((u) => (u.id === id ? { ...u, redemptionCompleted: true } : u))
    );
    handleAwardXP(xpRecovered, 'AI Disciplinary Redemption protocol completed');
  };

  // Social Contacts Actions
  const handleContactToday = (contactId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, lastContactDate: todayStr } : c))
    );
    handleAwardXP(30, 'Relational check-in recorded');
  };

  const handleAddContact = (contact: Omit<SocialContact, 'id' | 'lastContactDate'>) => {
    const newContact: SocialContact = {
      ...contact,
      id: `sc-${Date.now()}`,
      lastContactDate: new Date().toISOString().split('T')[0]
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const handleEditContact = (contact: SocialContact) => {
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    showNotification('Relationship contact removed', 'alert');
  };

  // Recreation Actions
  const handleAddRecreation = (entry: Omit<RecreationEntry, 'id'>) => {
    const newEntry: RecreationEntry = {
      ...entry,
      id: `rec-${Date.now()}`
    };
    setRecreationList((prev) => [newEntry, ...prev]);
  };

  // Rewards Store Actions
  const handleRedeemReward = (item: RewardItem) => {
    handleDeductXP(item.xpCost, `Redeemed ${item.title}`);
  };

  // Multimodal Gemini Data Integration
  const handleApplyVoiceData = (data: AudioTranscriptionResult) => {
    if (data.marrow) {
      handleAddMarrowModule({
        date: new Date().toISOString().split('T')[0],
        moduleCode: data.marrow.moduleCode || 'VOICE-MOD',
        subject: data.marrow.subject || 'Medicine',
        cluster: 'CLUSTER_A',
        totalQuestions: data.marrow.totalQuestions || 40,
        correctCount: data.marrow.correctCount || 34,
        mistakeReviewed: false,
        reviewDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        notes: data.marrow.notes
      });
    }

    if (data.weighIn) {
      handleAddWeightLog(data.weighIn.weightKg);
    }

    if (data.urge) {
      handleAddUrgeLog({
        triggerType: 'SEXUAL_URGE',
        intensity: data.urge.intensity || 3,
        wasSlip: data.urge.wasSlip || false,
        penaltyXp: data.urge.wasSlip ? 500 : 0,
        context: data.urge.context || 'Voice logged urge',
        redemptionCompleted: !data.urge.wasSlip
      });
    }

    if (data.journal) {
      setMindLog((prev) => ({
        ...prev,
        gratitude: data.journal?.gratitude || prev.gratitude,
        regrets: data.journal?.regrets || prev.regrets,
        notableEvents: data.journal?.notable || prev.notableEvents,
        tomorrowIntentions: data.journal?.tomorrow || prev.tomorrowIntentions
      }));
    }

    // Auto-integrate planned events and deadlines into calendar & schedule
    if (data.plans_to_add && data.plans_to_add.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newItems: CalendarPlanItem[] = data.plans_to_add.map((p, idx) => ({
        id: `cp-voice-${Date.now()}-${idx}`,
        title: p.title,
        category: p.category || 'todo',
        date: p.date || todayStr,
        time: p.time,
        isDeadline: p.isDeadline || p.category === 'deadline',
        priority: p.priority === 'HIGH' ? 'high' : p.priority === 'LOW' ? 'survival' : 'medium',
        notes: p.notes,
        status: 'scheduled',
        isCompleted: false,
        isShelved: false,
        xpReward: p.isDeadline ? 100 : 50
      }));
      setCalendarPlans((prev) => [...prev, ...newItems]);
      handleAwardXP(30 * newItems.length, `Voice review auto-integrated ${newItems.length} plan(s) into calendar`);
    }

    showNotification('Voice log metrics & planned schedule integrated into system state', 'success');
  };

  const handleApplyOCRData = (ocr: ScreenshotOCRResult) => {
    if (ocr.type === 'JOURNABLE') {
      setNutrition((prev) => ({
        ...prev,
        calories: ocr.calories || prev.calories,
        proteinGrams: ocr.proteinGrams || prev.proteinGrams,
        mealsSummary: ocr.mealsDetected ? ocr.mealsDetected.join(', ') : prev.mealsSummary
      }));
      handleAwardXP(35, 'Journable nutrition OCR logged');
    } else if (ocr.type === 'SCREENZEN') {
      setScreenTime((prev) => ({
        ...prev,
        youtubeMinutes: ocr.youtubeMinutes || prev.youtubeMinutes,
        totalScreenTimeMinutes: ocr.totalScreenTimeMinutes || prev.totalScreenTimeMinutes,
        isOverLimit: (ocr.youtubeMinutes || 0) > 30
      }));
      handleAwardXP(30, 'ScreenZen screen time OCR logged');
    } else if (ocr.type === 'ANKI') {
      handleAddAnkiReview({
        date: new Date().toISOString().split('T')[0],
        cardsReviewed: ocr.cardsReviewed || 100,
        deckName: 'AnKing Step 2 / NEET PG',
        xpAwarded: Math.round((ocr.cardsReviewed || 100) * 0.5),
        retentionRate: ocr.retentionRate || 88.5
      });
      handleAwardXP(60, `Anki OCR: ${ocr.cardsReviewed || 100} flashcards reviewed`);
    }
    showNotification(`OCR data applied (${ocr.type})`, 'success');
  };

  // Calculated Multi Streaks across all 7 pillars
  const todayStr = new Date().toISOString().split('T')[0];
  const multiStreaks = calculateMultiStreaks(
    runningSessions,
    calisthenics,
    ankiReviews,
    marrowEntries,
    mindLog,
    screenTime,
    nutritionDays
  );

  // Calculated Pillar Scores for Radar Chart
  const isProfNear = isUniversityProfExamNear(profile.universityProfExamDate);
  const staleSubjects = detectStaleFourthYearSubjects(marrowEntries);
  
  // Combine core actions with custom actions, excluding shelved actions
  const shelvedIds = new Set(shelvedActions.map((s) => s.id));
  const baseActions = generateDailyActions(capacity, isProfNear, new Set(completedActionIds));
  const dailyActions = [...baseActions, ...customActions].filter((a) => !shelvedIds.has(a.id));

  // Calendar plans due today
  const calendarPlansToday = calendarPlans.filter(
    (p) => p.date === todayStr && !p.isShelved
  );

  // Career score: average score % on custom modules
  const avgMcqScore =
    marrowEntries.length > 0
      ? Math.round(
          marrowEntries.reduce((sum, e) => sum + e.scorePercent, 0) / marrowEntries.length
        )
      : 80;

  // Fitness score: running adherence + strength + macro discipline
  const hasExcessiveDays = nutritionDays.some((nd) => nd.exceededCal || nd.exceededCarbs || nd.exceededFats);
  const fitnessScore = Math.min(
    100,
    Math.round((calisthenics.setsCompleted / 4) * 45 + (runningSessions.length > 0 ? 40 : 20) + (hasExcessiveDays ? 0 : 15))
  );

  // Discipline score: absence of recent slips
  const recentSlips = urgeLogs.filter((u) => u.wasSlip && !u.redemptionCompleted).length;
  const disciplineScore = Math.max(10, 100 - recentSlips * 25);

  // Mind score: meditation
  const mindScore = Math.min(100, Math.round(mindLog.meditationMinutes * 5 + 25));

  // Social score: contacts checked in on time
  const overdueContacts = contacts.filter((c) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > c.targetFrequencyDays;
  }).length;
  const socialScore = Math.max(20, 100 - overdueContacts * 15);

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-20 lg:pb-8">
      {/* Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        streakDays={profile.streakDays}
        level={profile.level}
        xpPoints={profile.xpPoints}
      />

      {/* Floating Notification Banner */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-neutral-900/95 backdrop-blur-md shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          {notification.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-white">{notification.message}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 sm:px-6 space-y-6">
        {/* VIEW 1: COMMAND CENTER (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* REQUIREMENT: LEVEL AND ECONOMY CENTER AT TOP WITH THE PILLARS */}
            <PillarRadarChart
              xpPoints={profile.xpPoints}
              streakDays={profile.streakDays}
              careerScore={avgMcqScore}
              fitnessScore={fitnessScore}
              disciplineScore={disciplineScore}
              mindScore={mindScore}
              socialScore={socialScore}
              onNavigateToTab={(t) => setActiveTab(t as ActiveTab)}
            />

            {/* REQUIREMENT: 7 SEPARATE STREAKS MATRIX */}
            <StreaksMatrix streaks={multiStreaks} />

            {/* REQUIREMENT: HIGH-STAKES ACADEMIC DEADLINES & MILESTONES */}
            <DeadlinesSection
              deadlines={calendarPlans}
              onNavigateToCalendar={() => setActiveTab('calendar')}
            />

            {/* Dynamic Capacity Anti-Burnout Header (Somatic Energy + Available Free Time Budget) */}
            <DynamicCapacityHeader
              capacity={capacity}
              onUpdateCapacity={setCapacity}
              profile={profile}
              staleSubjects={staleSubjects}
            />

            {/* Adaptive Daily Schedule (Dependent on both energy battery and available free time budget) */}
            <DailyChecklist
              actions={dailyActions}
              onToggleAction={handleToggleAction}
              availableFreeHours={capacity.availableFreeHours}
              energyPercent={capacity.energyPercent}
              calendarPlansToday={calendarPlansToday}
              onToggleCalendarPlan={handleToggleCalendarPlanComplete}
              onPostponePlan={handlePostponeCalendarPlan}
              onShelvePlan={handleShelveCalendarPlan}
              onDeletePlan={handleDeleteCalendarPlan}
              onAddCustomTask={handleAddCustomTask}
              onUpdateAction={handleUpdateAction}
              onShelveAction={handleShelveAction}
              shelvedActions={shelvedActions}
              onRestoreAction={handleRestoreAction}
              onCancelAction={handleCancelAction}
              onReassignActionDate={handleReassignActionDate}
            />

            {/* Quick Glance Strips */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Marrow Quick Strip */}
              <div
                onClick={() => setActiveTab('career')}
                className="p-4 rounded-2xl bg-[#090D14] border border-neutral-800 hover:border-sky-500/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Pillar 1 · Career &amp; Marrow
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-sm font-bold text-white">
                      Custom Modules &amp; Anki
                    </h3>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {avgMcqScore}% Avg
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {marrowEntries[0] ? `Latest: ${marrowEntries[0].moduleCode} (${marrowEntries[0].scorePercent}%)` : 'No modules recorded'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold mt-3">
                  <span>Open Career Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Running & Nutrition Quick Strip */}
              <div
                onClick={() => setActiveTab('fitness')}
                className="p-4 rounded-2xl bg-[#090D14] border border-neutral-800 hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Pillar 2 · 11-Week Run &amp; Macros
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-sm font-bold text-white">
                      Week {profile.currentRunningWeek} Progression
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {profile.currentWeightKg.toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Calendar nutrition oversight &amp; interval run
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-3">
                  <span>Open Fitness Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Urge & Discipline Strip */}
              <div
                onClick={() => setActiveTab('discipline')}
                className="p-4 rounded-2xl bg-[#090D14] border border-neutral-800 hover:border-rose-500/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Pillar 3 · Mental Discipline
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-sm font-bold text-white">
                      Urge Ledger &amp; Streak
                    </h3>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {multiStreaks.meditationStreak}d Clean
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    sexual urge(-500exp) &amp; calendar streak
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold mt-3">
                  <span>Open Discipline Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Calendar & Plans Strip */}
              <div
                onClick={() => setActiveTab('calendar')}
                className="p-4 rounded-2xl bg-[#090D14] border border-neutral-800 hover:border-purple-500/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Projection Matrix
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-sm font-bold text-white">
                      Calendar Planner
                    </h3>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {calendarPlans.length} Items
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Week, month, &amp; year projection planner
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold mt-3">
                  <span>Open Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CALENDAR & PLANNER TAB */}
        {activeTab === 'calendar' && (
          <CalendarPlanner
            plans={calendarPlans}
            onAddPlan={handleAddCalendarPlan}
            onUpdatePlan={handleUpdateCalendarPlan}
            onDeletePlan={handleDeleteCalendarPlan}
            onShelvePlan={handleShelveCalendarPlan}
            onPostponePlan={handlePostponeCalendarPlan}
            shelvedActions={shelvedActions}
            onRestoreAction={handleRestoreAction}
          />
        )}

        {/* VIEW 3: CAREER & MARROW LEDGER */}
        {activeTab === 'career' && (
          <CareerLedger
            entries={marrowEntries}
            onAddEntry={handleAddMarrowModule}
            onToggleMistakeReviewed={handleToggleMistakeReviewed}
            onAwardXP={handleAwardXP}
            studyBlocks={studyBlocks}
            onAddStudyBlock={handleAddStudyBlock}
            ankiReviews={ankiReviews}
            onAddAnkiReview={handleAddAnkiReview}
            subjectChapters={subjectChapters}
            onUpdateSubjectChapter={handleUpdateSubjectChapter}
            onUpdateSubjectLastStudied={handleUpdateSubjectLastStudied}
          />
        )}

        {/* VIEW 4: FITNESS & RUNNING */}
        {activeTab === 'fitness' && (
          <FitnessTracker
            currentWeightKg={profile.currentWeightKg}
            targetWeightKg={profile.targetWeightKg}
            onUpdateTargetWeight={handleUpdateTargetWeight}
            weightLogs={weightLogs}
            onAddWeightLog={handleAddWeightLog}
            currentRunningWeek={profile.currentRunningWeek}
            runningSessions={runningSessions}
            onLogRunningSession={handleLogRunningSession}
            calisthenics={calisthenics}
            onUpdateCalisthenics={setCalisthenics}
            circuitConfig={circuitConfig}
            onSaveCircuitConfig={handleSaveCircuitConfig}
            nutrition={nutrition}
            onUpdateNutrition={setNutrition}
            nutritionDays={nutritionDays}
            onSaveNutritionDay={handleSaveNutritionDay}
            onDeductXP={handleDeductXP}
            onAwardXP={handleAwardXP}
            runningStreak={multiStreaks.runningStreak}
            workoutStreak={multiStreaks.workoutStreak}
            calorieStreak={multiStreaks.calorieStreak}
            isSick={capacity.isSick}
            energyPercent={capacity.energyPercent}
          />
        )}

        {/* VIEW 5: DISCIPLINE & URGE LEDGER */}
        {activeTab === 'discipline' && (
          <DisciplineLedger
            urgeLogs={urgeLogs}
            onAddUrgeLog={handleAddUrgeLog}
            onCompleteRedemption={handleCompleteRedemption}
            screenTime={screenTime}
            onUpdateScreenTime={setScreenTime}
            mindLog={mindLog}
            onUpdateMindLog={setMindLog}
            onAwardXP={handleAwardXP}
            onDeductXP={handleDeductXP}
            energyPercent={capacity.energyPercent}
            streakDays={profile.streakDays}
            meditationStreak={multiStreaks.meditationStreak}
            screentimeStreak={multiStreaks.screentimeStreak}
          />
        )}

        {/* VIEW 6: SOCIAL MATRIX */}
        {activeTab === 'social' && (
          <SocialMatrix
            contacts={contacts}
            onContactToday={handleContactToday}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            recreationList={recreationList}
            onAddRecreation={handleAddRecreation}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onAwardXP={handleAwardXP}
          />
        )}

        {/* VIEW 7: SHOP & REWARDS */}
        {activeTab === 'store' && (
          <RewardStore
            xpPoints={profile.xpPoints}
            onRedeemReward={handleRedeemReward}
            onDeductXP={handleDeductXP}
          />
        )}
      </main>

      {/* Multimodal Hub Drawer Modal */}
      <MultimodalDrawer
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyVoiceData={handleApplyVoiceData}
        onApplyOCRData={handleApplyOCRData}
      />

      {/* Supabase Schema Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
