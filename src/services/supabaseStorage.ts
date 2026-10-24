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
} from '../types/index.ts';

const STORAGE_KEYS = {
  PROFILE: 'asclepius_profile_v1',
  CAPACITY: 'asclepius_capacity_v1',
  MARROW: 'asclepius_marrow_v1',
  WEIGHT: 'asclepius_weight_v1',
  RUNNING: 'asclepius_running_v1',
  STRENGTH: 'asclepius_strength_v1',
  CIRCUIT_CONFIG: 'asclepius_circuit_config_v1',
  NUTRITION: 'asclepius_nutrition_v1',
  NUTRITION_DAYS: 'asclepius_nutrition_days_v1',
  URGE: 'asclepius_urge_v1',
  SCREENTIME: 'asclepius_screentime_v1',
  MIND: 'asclepius_mind_v1',
  CONTACTS: 'asclepius_contacts_v1',
  STUDY_BLOCKS: 'asclepius_study_blocks_v1',
  ANKI_REVIEWS: 'asclepius_anki_reviews_v1',
  SUBJECT_CHAPTERS: 'asclepius_subject_chapters_v1',
  RECREATION: 'asclepius_recreation_v1',
  CALENDAR_PLANS: 'asclepius_calendar_plans_v1',
  ALL_REWARDS: 'asclepius_all_rewards_v1',
  SUPABASE_CONFIG: 'asclepius_supabase_config_v1',
  COMPLETED_ACTIONS: 'asclepius_completed_actions_v1'
};

// Seed realistic medical student data
const DEFAULT_PROFILE: ProfileState = {
  fullName: 'Dr. Soumendra Chakraborty',
  xpPoints: 3120,
  level: 6,
  currentRunningWeek: 4,
  streakDays: 14,
  lastActiveDate: '2026-10-22',
  currentWeightKg: 74.4,
  targetWeightKg: 67.5,
  universityProfExamDate: '2026-11-28' // ~36 days away (triggers < 6 week Theory block priority)
};

const DEFAULT_CAPACITY: CapacityState = {
  energyPercent: 85,
  availableFreeHours: 6.0,
  isOnCall: false,
  isSick: false,
  sickDaysCount: 0
};

const DEFAULT_MARROW: MarrowEntry[] = [
  {
    id: 'm-01',
    date: '2026-10-21',
    moduleCode: 'MED-NEPHRO-40',
    subject: 'Medicine',
    subjectsBreakdown: [
      { subject: 'Medicine', totalQuestions: 30, correctCount: 26 },
      { subject: 'Pathology', totalQuestions: 10, correctCount: 8 }
    ],
    cluster: 'CLUSTER_A',
    totalQuestions: 40,
    correctCount: 34,
    scorePercent: 85.0,
    mistakeReviewed: true,
    reviewDueDate: '2026-10-24',
    notes: 'Glomerulonephritis RPGN crescents pearl'
  },
  {
    id: 'm-02',
    date: '2026-10-20',
    moduleCode: 'SURG-HERNIA-25',
    subject: 'Surgery',
    subjectsBreakdown: [
      { subject: 'Surgery', totalQuestions: 25, correctCount: 21 },
      { subject: 'Anatomy', totalQuestions: 15, correctCount: 13 }
    ],
    cluster: 'CLUSTER_A',
    totalQuestions: 40,
    correctCount: 34,
    scorePercent: 85.0,
    mistakeReviewed: true,
    reviewDueDate: '2026-10-23',
    notes: 'Direct vs indirect inguinal hernia triangle anatomy'
  },
  {
    id: 'm-03',
    date: '2026-10-19',
    moduleCode: 'CLIN-MULTI-40',
    subject: 'Medicine',
    subjectsBreakdown: [
      { subject: 'Medicine', totalQuestions: 15, correctCount: 13 },
      { subject: 'Surgery', totalQuestions: 15, correctCount: 12 },
      { subject: 'Forensic Medicine & Toxicology', totalQuestions: 10, correctCount: 8 }
    ],
    cluster: 'CLUSTER_A',
    totalQuestions: 40,
    correctCount: 33,
    scorePercent: 82.5,
    mistakeReviewed: false,
    reviewDueDate: '2026-10-22',
    notes: 'Multidisciplinary casualty case scenarios'
  },
  {
    id: 'm-04',
    date: '2026-10-18',
    moduleCode: 'OBG-LABOR-50',
    subject: 'Obstetrics & Gynecology (OBG)',
    subjectsBreakdown: [
      { subject: 'Obstetrics & Gynecology (OBG)', totalQuestions: 50, correctCount: 39 }
    ],
    cluster: 'CLUSTER_B',
    totalQuestions: 50,
    correctCount: 39,
    scorePercent: 78.0,
    mistakeReviewed: false,
    reviewDueDate: '2026-10-22',
    notes: 'Active phase of labor Partograph alert line'
  },
  {
    id: 'm-05',
    date: '2026-10-15',
    moduleCode: 'PATH-PHARM-30',
    subject: 'Pathology',
    subjectsBreakdown: [
      { subject: 'Pathology', totalQuestions: 15, correctCount: 13 },
      { subject: 'Pharmacology', totalQuestions: 15, correctCount: 13 }
    ],
    cluster: 'CLUSTER_A',
    totalQuestions: 30,
    correctCount: 26,
    scorePercent: 86.67,
    mistakeReviewed: true,
    reviewDueDate: '2026-10-19',
    notes: 'Leukemia chemotherapy regimes'
  }
];

