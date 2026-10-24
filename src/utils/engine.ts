/**
 * Asclepius OS - Core Operating Pillars & Business Logic Engine
 * Pure logic decoupled for testability and zero-dependency calculation.
 */

export interface CapacityState {
  energyPercent: number; // 0 to 100
  availableFreeHours: number; // e.g. 6.0
  isOnCall: boolean;
  isSick: boolean;
  sickDaysCount?: number;
}

export type ScheduleMode = 'BASELINE' | 'MODERATE' | 'SURVIVAL' | 'ON_CALL_PAUSE' | 'SICK_FREEZE';

export interface ActionItem {
  id: string;
  pillar: 'Career' | 'Fitness' | 'Discipline' | 'Mind' | 'Social';
  title: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'survival';
  priorityLevel?: 1 | 2 | 3; // 1 = Critical/High, 2 = Medium/Important, 3 = Low/Standard
  completed: boolean;
  xpReward: number;
  description: string;
  isDeadline?: boolean;
  dueDate?: string;
}

export interface MarrowEntry {
  id: string;
  date: string; // YYYY-MM-DD
  moduleCode: string;
  subject: string;
  subjectsBreakdown?: { subject: string; totalQuestions: number; correctCount: number }[];
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  mistakeReviewed: boolean;
  reviewDueDate: string;
}

// Simplified Medical Curriculum Hierarchy
export const MOST_PRIORITY_SUBJECTS = [
  'Medicine',
  'Surgery',
  'Obstetrics & Gynecology (OBG)',
  'Pediatrics'
];

export const SECOND_PRIORITY_SUBJECTS = [
  'Ophthalmology',
  'ENT'
];

export const THIRD_PRIORITY_SUBJECTS = [
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Microbiology',
  'Pathology',
  'Pharmacology',
  'Forensic Medicine & Toxicology',
  'Community Medicine (PSM)'
];

export const ALL_19_SUBJECTS = [
  ...MOST_PRIORITY_SUBJECTS,
  ...SECOND_PRIORITY_SUBJECTS,
  ...THIRD_PRIORITY_SUBJECTS,
  'Orthopedics',
  'Dermatology',
  'Psychiatry',
  'Radiology',
  'Anesthesia'
];

// Marrow App Module Preset Groups
export interface MarrowModulePreset {
  id: string;
  group: 'GROUP_1' | 'GROUP_2' | 'GRAND_TEST';
  number: number;
  name: string;
  subjects: string[];
  questionOptions: number[];
  defaultQuestions: number;
  estimatedMinutes: number;
  description: string;
}

export const MARROW_PRESETS: MarrowModulePreset[] = [
  // Group 1: Mon / Wed / Fri
  {
    id: 'g1-m1',
    group: 'GROUP_1',
    number: 1,
    name: 'Custom Module 1 (Med + Surg)',
    subjects: ['Medicine', 'Surgery'],
    questionOptions: [25, 40],
    defaultQuestions: 40,
    estimatedMinutes: 60,
    description: 'High-yield clinical Medicine & Surgery MCQ integration'
  },
  {
    id: 'g1-m2',
    group: 'GROUP_1',
    number: 2,
    name: 'Custom Module 2 (Path + Pharm + Micro)',
    subjects: ['Pathology', 'Pharmacology', 'Microbiology'],
    questionOptions: [25, 40],
    defaultQuestions: 40,
    estimatedMinutes: 60,
    description: 'Para-clinical core diagnostics and therapeutics'
  },
  {
    id: 'g1-m3',
    group: 'GROUP_1',
    number: 3,
    name: 'Custom Module 3 (Eye + ENT + FMT)',
    subjects: ['Ophthalmology', 'ENT', 'Forensic Medicine & Toxicology'],
    questionOptions: [10, 25],
    defaultQuestions: 25,
    estimatedMinutes: 40,
    description: 'Clinical short subjects & medicolegal high-yield cases'
  },
  // Group 2: Tue / Thu / Sat
  {
    id: 'g2-m4',
    group: 'GROUP_2',
    number: 4,
    name: 'Custom Module 4 (PSM + OBG)',
    subjects: ['Community Medicine (PSM)', 'Obstetrics & Gynecology (OBG)'],
    questionOptions: [25, 40],
    defaultQuestions: 40,
    estimatedMinutes: 60,
    description: 'Epidemiology, biostatistics, obstetrics & gynecology'
  },
  {
    id: 'g2-m5',
    group: 'GROUP_2',
    number: 5,
    name: 'Custom Module 5 (Anat + Phys + Biochem + Peds + Ortho)',
    subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pediatrics', 'Orthopedics'],
    questionOptions: [25, 50],
    defaultQuestions: 50,
    estimatedMinutes: 75,
    description: 'Pre-clinical foundations paired with pediatric milestones and fractures'
  },
  {
    id: 'g2-m6',
    group: 'GROUP_2',
    number: 6,
    name: 'Custom Module 6 (Derma + Psych + Radio + Anaesth)',
    subjects: ['Dermatology', 'Psychiatry', 'Radiology', 'Anesthesia'],
    questionOptions: [10, 25],
    defaultQuestions: 25,
    estimatedMinutes: 40,
    description: 'Clinical short subjects, imaging signs, psychopathology and pharmacology'
  }
];

