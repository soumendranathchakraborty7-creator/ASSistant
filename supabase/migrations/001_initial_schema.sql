-- ============================================================================
-- ASCLEPIUS OS: COMPREHENSIVE SUPABASE DATABASE MIGRATION SCRIPT
-- Tailored for Medical Student NEET PG / INI-CET / University Prof Exam OS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE subject_cluster_type AS ENUM ('CLUSTER_A', 'CLUSTER_B', 'SUNDAY_GT');

CREATE TYPE urge_trigger_type AS ENUM (
  'DOOMSCROLLING',
  'MASTURBATION',
  'BOREDOM',
  'EMOTIONAL',
  'SEXUAL',
  'DISTRACTION_TEXTING'
);

CREATE TYPE relationship_tier_type AS ENUM (
  'DAILY_FAMILY',
  'CLOSE_FRIENDS',
  'WEEKLY_COLLEGE_ONCALL'
);

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES & GAMIFICATION ECONOMY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT 'Doctor Aspirant',
  xp_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_running_week INTEGER NOT NULL DEFAULT 1 CHECK (current_running_week BETWEEN 1 AND 11),
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  current_weight_kg NUMERIC(4, 1) DEFAULT 75.0,
  target_weight_kg NUMERIC(4, 1) DEFAULT 67.5,
  university_prof_exam_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. DYNAMIC CAPACITY ENGINE (ANTI-BURNOUT LOGS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.capacity_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_percent INTEGER NOT NULL CHECK (energy_percent BETWEEN 0 AND 100),
  available_free_hours NUMERIC(3, 1) NOT NULL DEFAULT 6.0,
  is_on_call BOOLEAN NOT NULL DEFAULT FALSE,
  is_sick BOOLEAN NOT NULL DEFAULT FALSE,
  calculated_mode TEXT NOT NULL, -- 'BASELINE', 'MODERATE', 'SURVIVAL', 'ON_CALL_PAUSE', 'SICK_FREEZE'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, checkin_date)
);

-- ----------------------------------------------------------------------------
-- 3. PILLAR 1: CAREER (MARROW CUSTOM MODULES LEDGER)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marrow_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_date DATE NOT NULL DEFAULT CURRENT_DATE,
  module_code TEXT NOT NULL,
  subject TEXT NOT NULL,
  cluster subject_cluster_type NOT NULL,
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= total_questions),
  score_percent NUMERIC(5, 2) GENERATED ALWAYS AS (ROUND((correct_count::numeric / total_questions::numeric) * 100, 2)) STORED,
  mistake_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  review_due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Daily Study Blocks Completion
CREATE TABLE IF NOT EXISTS public.study_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_date DATE NOT NULL DEFAULT CURRENT_DATE,
  block_type TEXT NOT NULL, -- 'ANKI_1H', 'CUSTOM_MODULES_2_5H', 'THEORY_4TH_YR_1_5H', 'REVISION_THEORY_1_5H', 'LEDGER_AUDIT_30M'
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, block_date, block_type)
);

-- ----------------------------------------------------------------------------
-- 4. PILLAR 2: PHYSICAL FITNESS & BODY COMPOSITION
-- ----------------------------------------------------------------------------
-- Morning Weight Logs
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(4, 1) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, log_date)
);

-- 11-Week Progressive Running Sessions
CREATE TABLE IF NOT EXISTS public.running_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 11),
  interval_protocol TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  total_duration_minutes INTEGER NOT NULL DEFAULT 30,
  xp_awarded INTEGER NOT NULL DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bodyweight Calisthenics Circuit
CREATE TABLE IF NOT EXISTS public.calisthenics_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sets_completed INTEGER NOT NULL DEFAULT 4,
  squats_done INTEGER NOT NULL DEFAULT 80,
  pushups_done INTEGER NOT NULL DEFAULT 40,
  pullups_done INTEGER NOT NULL DEFAULT 40,
  lunges_done INTEGER NOT NULL DEFAULT 80,
  hang_seconds INTEGER NOT NULL DEFAULT 120,
  core_sets_done INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, session_date)
);