export const DEFAULT_SUBJECT_CHAPTERS: SubjectChapterProgress[] = [
  {
    subject: 'Medicine',
    lastStudiedDate: '2026-10-21',
    universityChapterDone: 'Chapter 22 - Heart Failure & Dilated Cardiomyopathy (Kundu / Harrison)',
    lastModuleCode: 'MED-NEPHRO-40',
    lastModuleDate: '2026-10-21',
    lastModuleScore: 85.0,
    lastModuleCorrect: 34,
    lastModuleTotal: 40
  },
  {
    subject: 'Surgery',
    lastStudiedDate: '2026-10-20',
    universityChapterDone: 'Chapter 14 - Hernias & Abdominal Wall Defects (SRB Manual of Surgery)',
    lastModuleCode: 'SURG-HERNIA-25',
    lastModuleDate: '2026-10-20',
    lastModuleScore: 85.0,
    lastModuleCorrect: 34,
    lastModuleTotal: 40
  },
  {
    subject: 'Forensic Medicine & Toxicology',
    lastStudiedDate: '2026-10-19',
    universityChapterDone: 'Chapter 7 - Mechanical Injuries & Firearm Wounds (Reddy)',
    lastModuleCode: 'CLIN-MULTI-40',
    lastModuleDate: '2026-10-19',
    lastModuleScore: 80.0,
    lastModuleCorrect: 8,
    lastModuleTotal: 10
  },
  {
    subject: 'Obstetrics & Gynecology (OBG)',
    lastStudiedDate: '2026-10-18',
    universityChapterDone: 'Chapter 18 - Normal & Abnormal Labor Partograph (Dutta)',
    lastModuleCode: 'OBG-LABOR-50',
    lastModuleDate: '2026-10-18',
    lastModuleScore: 78.0,
    lastModuleCorrect: 39,
    lastModuleTotal: 50
  },
  {
    subject: 'Pathology',
    lastStudiedDate: '2026-10-15',
    universityChapterDone: 'Chapter 11 - Hematology, Anemias & Leukemias (Robbins)',
    lastModuleCode: 'PATH-PHARM-30',
    lastModuleDate: '2026-10-15',
    lastModuleScore: 86.7,
    lastModuleCorrect: 26,
    lastModuleTotal: 30
  },
  {
    subject: 'Pediatrics',
    lastStudiedDate: '2026-10-12',
    universityChapterDone: 'Chapter 9 - Developmental Milestones & Growth Charts (OP Ghai)',
    lastModuleCode: 'PEDS-DEV-20',
    lastModuleDate: '2026-10-12',
    lastModuleScore: 80.0,
    lastModuleCorrect: 16,
    lastModuleTotal: 20
  },
  {
    subject: 'Ophthalmology',
    lastStudiedDate: '2026-10-10',
    universityChapterDone: 'Chapter 13 - Cataract Surgery & Glaucoma (Khurana)',
    lastModuleCode: 'OPHTH-LENS-20',
    lastModuleDate: '2026-10-10',
    lastModuleScore: 75.0,
    lastModuleCorrect: 15,
    lastModuleTotal: 20
  },
  {
    subject: 'ENT',
    lastStudiedDate: '2026-10-08',
    universityChapterDone: 'Chapter 8 - Otitis Media & Hearing Loss (Dhingra)',
    lastModuleCode: 'ENT-EAR-25',
    lastModuleDate: '2026-10-08',
    lastModuleScore: 76.0,
    lastModuleCorrect: 19,
    lastModuleTotal: 25
  }
];