export const CLUSTER_A_SUBJECTS = [
  'Medicine',
  'Surgery',
  'Pathology',
  'Pharmacology',
  'Microbiology',
  'ENT',
  'Ophthalmology',
  'Forensic Medicine & Toxicology'
];

export const CLUSTER_B_SUBJECTS = [
  'Community Medicine (PSM)',
  'Obstetrics & Gynecology (OBG)',
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Psychiatry',
  'Radiology',
  'Anesthesia'
];

export const FOURTH_YEAR_CORE_SUBJECTS = MOST_PRIORITY_SUBJECTS;

/**
 * Determine subject cluster and Marrow Group for a given date
 */
export function getSubjectClusterForDate(date: Date = new Date()): {
  cluster: 'CLUSTER_A' | 'CLUSTER_B' | 'SUNDAY_GT';
  marrowGroup: 'GROUP_1' | 'GROUP_2' | 'GRAND_TEST';
  name: string;
  description: string;
  subjects: string[];
} {
  const day = date.getDay();
  if (day === 0) {
    return {
      cluster: 'SUNDAY_GT',
      marrowGroup: 'GRAND_TEST',
      name: 'Sunday Grand Test & Isolated Backlogs',
      description: 'Grand Test (2h test + 3-4h review spread) or Subject Test + Mistake Audit. Isolated for overflows.',
      subjects: ['Grand Test (GT)', 'Subject Test', 'Mistake Ledger Audit']
    };
  }
  if (day === 1 || day === 3 || day === 5) {
    return {
      cluster: 'CLUSTER_A',
      marrowGroup: 'GROUP_1',
      name: 'Group 1 Marrow Modules (Mon / Wed / Fri)',
      description: 'Modules 1-3: Med+Surg, Path+Pharm+Micro, Eye+ENT+FMT (2.5-3h solve & review)',
      subjects: CLUSTER_A_SUBJECTS
    };
  }
  return {
    cluster: 'CLUSTER_B',
    marrowGroup: 'GROUP_2',
    name: 'Group 2 Marrow Modules (Tue / Thu / Sat)',
    description: 'Modules 4-6: PSM+OBG, Anat+Phys+Biochem+Peds+Ortho, Derma+Psych+Radio+Anes (2.5-3h solve & review)',
    subjects: CLUSTER_B_SUBJECTS
  };
}


/**
 * Format date in dd/mm/yy format with full or short day of the week
 * e.g. "Wednesday, 22/10/26" or "Wed, 22/10/26"
 */
export function formatDateWithDay(dateInput: string | Date, shortDay = false): string {
  if (!dateInput) return '';
  const d =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`)
      : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = shortDay ? shortDayNames[d.getDay()] : dayNames[d.getDay()];

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);

  return `${dayName}, ${day}/${month}/${year}`;
}

/**
 * Format date in standard dd/mm/yy format
 * e.g. "22/10/26"
 */
export function formatDateDDMMYY(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`)
      : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Check if University Professional exams are within 6 weeks (42 days)
 */
export function isUniversityProfExamNear(examDateStr?: string | null, referenceDate: Date = new Date()): boolean {
  if (!examDateStr) return false;
  const examDate = new Date(examDateStr);
  const diffTime = examDate.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 42;
}

/**
 * Determine dynamic capacity schedule mode based on BOTH energy battery and available free time budget
 */
export function calculateScheduleMode(capacity: CapacityState): ScheduleMode {
  if (capacity.isSick) return 'SICK_FREEZE';
  if (capacity.isOnCall) return 'ON_CALL_PAUSE';
  // If energy is <= 30% OR available free time is <= 2.0 hours, trigger SURVIVAL mode
  if (capacity.energyPercent <= 30 || capacity.availableFreeHours <= 2.0) return 'SURVIVAL';
  // If energy is <= 60% OR available free time is <= 4.0 hours, trigger MODERATE mode
  if (capacity.energyPercent <= 60 || capacity.availableFreeHours <= 4.0) return 'MODERATE';
  return 'BASELINE';
}

/**
 * Generate dynamic checklist items tailored to energy capacity, available free time budget & exam proximity
 */
