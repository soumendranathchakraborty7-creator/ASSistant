import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScheduleMode,
  generateDailyActions,
  getSubjectClusterForDate,
  isUniversityProfExamNear,
  calculateRunningProgression,
  calculateLevelFromXP,
  calculateStudySessionXP,
  calculateRunXP,
  detectStaleFourthYearSubjects,
  formatDateWithDay,
  formatDateDDMMYY,
  calculateMultiStreaks,
  getAllSubjectsSpacedSchedule,
  MOST_PRIORITY_SUBJECTS,
  SECOND_PRIORITY_SUBJECTS,
  THIRD_PRIORITY_SUBJECTS,
  MarrowEntry
} from './engine.ts';

test('calculateScheduleMode returns correct mode per state', () => {
  assert.equal(
    calculateScheduleMode({ energyPercent: 100, availableFreeHours: 6, isOnCall: false, isSick: false }),
    'BASELINE'
  );
  assert.equal(
    calculateScheduleMode({ energyPercent: 50, availableFreeHours: 4, isOnCall: false, isSick: false }),
    'MODERATE'
  );
  assert.equal(
    calculateScheduleMode({ energyPercent: 20, availableFreeHours: 2, isOnCall: false, isSick: false }),
    'SURVIVAL'
  );
  assert.equal(
    calculateScheduleMode({ energyPercent: 90, availableFreeHours: 6, isOnCall: true, isSick: false }),
    'ON_CALL_PAUSE'
  );
  assert.equal(
    calculateScheduleMode({ energyPercent: 100, availableFreeHours: 6, isOnCall: false, isSick: true }),
    'SICK_FREEZE'
  );
});

test('generateDailyActions provides Minimum Survival Checklist when energy <= 30%', () => {
  const actions = generateDailyActions(
    { energyPercent: 25, availableFreeHours: 2, isOnCall: false, isSick: false },
    false
  );
  const ids = actions.map((a) => a.id);
  assert.ok(ids.includes('survival-anki'));
  assert.ok(ids.includes('survival-walk'));
  assert.ok(ids.includes('survival-audit'));
  assert.ok(ids.includes('survival-meditation'));
  assert.ok(ids.includes('survival-journal'));
  // Strength circuit should NOT be present in survival mode
  assert.ok(!ids.includes('calisthenics-circuit'));
});

test('generateDailyActions prioritizes Theory when University Prof exam is near', () => {
  const actionsProf = generateDailyActions(
    { energyPercent: 100, availableFreeHours: 6, isOnCall: false, isSick: false },
    true
  );
  const idsProf = actionsProf.map((a) => a.id);
  assert.ok(idsProf.includes('prof-theory-primary'));
  assert.ok(idsProf.includes('prof-theory-secondary'));
  assert.ok(idsProf.includes('marrow-condensed'));
});

test('isUniversityProfExamNear detects dates within 6 weeks', () => {
  const now = new Date('2026-10-22T00:00:00Z');
  // 3 weeks out (21 days) -> true
  assert.equal(isUniversityProfExamNear('2026-11-12', now), true);
  // 7 weeks out (49 days) -> false
  assert.equal(isUniversityProfExamNear('2026-12-10', now), false);
  // Past date -> false
  assert.equal(isUniversityProfExamNear('2026-10-10', now), false);
});

test('getSubjectClusterForDate routes correctly by day of week', () => {
  // 2026-10-25 is Sunday
  assert.equal(getSubjectClusterForDate(new Date('2026-10-25T12:00:00Z')).cluster, 'SUNDAY_GT');
  // 2026-10-26 is Monday -> Cluster A
  assert.equal(getSubjectClusterForDate(new Date('2026-10-26T12:00:00Z')).cluster, 'CLUSTER_A');
  // 2026-10-27 is Tuesday -> Cluster B
  assert.equal(getSubjectClusterForDate(new Date('2026-10-27T12:00:00Z')).cluster, 'CLUSTER_B');
});