export const DEFAULT_STUDY_BLOCKS: StudyBlockLog[] = [
  { id: 'sb-1', date: '2026-10-16', subject: 'Medicine', durationMinutes: 90, notes: 'Heart sounds & murmurs revision', xpAwarded: 90 },
  { id: 'sb-2', date: '2026-10-17', subject: 'Surgery', durationMinutes: 120, notes: 'SRB Hernia repair techniques', xpAwarded: 180 },
  { id: 'sb-3', date: '2026-10-18', subject: 'OBG', durationMinutes: 75, notes: 'Dutta Labor stages review', xpAwarded: 75 },
  { id: 'sb-4', date: '2026-10-19', subject: 'Forensic Medicine', durationMinutes: 60, notes: 'Reddy Firearms & postmortem findings', xpAwarded: 60 },
  { id: 'sb-5', date: '2026-10-20', subject: 'Pathology', durationMinutes: 105, notes: 'Robbins Glomerulonephritis microscopy', xpAwarded: 158 },
  { id: 'sb-6', date: '2026-10-21', subject: 'Medicine', durationMinutes: 110, notes: 'Harrison Heart failure pharmacology', xpAwarded: 165 },
  { id: 'sb-7', date: '2026-10-22', subject: 'Surgery', durationMinutes: 90, notes: 'Pre-op evaluation & fluids management', xpAwarded: 90 }
];

export const DEFAULT_ANKI_REVIEWS: AnkiReviewLog[] = [
  { id: 'ak-1', date: '2026-10-16', cardsReviewed: 140, durationMinutes: 45, deckName: 'AnKing Step 2 / NEET PG', xpAwarded: 70 },
  { id: 'ak-2', date: '2026-10-17', cardsReviewed: 165, durationMinutes: 50, deckName: 'AnKing Step 2 / NEET PG', xpAwarded: 82 },
  { id: 'ak-3', date: '2026-10-18', cardsReviewed: 120, durationMinutes: 40, deckName: 'Surgery High-Yield', xpAwarded: 60 },
  { id: 'ak-4', date: '2026-10-19', cardsReviewed: 190, durationMinutes: 55, deckName: 'Medicine Pearls', xpAwarded: 95 },
  { id: 'ak-5', date: '2026-10-20', cardsReviewed: 175, durationMinutes: 52, deckName: 'AnKing Step 2 / NEET PG', xpAwarded: 88 },
  { id: 'ak-6', date: '2026-10-21', cardsReviewed: 210, durationMinutes: 60, deckName: 'AnKing Step 2 / NEET PG', xpAwarded: 105 },
  { id: 'ak-7', date: '2026-10-22', cardsReviewed: 155, durationMinutes: 48, deckName: 'Pharma & Micro Pearls', xpAwarded: 78 }
];

const DEFAULT_WEIGHT: WeightEntry[] = [
  { id: 'w-1', date: '2026-10-10', weightKg: 75.8 },
  { id: 'w-2', date: '2026-10-12', weightKg: 75.5 },
  { id: 'w-3', date: '2026-10-14', weightKg: 75.2 },
  { id: 'w-4', date: '2026-10-16', weightKg: 75.0 },
  { id: 'w-5', date: '2026-10-18', weightKg: 74.8 },
  { id: 'w-6', date: '2026-10-20', weightKg: 74.6 },
  { id: 'w-7', date: '2026-10-22', weightKg: 74.4 }
];

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