-- Nutrition Tracking (Journable OCR & Protein Alert)
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories INTEGER NOT NULL,
  protein_grams INTEGER NOT NULL,
  protein_target_grams INTEGER NOT NULL DEFAULT 130,
  is_low_protein BOOLEAN GENERATED ALWAYS AS (protein_grams < 130) STORED,
  raw_ocr_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, log_date)
);

-- ----------------------------------------------------------------------------
-- 5. PILLAR 3: MENTAL DISCIPLINE & URGE LEDGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.urge_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  trigger_type urge_trigger_type NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  was_slip BOOLEAN NOT NULL DEFAULT FALSE,
  xp_penalty INTEGER NOT NULL DEFAULT 0,
  trigger_context TEXT,
  ai_redemption_action TEXT,
  redemption_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ScreenZen Screen Time Logs (YouTube Capped at 30 min)
CREATE TABLE IF NOT EXISTS public.screen_time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  youtube_minutes INTEGER NOT NULL DEFAULT 0,
  total_screentime_minutes INTEGER NOT NULL DEFAULT 0,
  is_youtube_over_limit BOOLEAN GENERATED ALWAYS AS (youtube_minutes > 30) STORED,
  screenshot_parsed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, log_date)
);

-- Daily Mind (Meditation, Fog, Journal)
CREATE TABLE IF NOT EXISTS public.daily_mind_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meditation_minutes INTEGER NOT NULL DEFAULT 0 CHECK (meditation_minutes BETWEEN 0 AND 120),
  brain_fog_score INTEGER NOT NULL CHECK (brain_fog_score BETWEEN 1 AND 5),
  gratitude_entry TEXT,
  regrets_entry TEXT,
  notable_events_entry TEXT,
  tomorrow_intentions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, log_date)
);

-- ----------------------------------------------------------------------------
-- 6. PILLAR 4: SOCIAL MAINTENANCE MATRIX
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  tier relationship_tier_type NOT NULL,
  target_interval_days INTEGER NOT NULL, -- Daily = 1, Close friends = 4, Weekly = 7
  last_contacted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. REWARD STORE & IN-APP ECONOMY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  xp_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marrow_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calisthenics_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mind_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own capacity checkins" ON public.capacity_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own marrow modules" ON public.marrow_modules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study blocks" ON public.study_blocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own running logs" ON public.running_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calisthenics logs" ON public.calisthenics_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nutrition logs" ON public.nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own urge logs" ON public.urge_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own screen time logs" ON public.screen_time_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mind logs" ON public.daily_mind_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts" ON public.social_contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own store redemptions" ON public.store_redemptions
  FOR ALL USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- AUTOMATIC NEW USER ONBOARDING TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, xp_points, level, current_running_week)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Doctor Aspirant'), 100, 1, 1);

  -- Seed default social contacts
  INSERT INTO public.social_contacts (user_id, name, relationship, tier, target_interval_days, last_contacted_date)
  VALUES
    (new.id, 'Ma', 'Family', 'DAILY_FAMILY', 1, CURRENT_DATE),
    (new.id, 'Papa', 'Family', 'DAILY_FAMILY', 1, CURRENT_DATE),
    (new.id, 'Brother', 'Family', 'DAILY_FAMILY', 1, CURRENT_DATE),
    (new.id, 'Close Study Buddy', 'Best Friend', 'CLOSE_FRIENDS', 4, CURRENT_DATE),
    (new.id, 'Grandparents', 'Family', 'WEEKLY_COLLEGE_ONCALL', 7, CURRENT_DATE),
    (new.id, 'Posting Co-Interns', 'College / Ward', 'WEEKLY_COLLEGE_ONCALL', 7, CURRENT_DATE);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