test('calculateRunningProgression handles missed days and sickness', () => {
  // On track
  const onTrack = calculateRunningProgression(4, 1, false);
  assert.equal(onTrack.newWeek, 4);
  assert.equal(onTrack.xpPenalty, 0);

  // Missed >= 4 days -> step back 1 week
  const steppedBack = calculateRunningProgression(4, 5, false);
  assert.equal(steppedBack.newWeek, 3);
  assert.equal(steppedBack.xpPenalty, 0);

  // Missed > 14 days -> reset to week 1 with -150 XP
  const reset = calculateRunningProgression(5, 16, false);
  assert.equal(reset.newWeek, 1);
  assert.equal(reset.xpPenalty, -150);

  // Sick > 4 days -> graceful step-back without XP penalty
  const sickGraceful = calculateRunningProgression(4, 6, true);
  assert.equal(sickGraceful.newWeek, 3);
  assert.equal(sickGraceful.xpPenalty, 0);
});

test('calculateStudySessionXP applies 1.5x continuous bonus at >= 100 minutes', () => {
  assert.equal(calculateStudySessionXP(45), 45);
  assert.equal(calculateStudySessionXP(99), 99);
  assert.equal(calculateStudySessionXP(100), 150); // 100 * 1.5 = 150
  assert.equal(calculateStudySessionXP(120), 180); // 120 * 1.5 = 180
});

test('calculateRunXP applies streak bonuses and week scaling', () => {
  // Week 1 base = 100 XP
  assert.equal(calculateRunXP(1, 0), 100);
  // Week 1 with 8-day streak (+2%) -> 102 XP
  assert.equal(calculateRunXP(1, 8), 102);
  // Week 11 base = 400 XP
  assert.equal(calculateRunXP(11, 0), 400);
  // Week 11 with 16-day streak (+4%) -> 416 XP
  assert.equal(calculateRunXP(11, 16), 416);
});

test('calculateLevelFromXP calculates correct exponential level progression', () => {
  // 0 XP -> Level 1, 0% progress
  assert.deepEqual(calculateLevelFromXP(0), {
    level: 1,
    currentLevelBaseXP: 0,
    nextLevelXP: 100,
    progressPercent: 0
  });
  // 50 XP -> Level 1, 50% progress
  assert.equal(calculateLevelFromXP(50).progressPercent, 50);
  // 100 XP -> Level 2
  assert.equal(calculateLevelFromXP(100).level, 2);
  // 400 XP -> Level 3
  assert.equal(calculateLevelFromXP(400).level, 3);
});

test('detectStaleFourthYearSubjects flags subjects missing for >= 7 days', () => {
  const now = new Date('2026-10-22T00:00:00Z');
  const dummyEntries: MarrowEntry[] = [
    {
      id: '1',
      date: '2026-10-21',
      moduleCode: 'MED-01',
      subject: 'Medicine',
      totalQuestions: 50,
      correctCount: 42,
      scorePercent: 84,
      mistakeReviewed: true,
      reviewDueDate: '2026-10-25'
    },
    {
      id: '2',
      date: '2026-10-10', // 12 days ago!
      moduleCode: 'SURG-01',
      subject: 'Surgery',
      totalQuestions: 50,
      correctCount: 40,
      scorePercent: 80,
      mistakeReviewed: false,
      reviewDueDate: '2026-10-14'
    }
  ];

  const stale = detectStaleFourthYearSubjects(dummyEntries, now);
  const staleSubjects = stale.map((s) => s.subject);
  // Surgery is >= 7 days ago, and others like ENT/Pediatrics haven't been done at all (daysSinceLast: 99)
  assert.ok(staleSubjects.includes('Surgery'));
  assert.ok(staleSubjects.includes('Pediatrics'));
  // Medicine was done yesterday (not stale)
  assert.ok(!staleSubjects.includes('Medicine'));
});

test('calculateScheduleMode adapts to free time budget', () => {
  // Low free time budget triggers SURVIVAL even with high somatic energy
  assert.equal(
    calculateScheduleMode({ energyPercent: 90, availableFreeHours: 1.5, isOnCall: false, isSick: false }),
    'SURVIVAL'
  );
  // Moderate free time budget triggers MODERATE
  assert.equal(
    calculateScheduleMode({ energyPercent: 85, availableFreeHours: 3.5, isOnCall: false, isSick: false }),
    'MODERATE'
  );
});