const DEFAULT_RUNNING: RunningSession[] = [
  {
    id: 'r-1',
    date: '2026-10-21',
    weekNumber: 4,
    completed: true,
    durationMinutes: 28,
    distanceKm: 3.4,
    jogDistanceKm: 2.2,
    walkDistanceKm: 1.2,
    xpAwarded: 196,
    notes: '6x(3m jog ⇌ 1.5m walk) completed with strong cadence.'
  },
  {
    id: 'r-2',
    date: '2026-10-19',
    weekNumber: 4,
    completed: true,
    durationMinutes: 28,
    distanceKm: 3.2,
    jogDistanceKm: 2.0,
    walkDistanceKm: 1.2,
    xpAwarded: 196,
    notes: 'Maintained smooth nose breathing in campus ground.'
  },
  {
    id: 'r-3',
    date: '2026-10-16',
    weekNumber: 3,
    completed: true,
    durationMinutes: 26,
    distanceKm: 3.0,
    jogDistanceKm: 1.8,
    walkDistanceKm: 1.2,
    xpAwarded: 160,
    notes: 'Week 3 interval run.'
  },
  {
    id: 'r-4',
    date: '2026-10-14',
    weekNumber: 3,
    completed: true,
    durationMinutes: 26,
    distanceKm: 2.9,
    jogDistanceKm: 1.7,
    walkDistanceKm: 1.2,
    xpAwarded: 160,
    notes: 'Good pacing, no shin splints.'
  },
  {
    id: 'r-5',
    date: '2026-10-10',
    weekNumber: 2,
    completed: true,
    durationMinutes: 24,
    distanceKm: 2.6,
    jogDistanceKm: 1.4,
    walkDistanceKm: 1.2,
    xpAwarded: 130,
    notes: 'Week 2 step-up.'
  }
];

const DEFAULT_CALISTHENICS: CalisthenicsLog = {
  id: 'c-today',
  date: '2026-10-22',
  setsCompleted: 4,
  squats: 80,
  pushups: 40,
  pullups: 40,
  lunges: 80,
  hangSeconds: 120,
  coreSets: 2,
  completed: true,
  customCircuit: DEFAULT_CIRCUIT_CONFIG
};