export function generateDailyActions(
  capacity: CapacityState,
  isProfNear: boolean,
  completedIds: Set<string> = new Set()
): ActionItem[] {
  const mode = calculateScheduleMode(capacity);
  const freeMinutesBudget = Math.round(capacity.availableFreeHours * 60);

  if (mode === 'SICK_FREEZE') {
    return [
      {
        id: 'sick-hydration',
        pillar: 'Fitness',
        title: 'Rest & Fluid Hydration',
        durationMinutes: 30,
        priority: 'survival',
        completed: completedIds.has('sick-hydration'),
        xpReward: 50,
        description: 'Absolute target freeze. Streak locks without guilt. Rest & recover.'
      },
      {
        id: 'sick-journal',
        pillar: 'Mind',
        title: 'Stoic Evening Check-in & Symptoms',
        durationMinutes: 5,
        priority: 'survival',
        completed: completedIds.has('sick-journal'),
        xpReward: 50,
        description: 'Brief entry on physical symptoms and mental state.'
      }
    ];
  }

  if (mode === 'ON_CALL_PAUSE') {
    return [
      {
        id: 'oncall-clinical-duty',
        pillar: 'Career',
        title: 'Clinical Ward / Emergency Posting',
        durationMinutes: Math.min(480, freeMinutesBudget > 0 ? freeMinutesBudget : 480),
        priority: 'high',
        completed: completedIds.has('oncall-clinical-duty'),
        xpReward: 250,
        description: 'Clinical duty pause. Streaks preserved against circadian sleep disruptions.'
      },
      {
        id: 'oncall-anki-micro',
        pillar: 'Career',
        title: 'Micro Anki Review (Ward Rounds / Transit)',
        durationMinutes: 20,
        priority: 'medium',
        completed: completedIds.has('oncall-anki-micro'),
        xpReward: 30,
        description: 'Light flashcard repetition between ward cases or vitals.'
      },
      {
        id: 'oncall-hydration-steps',
        pillar: 'Fitness',
        title: 'Clinical Ward Walking (≥ 5,000 steps)',
        durationMinutes: 45,
        priority: 'medium',
        completed: completedIds.has('oncall-hydration-steps'),
        xpReward: 50,
        description: 'Physical baseline met through active clinical rounds.'
      }
    ];
  }

  if (mode === 'SURVIVAL') {
    // Minimum Survival Checklist activates for low energy (<=30%) or tight budget (<=2h)
    const isVeryTightTime = capacity.availableFreeHours <= 1.5;
    return [
      {
        id: 'survival-anki',
        pillar: 'Career',
        title: isVeryTightTime ? '30 min High-Yield Anki Review' : '1 hr Anki Flashcards',
        durationMinutes: isVeryTightTime ? 30 : 60,
        priority: 'survival',
        completed: completedIds.has('survival-anki'),
        xpReward: 60,
        description: 'High-yield spaced repetition to safeguard neuro-pathways.'
      },
      {
        id: 'survival-walk',
        pillar: 'Fitness',
        title: isVeryTightTime ? '≥ 1.5 km Active Low-Cortisol Walk' : '≥ 2 km Active Walking',
        durationMinutes: isVeryTightTime ? 20 : 30,
        priority: 'survival',
        completed: completedIds.has('survival-walk'),
        xpReward: 50,
        description: 'Gentle movement outdoors or corridor walking to clear mental fatigue.'
      },
      {
        id: 'survival-audit',
        pillar: 'Career',
        title: isVeryTightTime ? '20 min Bookmark Audit' : '1 hr Mistake Ledger Review',
        durationMinutes: isVeryTightTime ? 20 : 60,
        priority: 'survival',
        completed: completedIds.has('survival-audit'),
        xpReward: 60,
        description: 'Review previous bookmarks and incorrect question tags.'
      },
      {
        id: 'survival-meditation',
        pillar: 'Mind',
        title: '5 min Stoic Box Breathing',
        durationMinutes: 5,
        priority: 'survival',
        completed: completedIds.has('survival-meditation'),
        xpReward: 50,
        description: 'Centering autonomic nervous system.'
      },
      {
        id: 'survival-journal',
        pillar: 'Mind',
        title: 'Daily Journal (Gratitude & Tomorrow)',
        durationMinutes: 10,
        priority: 'survival',
        completed: completedIds.has('survival-journal'),
        xpReward: 40,
        description: 'Lock in daily reflections before sleep.'
      }
    ];
  }

  // MODERATE or BASELINE
  // Scaled by both energy and free hours budget
  const isModerate = mode === 'MODERATE';
  const isTimeConstrained = capacity.availableFreeHours <= 4.5;
  const actions: ActionItem[] = [
    {
      id: 'anki-block',
      pillar: 'Career',
      title: isTimeConstrained ? '45 min Anki Spaced Repetition' : '1 hr Anki Spaced Repetition',
      durationMinutes: isTimeConstrained ? 45 : 60,
      priority: 'high',
      completed: completedIds.has('anki-block'),
      xpReward: 60,
      description: 'Morning review with multimodal screenshot card integration.'
    }
  ];

  if (isProfNear) {
    // Priority shift: Theory blocks prioritized over custom modules
    actions.push(
      {
        id: 'prof-theory-primary',
        pillar: 'Career',
        title: isTimeConstrained
          ? '1.5 hr Clinical Theory (Kundu / SRB / Dutta / Ghai)'
          : '2.5 hr Clinical Theory (Kundu / SRB / Dutta / Ghai)',
        durationMinutes: isTimeConstrained ? 90 : 150,
        priority: 'high',
        completed: completedIds.has('prof-theory-primary'),
        xpReward: 180,
        description: 'Heavy textbook deep-dive for impending University Prof exams.'
      },
      {
        id: 'prof-theory-secondary',
        pillar: 'Career',
        title: isTimeConstrained
          ? '45 min Past Papers & Long Cases'
          : '1.5 hr University Past Papers & Clinical Long Cases',
        durationMinutes: isTimeConstrained ? 45 : 90,
        priority: 'high',
        completed: completedIds.has('prof-theory-secondary'),
        xpReward: 100,
        description: 'Case presentation practice and structured long answer templates.'
      },
      {
        id: 'marrow-condensed',
        pillar: 'Career',
        title: isModerate || isTimeConstrained
          ? '45 min Marrow Custom Module (30 MCQs)'
          : '1.5 hr Marrow Custom Module (50 MCQs)',
        durationMinutes: isModerate || isTimeConstrained ? 45 : 90,
        priority: 'medium',
        completed: completedIds.has('marrow-condensed'),
        xpReward: 80,
        description: 'Focused test block on cluster subjects.'
      }
    );
  } else {
    // Standard NEET PG / INI-CET Schedule
    actions.push(
      {
        id: 'marrow-primary',
        pillar: 'Career',
        title: isTimeConstrained
          ? '1 hr Marrow Custom Module (40 MCQs)'
          : isModerate
          ? '1.5 hr Marrow Custom Module (50 MCQs)'
          : '2.5 hr Marrow Custom Module (75-100 MCQs)',
        durationMinutes: isTimeConstrained ? 60 : isModerate ? 90 : 150,
        priority: 'high',
        completed: completedIds.has('marrow-primary'),
        xpReward: isModerate ? 90 : 150,
        description: 'High-speed MCQ solving with mistake bookmarking.'
      },
      {
        id: 'theory-4th-year',
        pillar: 'Career',
        title: isTimeConstrained
          ? '45 min 4th Year Theory (Medicine/Surgery/OBG)'
          : isModerate
          ? '1 hr 4th Year Theory (Medicine/Surgery/OBG)'
          : '1.5 hr 4th Year Theory (Medicine/Surgery/OBG)',
        durationMinutes: isTimeConstrained ? 45 : isModerate ? 60 : 90,
        priority: 'high',
        completed: completedIds.has('theory-4th-year'),
        xpReward: 80,
        description: 'Deep textbook grounding for clinical rotations.'
      },
      {
        id: 'theory-revision',
        pillar: 'Career',
        title: isTimeConstrained
          ? '45 min Revision Theory (1st-3rd Year)'
          : isModerate
          ? '1 hr Revision Theory (1st-3rd Year Subjects)'
          : '1.5 hr Revision Theory (1st-3rd Year Subjects)',
        durationMinutes: isTimeConstrained ? 45 : isModerate ? 60 : 90,
        priority: 'medium',
        completed: completedIds.has('theory-revision'),
        xpReward: 80,
        description: 'Pre-clinical & Para-clinical high yield notes retention.'
      }
    );
  }

  // Ledger audit
  actions.push({
    id: 'ledger-audit',
    pillar: 'Career',
    title: isTimeConstrained ? '20 min Mistake Ledger Audit' : '30 min Mistake Ledger Audit',
    durationMinutes: isTimeConstrained ? 20 : 30,
    priority: 'medium',
    completed: completedIds.has('ledger-audit'),
    xpReward: 30,
    description: 'Tag recurring clinical traps and pearl notes.'
  });

  // Fitness: Run Protocol & Strength
  actions.push({
    id: 'running-session',
    pillar: 'Fitness',
    title: '11-Week Progressive Running Protocol',
    durationMinutes: 30,
    priority: 'high',
    completed: completedIds.has('running-session'),
    xpReward: 100,
    description: 'Interval jog ⇄ walk session as prescribed by current week.'
  });

  actions.push({
    id: 'calisthenics-circuit',
    pillar: 'Fitness',
    title: isModerate || isTimeConstrained
      ? 'Bodyweight Strength (Halved: 2 Sets + 1 Core Set)'
      : 'Bodyweight Strength (Full: 4 Sets + 2 Core Sets)',
    durationMinutes: isModerate || isTimeConstrained ? 15 : 30,
    priority: isModerate ? 'medium' : 'high',
    completed: completedIds.has('calisthenics-circuit'),
    xpReward: isModerate ? 40 : 80,
    description:
      isModerate || isTimeConstrained
        ? '2 sets: 20 Squats, 10 Pushups, 10 Pullups, 20 Lunges, 30s Hang + 1 set core'
        : '4 sets: 20 Squats, 10 Pushups, 10 Pullups, 20 Lunges, 30s Hang + 2 sets core'
  });

  // Mind & Social
  actions.push(
    {
      id: 'mind-meditation',
      pillar: 'Mind',
      title: '15 min Stoic Meditation & Clarity',
      durationMinutes: 15,
      priority: 'medium',
      completed: completedIds.has('mind-meditation'),
      xpReward: 50,
      description: 'Breathing reset to prevent clinical cognitive overload.'
    },
    {
      id: 'daily-journal',
      pillar: 'Mind',
      title: 'Evening Journal (Gratitude, Regrets, Tomorrow)',
      durationMinutes: 10,
      priority: 'medium',
      completed: completedIds.has('daily-journal'),
      xpReward: 40,
      description: 'Reflective grounding before sleep.'
    },
    {
      id: 'social-checkin',
      pillar: 'Social',
      title: 'Family & Friend Check-in Target',
      durationMinutes: 15,
      priority: 'medium',
      completed: completedIds.has('social-checkin'),
      xpReward: 30,
      description: 'Quick voice call or text to Ma, Papa, or brother.'
    }
  );

  return actions;
}