test('formatDateWithDay and formatDateDDMMYY format properly in dd/mm/yy', () => {
  const date = new Date('2026-10-22T10:00:00Z');
  const formattedDay = formatDateWithDay(date);
  assert.ok(formattedDay.includes('22/10/26'));
  assert.ok(formattedDay.includes('Thursday'));

  const shortDay = formatDateWithDay(date, true);
  assert.equal(shortDay, 'Thu, 22/10/26');

  const ddmmyy = formatDateDDMMYY(date);
  assert.equal(ddmmyy, '22/10/26');
});

test('simplified syllabus priority definitions match requirements', () => {
  assert.deepEqual(MOST_PRIORITY_SUBJECTS, ['Medicine', 'Surgery', 'Obstetrics & Gynecology (OBG)', 'Pediatrics']);
  assert.deepEqual(SECOND_PRIORITY_SUBJECTS, ['Ophthalmology', 'ENT']);
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Anatomy'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Physiology'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Biochemistry'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Microbiology'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Pathology'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Pharmacology'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Forensic Medicine & Toxicology'));
  assert.ok(THIRD_PRIORITY_SUBJECTS.includes('Community Medicine (PSM)'));
});

test('calculateMultiStreaks correctly computes discrete streaks', () => {
  const today = '2026-10-23';
  const runningSessions = [
    { id: '1', date: '2026-10-23', weekNumber: 4, completed: true, durationMinutes: 30, xpAwarded: 150 },
    { id: '2', date: '2026-10-22', weekNumber: 4, completed: true, durationMinutes: 30, xpAwarded: 150 },
    { id: '3', date: '2026-10-21', weekNumber: 4, completed: true, durationMinutes: 30, xpAwarded: 150 }
  ];
  const calisthenics = {
    date: '2026-10-23',
    circuitCompleted: true,
    setsCompleted: 4,
    pushups: 100,
    pullups: 32,
    squats: 120,
    plankSeconds: 180,
    legRaises: 60,
    hollowBodySeconds: 120,
    xpAwarded: 120
  };
  const anki = [
    { id: '1', date: '2026-10-23', deckName: 'AnKing', cardsReviewed: 150, xpAwarded: 75 },
    { id: '2', date: '2026-10-22', deckName: 'AnKing', cardsReviewed: 120, xpAwarded: 60 }
  ];
  const marrow = [
    { id: '1', date: '2026-10-23', moduleCode: 'MOD-1', subject: 'Medicine', totalQuestions: 40, correctCount: 35, scorePercent: 87.5, mistakeReviewed: true, reviewDueDate: '2026-10-26' }
  ];
  const mind = {
    date: '2026-10-23',
    meditationMinutes: 15,
    streakDays: 9,
    gratitude: 'Good focus',
    regrets: 'None',
    notableEvents: 'Ward rounds',
    tomorrowIntentions: 'Surgery module'
  };
  const screen = {
    date: '2026-10-23',
    youtubeMinutes: 20,
    totalScreenTimeMinutes: 110,
    isOverLimit: false
  };
  const nutritionDays = [
    { date: '2026-10-23', calories: 1950, carbs: 180, protein: 140, fats: 55, exceededCal: false, exceededCarbs: false, exceededFats: false }
  ];

  const streaks = calculateMultiStreaks(
    runningSessions,
    calisthenics,
    anki,
    marrow,
    mind,
    screen,
    nutritionDays
  );

  assert.equal(streaks.runningStreak, 3);
  assert.equal(streaks.workoutStreak, 1);
  assert.equal(streaks.ankiStreak, 2);
  assert.equal(streaks.mcqStreak, 1);
  assert.equal(streaks.meditationStreak, 9);
  assert.equal(streaks.screentimeStreak, 1);
  assert.equal(streaks.calorieStreak, 1);
});

test('getAllSubjectsSpacedSchedule generates 19 subjects with spaced intervals', () => {
  const schedule = getAllSubjectsSpacedSchedule([], new Date('2026-10-23T12:00:00Z'));
  assert.equal(schedule.length, 19);
  const med = schedule.find((s) => s.subject === 'Medicine');
  assert.ok(med);
  assert.equal(med?.group, 'UNIVERSITY');
  assert.equal(med?.priorityTier, 'MOST_PRIORITY');
  assert.ok(med?.suggestedNextReviewDate);
});