export const DEFAULT_CALENDAR_PLANS: CalendarPlanItem[] = [
  // High Stakes Deadlines (Projected Month & Year)
  {
    id: 'plan-dl-1',
    date: '2026-11-28',
    category: 'deadline',
    title: 'University Professional Exams - Paper 1 (Medicine & Surgery)',
    description: 'High-stakes final MBBS prof exam. 1st & 2nd priority theory blocks must peak before this.',
    isDeadline: true,
    deadlineTime: '09:00',
    priority: 'high',
    status: 'scheduled',
    xp: 500
  },
  {
    id: 'plan-dl-2',
    date: '2026-10-25',
    category: 'deadline',
    title: 'Marrow All-India Grand Test (GT-14)',
    description: 'Sunday 2h exam + 3-4h review logging spread across next week.',
    isDeadline: true,
    deadlineTime: '10:00',
    priority: 'high',
    status: 'scheduled',
    xp: 250
  },
  {
    id: 'plan-dl-3',
    date: '2026-11-05',
    category: 'deadline',
    title: 'Surgery Ward Long Case & Logbook Submission',
    description: 'Hernia, Thyroid, and Breast case sheets presentation signed by Unit Head.',
    isDeadline: true,
    deadlineTime: '16:00',
    priority: 'high',
    status: 'scheduled',
    xp: 200
  },
  {
    id: 'plan-dl-4',
    date: '2026-11-15',
    category: 'deadline',
    title: 'OBG Partograph & Eclampsia Protocol Clinical Viva',
    description: 'Labor room posting clinical assessment and emergency drills.',
    isDeadline: true,
    deadlineTime: '14:00',
    priority: 'high',
    status: 'scheduled',
    xp: 180
  },
  {
    id: 'plan-dl-5',
    date: '2027-01-10',
    category: 'deadline',
    title: 'INI-CET Nationwide Diagnostic Benchmark Exam',
    description: 'All 19 subjects full-spectrum simulation test.',
    isDeadline: true,
    deadlineTime: '09:00',
    priority: 'high',
    status: 'scheduled',
    xp: 400
  },

  // Today (2026-10-23) Planned Items
  {
    id: 'plan-today-1',
    date: '2026-10-23',
    category: 'career',
    title: 'Group 1 Marrow Modules (Med+Surg, Path+Pharm+Micro, Eye+ENT+FMT)',
    description: 'Solve 40+40+25 MCQs (2.5-3 hrs total solve & mistake audit).',
    durationMinutes: 160,
    priority: 'high',
    status: 'scheduled',
    xp: 150
  },
  {
    id: 'plan-today-2',
    date: '2026-10-23',
    category: 'career',
    title: '1.5 hr Clinical Theory: Kundu Heart Failure & SRB Hernias',
    description: 'Most priority theory block for university exam grounding.',
    durationMinutes: 90,
    priority: 'high',
    status: 'scheduled',
    xp: 100
  },
  {
    id: 'plan-today-3',
    date: '2026-10-23',
    category: 'fitness',
    title: 'Week 4 Interval Run (6x 3m jog ⇌ 1.5m walk)',
    description: 'Prescribed interval jog ⇄ walk protocol to build aerobic base.',
    durationMinutes: 30,
    priority: 'high',
    status: 'scheduled',
    xp: 196
  },
  {
    id: 'plan-today-4',
    date: '2026-10-23',
    category: 'fitness',
    title: 'Strict Nutrition: Clean 1,880 kcal, 140g Protein',
    description: 'Meals: Oats & whey, grilled chicken rice, paneer. Stay <= 2000 cal.',
    durationMinutes: 20,
    priority: 'high',
    status: 'scheduled',
    xp: 40
  },
  {
    id: 'plan-today-5',
    date: '2026-10-23',
    category: 'discipline',
    title: '15 min Stoic Box Breathing & Evening Clarity',
    description: 'Autonomic nervous reset after clinical ward postings.',
    durationMinutes: 15,
    priority: 'medium',
    status: 'scheduled',
    xp: 50
  },
  {
    id: 'plan-today-6',
    date: '2026-10-23',
    category: 'social',
    title: 'Call Ma & Papa (Daily Family Touchpoint)',
    description: 'Prevent emotional isolation during intense residency prep.',
    durationMinutes: 15,
    priority: 'medium',
    status: 'scheduled',
    xp: 30
  },
  {
    id: 'plan-today-7',
    date: '2026-10-23',
    category: 'recreation',
    title: 'Artisanal Aeropress Coffee Tasting Session',
    description: 'Restorative sensory pause with light-roast single origin bean.',
    durationMinutes: 25,
    priority: 'medium',
    status: 'scheduled',
    xp: 50
  },

  // Tomorrow (2026-10-24) Planned Items
  {
    id: 'plan-tom-1',
    date: '2026-10-24',
    category: 'career',
    title: 'Group 2 Marrow Modules (PSM+OBG, Anat+Physio+Biochem, Derma+Psych)',
    description: 'Modules 4, 5, 6: 40+50+25 MCQs with mistake tagging.',
    durationMinutes: 160,
    priority: 'high',
    status: 'scheduled',
    xp: 150
  },
  {
    id: 'plan-tom-2',
    date: '2026-10-24',
    category: 'career',
    title: '2nd Priority Eye / ENT Alternative Theory Block',
    description: 'Ophthalmology Cornea & Glaucoma high yield theory.',
    durationMinutes: 60,
    priority: 'high',
    status: 'scheduled',
    xp: 80
  },
  {
    id: 'plan-tom-3',
    date: '2026-10-24',
    category: 'fitness',
    title: 'Full Bodyweight Strength Circuit (4 Sets Compound + 2 Core)',
    description: 'Squats, Pushups, Pullups, Lunges, Hangs and Leg Raises.',
    durationMinutes: 30,
    priority: 'high',
    status: 'scheduled',
    xp: 80
  },
  {
    id: 'plan-tom-4',
    date: '2026-10-24',
    category: 'social',
    title: 'Weekly Catchup Call with Brother',
    description: 'Gaming updates and downtime banter.',
    durationMinutes: 20,
    priority: 'medium',
    status: 'scheduled',
    xp: 30
  },

  // Sunday (2026-10-25) Isolated Audit & GT
  {
    id: 'plan-sun-1',
    date: '2026-10-25',
    category: 'career',
    title: 'Sunday Isolated Grand Test & Mistake Ledger Review',
    description: '2h full mock test. Sunday reserved strictly for backlogs and audits.',
    durationMinutes: 150,
    priority: 'high',
    status: 'scheduled',
    xp: 200
  },
  {
    id: 'plan-sun-2',
    date: '2026-10-25',
    category: 'discipline',
    title: 'Weekly Dopamine & ScreenZen Audit',
    description: 'Inspect weekly screen time, verify YouTube cap compliance.',
    durationMinutes: 20,
    priority: 'medium',
    status: 'scheduled',
    xp: 50
  },
  {
    id: 'plan-sun-3',
    date: '2026-10-25',
    category: 'recreation',
    title: 'Botanical Garden Evening Walk & Photography',
    description: 'Restorative outdoor walk to clear exam cognitive strain.',
    durationMinutes: 45,
    priority: 'medium',
    status: 'scheduled',
    xp: 50
  }
];