/**
 * Untouched subject advice & guidance
 */
export interface UntouchedSubjectAdvice {
  subject: string;
  daysUntouched: number;
  priority: 'CRITICAL' | 'MODERATE' | 'LOW';
  recommendedAction: string;
}

export const SUBJECT_EXACT_TOPICS: Record<string, string> = {
  'Medicine': 'Cardiology: Heart Failure, Valvular Disease & ECG Arrhythmias',
  'Surgery': 'SRB Hernias, Thyroid Nodules & Intestinal Obstruction',
  'Obstetrics & Gynecology (OBG)': 'Partograph, PPH, Eclampsia & Cervical Carcinoma',
  'Pediatrics': 'Neonatal Resuscitation, Congenital Heart Disease & Milestones',
  'Ophthalmology': 'Open-Angle Glaucoma, Cataract Surgery & Diabetic Retinopathy',
  'ENT': 'CSOM Atticoantral, Stapedectomy, Stridor & Vocal Cord Palsy',
  'Anatomy': 'Brachial Plexus, Inguinal Canal, Cavernous Sinus & Cranial Nerves',
  'Physiology': 'Cardiac Cycle, Nerve Action Potential, Countercurrent & GFR',
  'Biochemistry': 'Glycolysis, Krebs Cycle, Urea Cycle & Glycogen Storage Disorders',
  'Microbiology': 'Bacterial Toxins, Gram-Negative Bacilli, HIV & Opportunistic Fungi',
  'Pathology': 'Reversible Cell Injury, Amyloidosis, Acute Leukemias & Glomerulonephritis',
  'Pharmacology': 'Autonomic Receptors, Beta Blockers, Antimicrobial Stewardship & Chemotherapy',
  'Forensic Medicine & Toxicology': 'Thanatology, Mechanical Injuries, Firearm Wounds & Organophosphate Toxicity',
  'Community Medicine (PSM)': 'Biostatistics & Tests of Significance, National Immunization Schedule & Epidemiological Studies',
  'Orthopedics': 'Fracture Neck of Femur, Supracondylar Humerus & Nerve Injuries',
  'Dermatology': 'Psoriasis, Pemphigus Vulgaris, Leprosy Classifications & Drug Eruptions',
  'Psychiatry': 'Schizophrenia Spectrum, Major Depressive Disorder & Bipolar Mood Disorders',
  'Radiology': 'Chest X-Ray Lobar Patterns, Brain CT Trauma Signs & Abdominal Ultrasound',
  'Anesthesia': 'Pre-op Assessment, Intubation Airway Management & Spinal vs Epidural Blocks'
};

