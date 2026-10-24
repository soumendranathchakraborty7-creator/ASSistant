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
  CalendarPlanItem,
  DailyArchiveRecord
} from '../types/index.ts';

const STORAGE_KEYS = {
  PROFILE: 'asclepius_profile_v2',
  CAPACITY: 'asclepius_capacity_v2',
  MARROW: 'asclepius_marrow_v2',
  WEIGHT: 'asclepius_weight_v2',
  RUNNING: 'asclepius_running_v2',
  STRENGTH: 'asclepius_strength_v2',
  CIRCUIT_CONFIG: 'asclepius_circuit_config_v2',
  NUTRITION: 'asclepius_nutrition_v2',
  NUTRITION_DAYS: 'asclepius_nutrition_days_v2',
  URGE: 'asclepius_urge_v2',
  SCREENTIME: 'asclepius_screentime_v2',
  MIND: 'asclepius_mind_v2',
  CONTACTS: 'asclepius_contacts_v2',
  STUDY_BLOCKS: 'asclepius_study_blocks_v2',
  ANKI_REVIEWS: 'asclepius_anki_reviews_v2',
  SUBJECT_CHAPTERS: 'asclepius_subject_chapters_v2',
  RECREATION: 'asclepius_recreation_v2',
  CALENDAR_PLANS: 'asclepius_calendar_plans_v2',
  ALL_REWARDS: 'asclepius_all_rewards_v2',
  SUPABASE_CONFIG: 'asclepius_supabase_config_v2',
  COMPLETED_ACTIONS: 'asclepius_completed_actions_v2',
  DAILY_ARCHIVE: 'asclepius_daily_archive_v2'
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

// Pristine blank profile: starts completely at 0
export const DEFAULT_PROFILE: ProfileState = {
  fullName: 'Dr. Resident',
  xpPoints: 0,
  level: 1,
  currentRunningWeek: 1,
  streakDays: 0,
  lastActiveDate: getTodayDateStr(),
  currentWeightKg: 0,
  targetWeightKg: 0,
  universityProfExamDate: ''
};

export const DEFAULT_CAPACITY: CapacityState = {
  energyPercent: 100,
  availableFreeHours: 6.0,
  isOnCall: false,
  isSick: false,
  sickDaysCount: 0
};

export const DEFAULT_MARROW: MarrowEntry[] = [];
export const DEFAULT_SUBJECT_CHAPTERS: SubjectChapterProgress[] = [];
export const DEFAULT_STUDY_BLOCKS: StudyBlockLog[] = [];
export const DEFAULT_ANKI_REVIEWS: AnkiReviewLog[] = [];
export const DEFAULT_WEIGHT: WeightEntry[] = [];
export const DEFAULT_RUNNING: RunningSession[] = [];
export const DEFAULT_CALENDAR_PLANS: CalendarPlanItem[] = [];
export const DEFAULT_NUTRITION_DAYS: DailyNutritionEntry[] = [];
export const DEFAULT_URGE_LOGS: UrgeLog[] = [];
export const DEFAULT_CONTACTS: SocialContact[] = [];
export const DEFAULT_RECREATION: RecreationEntry[] = [];
export const DEFAULT_DAILY_ARCHIVES: DailyArchiveRecord[] = [];

export const DEFAULT_CIRCUIT_CONFIG: CalisthenicsCircuitConfig = {
  squatsReps: 20,
  pushupsReps: 10,
  pullupsReps: 10,
  lungesReps: 20,
  hangSeconds: 30,
  coreSingleLegRaises: 15,
  coreDoubleLegRaises: 10,
  corePlankSeconds: 30,
  circuitSets: 4,
  coreSets: 2
};

export const DEFAULT_CALISTHENICS: CalisthenicsLog = {
  id: 'c-today',
  date: getTodayDateStr(),
  setsCompleted: 0,
  squats: 0,
  pushups: 0,
  pullups: 0,
  lunges: 0,
  hangSeconds: 0,
  coreSets: 0,
  completed: false,
  customCircuit: DEFAULT_CIRCUIT_CONFIG
};

export const DEFAULT_NUTRITION: NutritionLog = {
  id: 'n-today',
  date: getTodayDateStr(),
  calories: 0,
  carbsGrams: 0,
  proteinGrams: 0,
  fatsGrams: 0,
  proteinTargetGrams: 130,
  isLowProtein: false,
  mealsSummary: ''
};

export const DEFAULT_SCREENTIME: ScreenTimeLog = {
  id: 'st-today',
  date: getTodayDateStr(),
  youtubeMinutes: 0,
  totalScreenTimeMinutes: 0,
  isOverLimit: false
};

export const DEFAULT_MIND: MindLog = {
  id: 'm-today',
  date: getTodayDateStr(),
  meditationMinutes: 0,
  gratitude: '',
  regrets: '',
  notableEvents: '',
  tomorrowIntentions: ''
};

export const ALL_REWARD_ITEMS: RewardItem[] = [
  {
    id: 'rew-yt-30',
    title: 'Guilt-Free YouTube / Video Pass (30 min)',
    description: 'Permitted viewing window with zero disciplinary penalties or guilt.',
    xpCost: 200,
    icon: 'Youtube',
    category: 'LEISURE'
  },
  {
    id: 'rew-cheat-meal',
    title: 'High-Protein Post-GT Cheat Meal',
    description: 'Post-Grand Test reward meal (sushi, steak or biryani) aligned with protein targets.',
    xpCost: 550,
    icon: 'Utensils',
    category: 'NUTRITION'
  },
  {
    id: 'rew-streak-freeze',
    title: 'Emergency 24h Clinical Duty Streak Shield',
    description: 'Protects study and fitness streaks during casualty emergency on-call shifts.',
    xpCost: 750,
    icon: 'Shield',
    category: 'DISCIPLINE'
  },
  {
    id: 'rew-specialty-coffee',
    title: 'Artisanal Single-Origin Cold Brew',
    description: 'High-focus study fuel for the morning heavy theory block at your favorite cafe.',
    xpCost: 160,
    icon: 'Coffee',
    category: 'LEISURE'
  },
  {
    id: 'rew-gaming-session',
    title: '1 Hour Dedicated Console / PC Gaming',
    description: 'Immersion break into your favorite game with phone locked away.',
    xpCost: 400,
    icon: 'Gamepad',
    category: 'LEISURE'
  },
  {
    id: 'rew-fiction-chapter',
    title: 'Novel / Non-Medical Fiction Deep Reading',
    description: '60 minutes of uninterrupted fiction, philosophy or history reading.',
    xpCost: 220,
    icon: 'Book',
    category: 'STUDY'
  },
  {
    id: 'rew-nap-pass',
    title: 'Guilt-Free 45-Min Afternoon Power Nap',
    description: 'Restore neuro-glymphatic clearance post casualty duty without an alarm.',
    xpCost: 250,
    icon: 'Moon',
    category: 'EXPERIENCE'
  },
  {
    id: 'rew-luxury-scrubs',
    title: 'Unlock Premium Scrubs / Clinical Ward Gear',
    description: 'Treat yourself to a top-tier antimicrobial scrub set or stethoscope case.',
    xpCost: 1200,
    icon: 'Shirt',
    category: 'DISCIPLINE'
  },
  {
    id: 'rew-movie-night',
    title: 'Full Feature Film or 2 Anime Episodes',
    description: 'Complete weekend leisure film without checking flashcard queues.',
    xpCost: 450,
    icon: 'Tv',
    category: 'LEISURE'
  },
  {
    id: 'rew-museum-visit',
    title: 'Weekend Art Gallery / Science Museum Visit',
    description: 'Restorative cultural immersion away from hospital walls.',
    xpCost: 500,
    icon: 'Compass',
    category: 'EXPERIENCE'
  },
  {
    id: 'rew-gourmet-dessert',
    title: 'Artisanal Gelato or Dark Chocolate Dessert',
    description: 'A luxurious sweet reward after auditing 100 mistake questions.',
    xpCost: 280,
    icon: 'Cake',
    category: 'NUTRITION'
  },
  {
    id: 'rew-music-album',
    title: 'Deep Vinyl / Hi-Fi Album Listening Session',
    description: 'Noise-cancelling headphones on, lights dim, full album front to back.',
    xpCost: 200,
    icon: 'Music',
    category: 'LEISURE'
  },
  {
    id: 'rew-audiobook',
    title: 'Audiobook Credit / Purchase',
    description: 'New non-fiction or biography to listen to during running sessions.',
    xpCost: 650,
    icon: 'Headphones',
    category: 'STUDY'
  },
  {
    id: 'rew-spa-massage',
    title: 'Acupressure / Deep Tissue Massage',
    description: 'Relieve trapezoid and spine tension from long surgical retraction hours.',
    xpCost: 950,
    icon: 'Sparkles',
    category: 'EXPERIENCE'
  },
  {
    id: 'rew-podcast-walk',
    title: '60-min Golden Hour Nature Walk with Podcast',
    description: 'Gentle aerobic reset during outdoor sunset.',
    xpCost: 180,
    icon: 'Sun',
    category: 'EXPERIENCE'
  },
  {
    id: 'rew-stationery',
    title: 'Japanese High-Precision Fountain Pen / Notebook',
    description: 'Premium stationery item for high-yield diagnostic flowcharts.',
    xpCost: 350,
    icon: 'PenTool',
    category: 'STUDY'
  }
];

export const REWARD_STORE_ITEMS = ALL_REWARD_ITEMS;

/**
 * Returns a randomized subset of reward items for the day based on date string or random seed
 */
export function getRandomizedDailyRewards(seedDate?: string, offset = 0): RewardItem[] {
  const dateStr = seedDate || new Date().toISOString().split('T')[0];
  // Simple deterministic hash based on date string
  let hash = offset;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }

  // Shuffle copy using pseudo-random based on date hash
  const shuffled = [...ALL_REWARD_ITEMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ (hash >>> 15), 0x5bd1e995);
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick top 8 items for the daily shop, marking top 2 as daily featured deals
  return shuffled.slice(0, 8).map((item, idx) => ({
    ...item,
    isFeaturedToday: idx < 2
  }));
}

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Profile
  getProfile(): ProfileState {
    return this.get<ProfileState>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }
  saveProfile(profile: ProfileState): void {
    this.set(STORAGE_KEYS.PROFILE, profile);
  }

  // Capacity
  getCapacity(): CapacityState {
    return this.get<CapacityState>(STORAGE_KEYS.CAPACITY, DEFAULT_CAPACITY);
  }
  saveCapacity(capacity: CapacityState): void {
    this.set(STORAGE_KEYS.CAPACITY, capacity);
  }

  // Marrow Custom Modules
  getMarrowModules(): MarrowEntry[] {
    return this.get<MarrowEntry[]>(STORAGE_KEYS.MARROW, DEFAULT_MARROW);
  }
  saveMarrowModules(entries: MarrowEntry[]): void {
    this.set(STORAGE_KEYS.MARROW, entries);
  }

  // Subject Chapters Progress
  getSubjectChapters(): SubjectChapterProgress[] {
    return this.get<SubjectChapterProgress[]>(STORAGE_KEYS.SUBJECT_CHAPTERS, DEFAULT_SUBJECT_CHAPTERS);
  }
  saveSubjectChapters(chapters: SubjectChapterProgress[]): void {
    this.set(STORAGE_KEYS.SUBJECT_CHAPTERS, chapters);
  }

  // Study Blocks
  getStudyBlocks(): StudyBlockLog[] {
    return this.get<StudyBlockLog[]>(STORAGE_KEYS.STUDY_BLOCKS, DEFAULT_STUDY_BLOCKS);
  }
  saveStudyBlocks(blocks: StudyBlockLog[]): void {
    this.set(STORAGE_KEYS.STUDY_BLOCKS, blocks);
  }

  // Anki Reviews
  getAnkiReviews(): AnkiReviewLog[] {
    return this.get<AnkiReviewLog[]>(STORAGE_KEYS.ANKI_REVIEWS, DEFAULT_ANKI_REVIEWS);
  }
  saveAnkiReviews(reviews: AnkiReviewLog[]): void {
    this.set(STORAGE_KEYS.ANKI_REVIEWS, reviews);
  }

  // Weight
  getWeightLogs(): WeightEntry[] {
    return this.get<WeightEntry[]>(STORAGE_KEYS.WEIGHT, DEFAULT_WEIGHT);
  }
  saveWeightLogs(logs: WeightEntry[]): void {
    this.set(STORAGE_KEYS.WEIGHT, logs);
  }

  // Running
  getRunningSessions(): RunningSession[] {
    return this.get<RunningSession[]>(STORAGE_KEYS.RUNNING, DEFAULT_RUNNING);
  }
  saveRunningSessions(sessions: RunningSession[]): void {
    this.set(STORAGE_KEYS.RUNNING, sessions);
  }

  // Calisthenics
  getCalisthenics(): CalisthenicsLog {
    return this.get<CalisthenicsLog>(STORAGE_KEYS.STRENGTH, DEFAULT_CALISTHENICS);
  }
  saveCalisthenics(log: CalisthenicsLog): void {
    this.set(STORAGE_KEYS.STRENGTH, log);
  }

  // Nutrition Single
  getNutrition(): NutritionLog {
    return this.get<NutritionLog>(STORAGE_KEYS.NUTRITION, DEFAULT_NUTRITION);
  }
  saveNutrition(log: NutritionLog): void {
    this.set(STORAGE_KEYS.NUTRITION, log);
  }

  // Nutrition Days Calendar
  getNutritionDays(): DailyNutritionEntry[] {
    return this.get<DailyNutritionEntry[]>(STORAGE_KEYS.NUTRITION_DAYS, DEFAULT_NUTRITION_DAYS);
  }
  saveNutritionDays(days: DailyNutritionEntry[]): void {
    this.set(STORAGE_KEYS.NUTRITION_DAYS, days);
  }

  // Urges
  getUrgeLogs(): UrgeLog[] {
    return this.get<UrgeLog[]>(STORAGE_KEYS.URGE, DEFAULT_URGE_LOGS);
  }
  saveUrgeLogs(logs: UrgeLog[]): void {
    this.set(STORAGE_KEYS.URGE, logs);
  }

  // Screen Time
  getScreenTime(): ScreenTimeLog {
    return this.get<ScreenTimeLog>(STORAGE_KEYS.SCREENTIME, DEFAULT_SCREENTIME);
  }
  saveScreenTime(log: ScreenTimeLog): void {
    this.set(STORAGE_KEYS.SCREENTIME, log);
  }

  // Mind
  getMindLog(): MindLog {
    return this.get<MindLog>(STORAGE_KEYS.MIND, DEFAULT_MIND);
  }
  saveMindLog(log: MindLog): void {
    this.set(STORAGE_KEYS.MIND, log);
  }

  // Social Contacts
  getContacts(): SocialContact[] {
    return this.get<SocialContact[]>(STORAGE_KEYS.CONTACTS, DEFAULT_CONTACTS);
  }
  saveContacts(contacts: SocialContact[]): void {
    this.set(STORAGE_KEYS.CONTACTS, contacts);
  }

  // Recreation
  getRecreation(): RecreationEntry[] {
    return this.get<RecreationEntry[]>(STORAGE_KEYS.RECREATION, DEFAULT_RECREATION);
  }
  saveRecreation(recreation: RecreationEntry[]): void {
    this.set(STORAGE_KEYS.RECREATION, recreation);
  }

  // Completed Action IDs for today
  getCompletedActionIds(): string[] {
    return this.get<string[]>(STORAGE_KEYS.COMPLETED_ACTIONS, []);
  }
  saveCompletedActionIds(ids: string[]): void {
    this.set(STORAGE_KEYS.COMPLETED_ACTIONS, ids);
  }

  // Daily Archive Log (History persists across midnight resets)
  getDailyArchive(): DailyArchiveRecord[] {
    return this.get<DailyArchiveRecord[]>(STORAGE_KEYS.DAILY_ARCHIVE, DEFAULT_DAILY_ARCHIVES);
  }
  saveDailyArchive(records: DailyArchiveRecord[]): void {
    this.set(STORAGE_KEYS.DAILY_ARCHIVE, records);
  }
  archiveDay(record: DailyArchiveRecord): void {
    const list = this.getDailyArchive();
    const filtered = list.filter((r) => r.date !== record.date);
    this.saveDailyArchive([record, ...filtered]);
  }

  // Calendar Plans
  getCalendarPlans(): CalendarPlanItem[] {
    return this.get<CalendarPlanItem[]>(STORAGE_KEYS.CALENDAR_PLANS, DEFAULT_CALENDAR_PLANS);
  }
  saveCalendarPlans(plans: CalendarPlanItem[]): void {
    this.set(STORAGE_KEYS.CALENDAR_PLANS, plans);
  }
  addCalendarPlan(plan: CalendarPlanItem): void {
    const plans = this.getCalendarPlans();
    this.saveCalendarPlans([plan, ...plans]);
  }
  updateCalendarPlan(updated: CalendarPlanItem): void {
    const plans = this.getCalendarPlans().map((p) => (p.id === updated.id ? updated : p));
    this.saveCalendarPlans(plans);
  }
  deleteCalendarPlan(id: string): void {
    const plans = this.getCalendarPlans().filter((p) => p.id !== id);
    this.saveCalendarPlans(plans);
  }

  // Circuit Config
  getCalisthenicsCircuit(): CalisthenicsCircuitConfig {
    return this.get<CalisthenicsCircuitConfig>(STORAGE_KEYS.CIRCUIT_CONFIG, DEFAULT_CIRCUIT_CONFIG);
  }
  saveCalisthenicsCircuit(config: CalisthenicsCircuitConfig): void {
    this.set(STORAGE_KEYS.CIRCUIT_CONFIG, config);
  }

  // Rewards Pool (Master Catalog)
  getAllRewardsPool(): RewardItem[] {
    return this.get<RewardItem[]>(STORAGE_KEYS.ALL_REWARDS, ALL_REWARD_ITEMS);
  }
  saveAllRewardsPool(rewards: RewardItem[]): void {
    this.set(STORAGE_KEYS.ALL_REWARDS, rewards);
  }
  addCustomReward(reward: RewardItem): void {
    const pool = this.getAllRewardsPool();
    this.saveAllRewardsPool([reward, ...pool]);
  }
  updateReward(updated: RewardItem): void {
    const pool = this.getAllRewardsPool().map((r) => (r.id === updated.id ? updated : r));
    this.saveAllRewardsPool(pool);
  }
  deleteReward(id: string): void {
    const pool = this.getAllRewardsPool().filter((r) => r.id !== id);
    this.saveAllRewardsPool(pool);
  }

  // Target Weight Updater
  updateTargetWeight(targetWeightKg: number): void {
    const prof = this.getProfile();
    this.saveProfile({ ...prof, targetWeightKg });
  }

  // Gratitudes and Regrets Review extracted from mind log or empty
  getLastWeekReviews(): { gratitudes: { date: string; text: string }[]; regrets: { date: string; text: string }[] } {
    const mind = this.getMindLog();
    const gratitudes: { date: string; text: string }[] = [];
    const regrets: { date: string; text: string }[] = [];
    if (mind.gratitude && mind.gratitude.trim()) {
      gratitudes.push({ date: mind.date, text: mind.gratitude });
    }
    if (mind.regrets && mind.regrets.trim()) {
      regrets.push({ date: mind.date, text: mind.regrets });
    }
    return { gratitudes, regrets };
  }

  // Reset entire app to blank/zero state
  resetToBlankState(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    // Also remove any legacy v1 keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('asclepius_')) {
        localStorage.removeItem(key);
      }
    }
  }

  // Supabase Configuration
  getSupabaseConfig(): { url: string; anonKey: string; connected: boolean } {
    return this.get(STORAGE_KEYS.SUPABASE_CONFIG, {
      url: '',
      anonKey: '',
      connected: false
    });
  }
  saveSupabaseConfig(config: { url: string; anonKey: string; connected: boolean }): void {
    this.set(STORAGE_KEYS.SUPABASE_CONFIG, config);
  }
}

export const storage = new StorageService();