const DEFAULT_NUTRITION: NutritionLog = {
  id: 'n-today',
  date: '2026-10-22',
  calories: 1880,
  carbsGrams: 185,
  proteinGrams: 142,
  fatsGrams: 58,
  proteinTargetGrams: 130,
  isLowProtein: false,
  mealsSummary: 'Eggs & Oats, Grilled chicken & brown rice with dal, Whey isolate with curd'
};

export const DEFAULT_NUTRITION_DAYS: DailyNutritionEntry[] = [
  {
    id: 'nd-1',
    date: '2026-10-16',
    calories: 1850,
    carbsGrams: 175,
    proteinGrams: 138,
    fatsGrams: 54,
    mealsSummary: 'Clean chicken rice & eggs',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  },
  {
    id: 'nd-2',
    date: '2026-10-17',
    calories: 1920,
    carbsGrams: 190,
    proteinGrams: 145,
    fatsGrams: 58,
    mealsSummary: 'Paneer, whey isolate, dal roti',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  },
  {
    id: 'nd-3',
    date: '2026-10-18', // Exceeded 2000 cal + fat
    calories: 2280,
    carbsGrams: 225,
    proteinGrams: 132,
    fatsGrams: 78,
    mealsSummary: 'Hostel canteen biryani & paratha (Excess)',
    exceededCal: true,
    exceededCarbs: true,
    exceededFats: true,
    penaltyDeducted: true
  },
  {
    id: 'nd-4',
    date: '2026-10-19',
    calories: 1840,
    carbsGrams: 170,
    proteinGrams: 140,
    fatsGrams: 52,
    mealsSummary: 'Boiled eggs, chicken salad, whey',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  },
  {
    id: 'nd-5',
    date: '2026-10-20',
    calories: 1950,
    carbsGrams: 195,
    proteinGrams: 136,
    fatsGrams: 60,
    mealsSummary: 'Oats, grilled chicken breast, curd',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  },
  {
    id: 'nd-6',
    date: '2026-10-21',
    calories: 1890,
    carbsGrams: 180,
    proteinGrams: 144,
    fatsGrams: 56,
    mealsSummary: 'Eggs, stir-fry veggies with tofu, protein shake',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  },
  {
    id: 'nd-7',
    date: '2026-10-22',
    calories: 1880,
    carbsGrams: 185,
    proteinGrams: 142,
    fatsGrams: 58,
    mealsSummary: 'Eggs & Oats, Grilled chicken & brown rice with dal, Whey isolate with curd',
    exceededCal: false,
    exceededCarbs: false,
    exceededFats: false
  }
];

const DEFAULT_URGE_LOGS: UrgeLog[] = [
  {
    id: 'u-1',
    timestamp: '2026-10-21T16:30:00Z',
    triggerType: 'BOREDOM',
    intensity: 3,
    wasSlip: false,
    penaltyXp: 0,
    context: 'Post-casualty fatigue trigger. Took 5-min walk instead of opening social apps.',
    redemptionCompleted: true
  },
  {
    id: 'u-2',
    timestamp: '2026-10-18T22:15:00Z',
    triggerType: 'SEXUAL_URGE',
    intensity: 4,
    wasSlip: false,
    penaltyXp: 0,
    context: 'Late night study fatigue sexual urge resisted by 25 pushups and cold face wash.',
    redemptionCompleted: true
  }
];

const DEFAULT_SCREENTIME: ScreenTimeLog = {
  id: 'st-today',
  date: '2026-10-22',
  youtubeMinutes: 22,
  totalScreenTimeMinutes: 115,
  isOverLimit: false
};