export interface SpacedSubjectItem {
  subject: string;
  exactTopic: string;
  group: 'UNIVERSITY' | 'COMPETITIVE';
  priorityTier: 'MOST_PRIORITY' | 'SECOND_PRIORITY' | 'THIRD_PRIORITY';
  theoryObjective: 'LEARN_NEW' | 'REVIEW_RELEARN';
  lastReviewedDate: string | null;
  daysUntouched: number;
  suggestedNextReviewDate: string;
  spacedIntervalDays: number;
  urgency: 'OVERDUE' | 'DUE_SOON' | 'FRESH';
  advice: string;
}

export function getAllSubjectsSpacedSchedule(
  marrowEntries: MarrowEntry[],
  currentDate: Date = new Date()
): SpacedSubjectItem[] {
  return ALL_19_SUBJECTS.map((subject) => {
    const exactTopic = SUBJECT_EXACT_TOPICS[subject] || `${subject} Core High-Yield Topic`;
    // Determine group
    const isUniversity =
      MOST_PRIORITY_SUBJECTS.includes(subject) || SECOND_PRIORITY_SUBJECTS.includes(subject);
    const group: 'UNIVERSITY' | 'COMPETITIVE' = isUniversity ? 'UNIVERSITY' : 'COMPETITIVE';

    // Priority Tier & Objective
    let priorityTier: 'MOST_PRIORITY' | 'SECOND_PRIORITY' | 'THIRD_PRIORITY' = 'THIRD_PRIORITY';
    let theoryObjective: 'LEARN_NEW' | 'REVIEW_RELEARN' = 'REVIEW_RELEARN';

    if (MOST_PRIORITY_SUBJECTS.includes(subject)) {
      priorityTier = 'MOST_PRIORITY';
      theoryObjective = 'LEARN_NEW';
    } else if (SECOND_PRIORITY_SUBJECTS.includes(subject)) {
      priorityTier = 'SECOND_PRIORITY';
      theoryObjective = 'LEARN_NEW';
    }

    // Find entries for this subject
    const entries = marrowEntries.filter(
      (e) =>
        e.subject.toLowerCase() === subject.toLowerCase() ||
        (e.subjectsBreakdown &&
          e.subjectsBreakdown.some((b) => b.subject.toLowerCase() === subject.toLowerCase()))
    );

    let lastReviewedDate: string | null = null;
    let daysUntouched = 99;

    if (entries.length > 0) {
      const latest = entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      lastReviewedDate = latest.date;
      daysUntouched = Math.max(
        0,
        Math.floor((currentDate.getTime() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    // Spaced repetition interval formula:
    // 0 reviews: 1 day; 1 review: 3 days; 2 reviews: 7 days; 3+ reviews: 14 days
    const reviewCount = entries.length;
    let spacedIntervalDays = 3;
    if (reviewCount === 0) spacedIntervalDays = 1;
    else if (reviewCount === 1) spacedIntervalDays = 3;
    else if (reviewCount === 2) spacedIntervalDays = 7;
    else spacedIntervalDays = 14;

    // Calculate suggested next review date
    const baseDate = lastReviewedDate ? new Date(lastReviewedDate) : new Date(currentDate);
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + spacedIntervalDays);
    const suggestedNextReviewDate = nextDate.toISOString().split('T')[0];

    let urgency: 'OVERDUE' | 'DUE_SOON' | 'FRESH' = 'FRESH';
    if (daysUntouched >= spacedIntervalDays) {
      urgency = 'OVERDUE';
    } else if (daysUntouched >= spacedIntervalDays - 2) {
      urgency = 'DUE_SOON';
    }

    let advice = '';
    if (urgency === 'OVERDUE') {
      advice =
        reviewCount === 0
          ? `Untouched! Solve 25-40 MCQs or log 1 theory block to establish baseline.`
          : `Overdue by ${daysUntouched - spacedIntervalDays} days. Spaced repetition retention falling.`;
    } else if (urgency === 'DUE_SOON') {
      advice = `Due for spaced review in ${spacedIntervalDays - daysUntouched} day(s).`;
    } else {
      advice = `Active memory fresh. Next repetition target: ${formatDateWithDay(suggestedNextReviewDate, true)}.`;
    }

    return {
      subject,
      exactTopic,
      group,
      priorityTier,
      theoryObjective,
      lastReviewedDate,
      daysUntouched,
      suggestedNextReviewDate,
      spacedIntervalDays,
      urgency,
      advice
    };
  });
}

export function getUntouchedSubjectAdvice(
  marrowEntries: MarrowEntry[],
  currentDate: Date = new Date()
): UntouchedSubjectAdvice[] {
  const schedule = getAllSubjectsSpacedSchedule(marrowEntries, currentDate);
  return schedule
    .filter((s) => s.daysUntouched >= 7 || s.lastReviewedDate === null)
    .map((s) => ({
      subject: s.subject,
      daysUntouched: s.daysUntouched,
      priority:
        (s.priorityTier === 'MOST_PRIORITY' || s.daysUntouched >= 14 ? 'CRITICAL' : 'MODERATE') as 'CRITICAL' | 'MODERATE',
      recommendedAction: s.advice
    }))
    .sort((a, b) => {
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
      if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL') return 1;
      return b.daysUntouched - a.daysUntouched;
    });
}

/**
 * Calculate multi-pillar individual streaks
 */
export function calculateMultiStreaks(
  arg1: any,
  calisthenicsLogsArg?: any,
  ankiReviewsArg?: any,
  marrowEntriesArg?: any,
  mindLogsArg?: any,
  screenTimeLogsArg?: any,
  nutritionDaysArg?: any
): {
  runningStreak: number;
  workoutStreak: number;
  ankiStreak: number;
  mcqStreak: number;
  meditationStreak: number;
  screentimeStreak: number;
  calorieStreak: number;
} {
  let runningSessions: any[] = [];
  let calisthenicsLogs: any[] = [];
  let ankiReviews: any[] = [];
  let marrowEntries: any[] = [];
  let mindLogs: any[] = [];
  let screenTimeLogs: any[] = [];
  let nutritionDays: any[] = [];
  let directMeditationStreak = 0;

  if (Array.isArray(arg1) || calisthenicsLogsArg !== undefined) {
    runningSessions = Array.isArray(arg1) ? arg1 : [];
    if (Array.isArray(calisthenicsLogsArg)) {
      calisthenicsLogs = calisthenicsLogsArg;
    } else if (calisthenicsLogsArg && typeof calisthenicsLogsArg === 'object') {
      calisthenicsLogs = [calisthenicsLogsArg];
    }
    ankiReviews = Array.isArray(ankiReviewsArg) ? ankiReviewsArg : [];
    marrowEntries = Array.isArray(marrowEntriesArg) ? marrowEntriesArg : [];
    if (Array.isArray(mindLogsArg)) {
      mindLogs = mindLogsArg;
    } else if (mindLogsArg && typeof mindLogsArg === 'object') {
      mindLogs = [mindLogsArg];
      if (typeof mindLogsArg.streakDays === 'number') {
        directMeditationStreak = mindLogsArg.streakDays;
      }
    }
    if (Array.isArray(screenTimeLogsArg)) {
      screenTimeLogs = screenTimeLogsArg;
    } else if (screenTimeLogsArg && typeof screenTimeLogsArg === 'object') {
      screenTimeLogs = [screenTimeLogsArg];
    }
    nutritionDays = Array.isArray(nutritionDaysArg) ? nutritionDaysArg : [];
  } else if (arg1 && typeof arg1 === 'object') {
    runningSessions = Array.isArray(arg1.runningSessions) ? arg1.runningSessions : [];
    calisthenicsLogs = Array.isArray(arg1.calisthenicsLogs) ? arg1.calisthenicsLogs : [];
    ankiReviews = Array.isArray(arg1.ankiReviews) ? arg1.ankiReviews : [];
    marrowEntries = Array.isArray(arg1.marrowEntries) ? arg1.marrowEntries : [];
    mindLogs = Array.isArray(arg1.mindLogs) ? arg1.mindLogs : [];
    screenTimeLogs = Array.isArray(arg1.screenTimeLogs) ? arg1.screenTimeLogs : [];
    nutritionDays = Array.isArray(arg1.nutritionDays) ? arg1.nutritionDays : [];
  }

  const countStreak = (activeDates: string[]): number => {
    if (!activeDates || activeDates.length === 0) return 0;
    const uniqueDates = Array.from(new Set(activeDates.filter(Boolean))).sort().reverse();
    return uniqueDates.length;
  };

  const runningDates = runningSessions.filter((s) => s.completed !== false).map((s) => s.date);
  const workoutDates = calisthenicsLogs.filter((s) => s.completed !== false && s.circuitCompleted !== false).map((s) => s.date);
  const ankiDates = ankiReviews.filter((r) => (r.cardsReviewed ?? 1) > 0).map((r) => r.date);
  const mcqDates = marrowEntries.map((m) => m.date);
  const meditationDates = mindLogs.filter((m) => (m.meditationMinutes ?? 1) > 0).map((m) => m.date);
  const screenDates = screenTimeLogs.filter((s) => !s.isOverLimit).map((s) => s.date);
  const calorieDates = nutritionDays.filter((n) => !n.exceededCal).map((n) => n.date);

  return {
    runningStreak: countStreak(runningDates),
    workoutStreak: countStreak(workoutDates),
    ankiStreak: countStreak(ankiDates),
    mcqStreak: countStreak(mcqDates),
    meditationStreak: directMeditationStreak > 0 ? directMeditationStreak : countStreak(meditationDates),
    screentimeStreak: countStreak(screenDates),
    calorieStreak: countStreak(calorieDates)
  };
}


/**
 * 11-Week Progressive Running Protocol Schedule
 */
export interface RunningWeekInfo {
  week: number;
  label: string;
  protocol: string;
  jogMinutes: number;
  walkMinutes: number;
  continuous: boolean;
  baseXp: number;
}

export const RUNNING_PROTOCOL: Record<number, RunningWeekInfo> = {
  1: {
    week: 1,
    label: 'Week 1: Interval Intro',
    protocol: '3-5m walk warmup → 8x(1m jog ⇄ 1.5m walk) → 3-5m walk cooldown',
    jogMinutes: 8,
    walkMinutes: 16,
    continuous: false,
    baseXp: 100
  },
  2: {
    week: 2,
    label: 'Week 2: Stepping Up',
    protocol: '6x(1.5m jog ⇄ 2m walk) with warm-up & cool-down',
    jogMinutes: 9,
    walkMinutes: 12,
    continuous: false,
    baseXp: 130
  },
  3: {
    week: 3,
    label: 'Week 3: 3-Min Aerobic Base',
    protocol: '4x(3m jog ⇄ 3m walk)',
    jogMinutes: 12,
    walkMinutes: 12,
    continuous: false,
    baseXp: 160
  },
  4: {
    week: 4,
    label: 'Week 4: Dense 3-Min Intervals',
    protocol: '6x(3m jog ⇄ 1.5m walk)',
    jogMinutes: 18,
    walkMinutes: 9,
    continuous: false,
    baseXp: 190
  },
  5: {
    week: 5,
    label: 'Week 5: 5-Min Sustained Runs',
    protocol: '4x(5m jog ⇄ 2m walk)',
    jogMinutes: 20,
    walkMinutes: 8,
    continuous: false,
    baseXp: 220
  },
  6: {
    week: 6,
    label: 'Week 6: 8-Min Blocks',
    protocol: '2x(8m jog ⇄ 2m walk) + 5m brisk walk',
    jogMinutes: 16,
    walkMinutes: 9,
    continuous: false,
    baseXp: 250
  },
  7: {
    week: 7,
    label: 'Week 7: 10-Min Blocks',
    protocol: '2x(10m jog ⇄ 2m walk)',
    jogMinutes: 20,
    walkMinutes: 4,
    continuous: false,
    baseXp: 280
  },
  8: {
    week: 8,
    label: 'Week 8: 15-Min Sustained Blocks',
    protocol: '2x(15m jog ⇄ 3m walk)',
    jogMinutes: 30,
    walkMinutes: 6,
    continuous: false,
    baseXp: 310
  },
  9: {
    week: 9,
    label: 'Week 9: 20 Min Continuous',
    protocol: '20 min continuous jog without stopping',
    jogMinutes: 20,
    walkMinutes: 0,
    continuous: true,
    baseXp: 340
  },
  10: {
    week: 10,
    label: 'Week 10: 25 Min Continuous',
    protocol: '25 min continuous jog without stopping',
    jogMinutes: 25,
    walkMinutes: 0,
    continuous: true,
    baseXp: 370
  },
  11: {
    week: 11,
    label: 'Week 11+: 30 Min Continuous Endurance',
    protocol: '30 min continuous jog without stopping',
    jogMinutes: 30,
    walkMinutes: 0,
    continuous: true,
    baseXp: 400
  }
};

/**
 * Handle running step-back logic when days are missed
 */
export function calculateRunningProgression(
  currentWeek: number,
  daysMissed: number,
  isSick: boolean
): {
  newWeek: number;
  xpPenalty: number;
  reason: string;
} {
  if (isSick) {
    if (daysMissed > 4) {
      return {
        newWeek: Math.max(1, currentWeek - 1),
        xpPenalty: 0, // No XP penalty during sickness
        reason: 'Graceful 1-week step-back due to illness (> 4 days).'
      };
    }
    return {
      newWeek: currentWeek,
      xpPenalty: 0,
      reason: 'Sick freeze active. Running progression locked.'
    };
  }

  if (daysMissed > 14) {
    return {
      newWeek: 1,
      xpPenalty: -150,
      reason: 'Missed > 2 weeks without sick mode. Reset to Week 1 with -150 XP penalty.'
    };
  }

  if (daysMissed >= 4) {
    return {
      newWeek: Math.max(1, currentWeek - 1),
      xpPenalty: 0,
      reason: 'Missed ≥ 4 days. Automatically stepped back 1 week.'
    };
  }

  return {
    newWeek: currentWeek,
    xpPenalty: 0,
    reason: 'On track.'
  };
}

/**
 * Check for 4th-year subjects with no activity for ≥ 7 days
 */
export function detectStaleFourthYearSubjects(
  marrowEntries: MarrowEntry[],
  currentDate: Date = new Date()
): { subject: string; daysSinceLast: number }[] {
  const staleList: { subject: string; daysSinceLast: number }[] = [];

  for (const subject of FOURTH_YEAR_CORE_SUBJECTS) {
    const entries = marrowEntries.filter((e) => e.subject.toLowerCase() === subject.toLowerCase());
    if (entries.length === 0) {
      staleList.push({ subject, daysSinceLast: 99 });
      continue;
    }

    const latestEntry = entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const diffDays = Math.floor(
      (currentDate.getTime() - new Date(latestEntry.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 7) {
      staleList.push({ subject, daysSinceLast: diffDays });
    }
  }

  return staleList;
}

/**
 * Calculate Level and Progress percentage from XP
 * Level formula: exponential L = floor(sqrt(XP / 100)) + 1
 */
export function calculateLevelFromXP(xp: number): {
  level: number;
  currentLevelBaseXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  const safeXP = Math.max(0, xp);
  const level = Math.floor(Math.sqrt(safeXP / 100)) + 1;
  const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const diff = nextLevelXP - currentLevelBaseXP;
  const progress = diff > 0 ? ((safeXP - currentLevelBaseXP) / diff) * 100 : 0;

  return {
    level,
    currentLevelBaseXP,
    nextLevelXP,
    progressPercent: Math.min(100, Math.max(0, Math.round(progress)))
  };
}

/**
 * Calculate study session XP with continuous study bonus
 * Rule: +1 XP per minute. If session >= 100 minutes, bonus 1.5x (100 mins -> 150 XP)
 */
export function calculateStudySessionXP(minutes: number): number {
  if (minutes < 1) return 0;
  if (minutes >= 100) {
    return Math.round(minutes * 1.5);
  }
  return minutes;
}

/**
 * Calculate Run XP with week progression and 4-day streak bonus (+1% per 4 days)
 */
export function calculateRunXP(week: number, streakDays: number): number {
  const weekInfo = RUNNING_PROTOCOL[Math.min(11, Math.max(1, week))];
  const baseXp = weekInfo ? weekInfo.baseXp : 100;
  const streakMultiplier = 1 + Math.floor(streakDays / 4) * 0.01;
  return Math.round(baseXp * streakMultiplier);
}

/**
 * Urge Slip XP Penalties
 */
export const URGE_SLIP_PENALTIES: Record<string, number> = {
  DOOMSCROLLING: -300,
  SEXUAL_URGE: -500,
  MASTURBATION: -500,
  DISTRACTION_TEXTING: -50,
  BOREDOM: -50,
  EMOTIONAL: -50,
  SEXUAL: -50
};
