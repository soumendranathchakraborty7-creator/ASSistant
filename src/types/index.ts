export type SubjectCluster = 'CLUSTER_A' | 'CLUSTER_B' | 'SUNDAY_GT';

export type UrgeTriggerType =
  | 'DOOMSCROLLING'
  | 'SEXUAL_URGE'
  | 'MASTURBATION'
  | 'BOREDOM'
  | 'EMOTIONAL'
  | 'SEXUAL'
  | 'DISTRACTION_TEXTING';

export type PlanCategory = 'deadline' | 'todo' | 'career' | 'fitness' | 'discipline' | 'social' | 'recreation';

export interface CalendarPlanItem {
  id: string;
  date: string; // YYYY-MM-DD
  category: PlanCategory;
  title: string;
  description?: string;
  durationMinutes?: number;
  xp?: number;
  status: 'scheduled' | 'completed' | 'shelved' | 'postponed';
  deadlineTime?: string; // e.g. "23:59" or "18:00"
  priority?: 'high' | 'medium' | 'survival';
  isDeadline?: boolean;
  subjectGroup?: string;
  isCompleted?: boolean;
  isShelved?: boolean;
  xpReward?: number;
  time?: string;
  notes?: string;
  isVagueGoal?: boolean; // Vague actionable goal with open / future horizon
}

export interface MultiPillarStreaks {
  runningStreak: number;
  workoutStreak: number;
  ankiStreak: number;
  mcqStreak: number;
  meditationStreak: number;
  screentimeStreak: number;
  calorieStreak: number;
}

export interface DailyArchiveRecord {
  date: string; // YYYY-MM-DD of archived day
  completedActionIds: string[];
  energyPercent: number;
  availableFreeHours: number;
  mcqsSolvedCount: number;
  runningKm: number;
  ankiCardsCount: number;
  studyMinutes: number;
  timestamp: string;
}

export interface ProfileState {
  fullName: string;
  xpPoints: number;
  level: number;
  currentRunningWeek: number;
  streakDays: number;
  lastActiveDate: string;
  currentWeightKg: number;
  targetWeightKg: number;
  universityProfExamDate: string; // YYYY-MM-DD
}

export interface CapacityState {
  energyPercent: number; // 0-100
  availableFreeHours: number; // e.g. 5.5
  isOnCall: boolean;
  isSick: boolean;
  sickDaysCount: number;
}

export interface MarrowSubjectBreakdown {
  subject: string;
  totalQuestions: number;
  correctCount: number;
}

export interface MarrowEntry {
  id: string;
  date: string;
  moduleCode: string;
  subject: string;
  subjectsBreakdown?: MarrowSubjectBreakdown[];
  cluster: SubjectCluster;
  groupType?: 'GROUP_1' | 'GROUP_2' | 'GRAND_TEST';
  modulePresetNumber?: number; // 1 to 6 or GT
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  mistakeReviewed: boolean;
  reviewDueDate: string;
  notes?: string;
  reviewTimeMinutes?: number;
}

export interface SubjectChapterProgress {
  subject: string;
  lastStudiedDate: string; // YYYY-MM-DD
  universityChapterDone: string;
  lastModuleCode?: string;
  lastModuleDate?: string;
  lastModuleScore?: number;
  lastModuleCorrect?: number;
  lastModuleTotal?: number;
}

export interface SubjectSpacedReview {
  subject: string;
  group: 'UNIVERSITY' | 'COMPETITIVE';
  priorityTier: 'MOST_PRIORITY' | 'SECOND_PRIORITY' | 'THIRD_PRIORITY';
  theoryObjective: 'LEARN_NEW' | 'REVIEW_RELEARN';
  lastReviewedDate?: string;
  suggestedNextReviewDate: string;
  daysUntouched: number;
  repetitionIntervalDays: number;
  isStale: boolean;
}

export interface StudyBlockLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  durationMinutes: number;
  notes?: string;
  xpAwarded: number;
}

export interface AnkiReviewLog {
  id: string;
  date: string; // YYYY-MM-DD
  cardsReviewed: number;
  durationMinutes?: number;
  deckName?: string;
  xpAwarded: number;
  retentionRate?: number;
  youngRetentionRate?: number; // e.g. 87.5
  matureRetentionRate?: number; // e.g. 93.2
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface RunningSession {
  id: string;
  date: string;
  weekNumber: number;
  completed: boolean;
  durationMinutes: number;
  xpAwarded: number;
  distanceKm: number;
  jogDistanceKm?: number;
  walkDistanceKm?: number;
  walkKm?: number;
  runKm?: number;
  notes?: string;
}

export interface CalisthenicsCircuitConfig {
  squatsReps: number;
  pushupsReps: number;
  pullupsReps: number;
  lungesReps: number;
  hangSeconds: number;
  coreSingleLegRaises: number;
  coreDoubleLegRaises: number;
  corePlankSeconds: number;
  circuitSets: number;
  coreSets: number;
}

export interface CalisthenicsLog {
  id: string;
  date: string;
  setsCompleted: number;
  squats: number;
  pushups: number;
  pullups: number;
  lunges: number;
  hangSeconds: number;
  coreSets: number;
  completed: boolean;
  customCircuit?: CalisthenicsCircuitConfig;
}

export interface DailyNutritionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  calories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatsGrams: number;
  mealsSummary?: string;
  exceededCal: boolean;
  exceededCarbs: boolean;
  exceededFats: boolean;
  penaltyDeducted?: boolean;
}

export interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatsGrams: number;
  proteinTargetGrams: number;
  isLowProtein: boolean;
  mealsSummary: string;
}

export interface UrgeLog {
  id: string;
  timestamp: string;
  triggerType: UrgeTriggerType;
  intensity: number; // 1-5
  wasSlip: boolean;
  penaltyXp: number;
  context: string;
  redemptionAction?: string;
  redemptionCompleted: boolean;
}

export interface ScreenTimeLog {
  id: string;
  date: string;
  youtubeMinutes: number;
  totalScreenTimeMinutes: number;
  isOverLimit: boolean;
}

export interface MindLog {
  id: string;
  date: string;
  meditationMinutes: number;
  gratitude: string;
  regrets: string;
  notableEvents: string;
  tomorrowIntentions: string;
}

export interface SocialContact {
  id: string;
  name: string;
  relationship: string;
  targetFrequencyDays: number;
  lastContactDate: string;
  customNotes?: string;
}

export interface RecreationEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'HOBBY' | 'OUTDOOR' | 'CREATIVE' | 'READING_FILM' | 'CULINARY' | 'OTHER';
  notes: string;
  rating: number; // 1-5
  xpAwarded: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  xpCost: number;
  icon: string;
  category: 'LEISURE' | 'NUTRITION' | 'DISCIPLINE' | 'STUDY' | 'EXPERIENCE';
  isFeaturedToday?: boolean;
  isCustom?: boolean;
}