const DEFAULT_MIND: MindLog = {
  id: 'm-today',
  date: '2026-10-22',
  meditationMinutes: 15,
  gratitude: 'Clear radiological interpretations in evening ward rounds.',
  regrets: 'Delayed theory block by 15 min.',
  notableEvents: 'Observed clean central venous line catheterization.',
  tomorrowIntentions: 'Cluster B high-yield pediatric milestones and Week 4 Run.'
};

const DEFAULT_CONTACTS: SocialContact[] = [
  {
    id: 'sc-1',
    name: 'Ma',
    relationship: 'Family',
    targetFrequencyDays: 1,
    lastContactDate: '2026-10-22',
    customNotes: 'Morning check-in before ward rounds'
  },
  {
    id: 'sc-2',
    name: 'Papa',
    relationship: 'Family',
    targetFrequencyDays: 1,
    lastContactDate: '2026-10-22',
    customNotes: 'Daily evening call'
  },
  {
    id: 'sc-3',
    name: 'Brother',
    relationship: 'Family',
    targetFrequencyDays: 2,
    lastContactDate: '2026-10-21',
    customNotes: 'Weekend gaming & life updates'
  },
  {
    id: 'sc-4',
    name: 'Arjun (Med School Buddy)',
    relationship: 'Close Friends',
    targetFrequencyDays: 4,
    lastContactDate: '2026-10-20',
    customNotes: 'Discussing GT scores & Marrow modules'
  },
  {
    id: 'sc-5',
    name: 'Grandparents',
    relationship: 'Family',
    targetFrequencyDays: 7,
    lastContactDate: '2026-10-18',
    customNotes: 'Sunday evening blessings & health update'
  },
  {
    id: 'sc-6',
    name: 'Ward Posting Interns',
    relationship: 'Colleagues / On-Call',
    targetFrequencyDays: 5,
    lastContactDate: '2026-10-19',
    customNotes: 'Shift handovers and case reviews'
  }
];

export const DEFAULT_RECREATION: RecreationEntry[] = [
  {
    id: 'rec-1',
    date: '2026-10-21',
    title: 'Aeropress Coffee Brewing Exploration',
    category: 'HOBBY',
    notes: 'Tried a light-roast Ethiopian bean with inverted 2-min brew technique. Highly restorative focus sensory experience.',
    rating: 5,
    xpAwarded: 50
  },
  {
    id: 'rec-2',
    date: '2026-10-19',
    title: 'Sunset Campus Botany Walk',
    category: 'OUTDOOR',
    notes: 'Identified medicinal plant species around college botanical garden during evening twilight.',
    rating: 4,
    xpAwarded: 50
  },
  {
    id: 'rec-3',
    date: '2026-10-16',
    title: 'Read "The Emperor of All Maladies" Chapter 3',
    category: 'READING_FILM',
    notes: 'Historical deep dive into early leukemia discoveries by Sidney Farber. Great clinical perspective.',
    rating: 5,
    xpAwarded: 50
  }
];

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
    return this.get<string[]>(STORAGE_KEYS.COMPLETED_ACTIONS, [
      'anki-block',
      'running-session'
    ]);
  }
  saveCompletedActionIds(ids: string[]): void {
    this.set(STORAGE_KEYS.COMPLETED_ACTIONS, ids);
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

  // Last Week Gratitudes and Regrets Review
  getLastWeekReviews(): { gratitudes: { date: string; text: string }[]; regrets: { date: string; text: string }[] } {
    return {
      gratitudes: [
        { date: '21/10/26', text: 'Clear radiological interpretations in evening casualty ward rounds.' },
        { date: '19/10/26', text: 'Spotted paradoxical abdominal respiration in acute abdomen case early.' },
        { date: '18/10/26', text: 'Smooth completion of 11-Week running intervals without shin splints.' },
        { date: '16/10/26', text: 'High retention on AnKing nephrotic syndrome cards.' }
      ],
      regrets: [
        { date: '21/10/26', text: 'Delayed evening theory block by 15 min due to unnecessary phone checks.' },
        { date: '18/10/26', text: 'Exceeded recommended fat/carb intake with hostel canteen biryani (-75 XP).' },
        { date: '17/10/26', text: 'Procrastinated opening the 40-MCQ module until after dinner.' }
      ]
    };
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
