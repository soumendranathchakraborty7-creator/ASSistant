import React, { useState } from 'react';
import { Database, Copy, Check, X, Shield, ExternalLink } from 'lucide-react';
import { storage } from '../services/supabaseStorage.ts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SQL_SCRIPT = `-- ASCLEPIUS OS: SUPABASE SCHEMA MIGRATION SCRIPT
-- Execute in Supabase SQL Editor:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE subject_cluster_type AS ENUM ('CLUSTER_A', 'CLUSTER_B', 'SUNDAY_GT');
CREATE TYPE urge_trigger_type AS ENUM (
  'DOOMSCROLLING', 'MASTURBATION', 'BOREDOM', 'EMOTIONAL', 'SEXUAL', 'DISTRACTION_TEXTING'
);
CREATE TYPE relationship_tier_type AS ENUM (
  'DAILY_FAMILY', 'CLOSE_FRIENDS', 'WEEKLY_COLLEGE_ONCALL'
);

-- User Profiles
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Capacity Logs
CREATE TABLE IF NOT EXISTS public.capacity_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_percent INTEGER NOT NULL CHECK (energy_percent BETWEEN 0 AND 100),
  available_free_hours NUMERIC(3, 1) NOT NULL DEFAULT 6.0,
  is_on_call BOOLEAN NOT NULL DEFAULT FALSE,
  is_sick BOOLEAN NOT NULL DEFAULT FALSE,
  calculated_mode TEXT NOT NULL,
  UNIQUE(user_id, checkin_date)
);

-- Marrow Modules Ledger
CREATE TABLE IF NOT EXISTS public.marrow_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_date DATE NOT NULL DEFAULT CURRENT_DATE,
  module_code TEXT NOT NULL,
  subject TEXT NOT NULL,
  cluster subject_cluster_type NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_percent NUMERIC(5, 2) GENERATED ALWAYS AS (ROUND((correct_count::numeric / total_questions::numeric) * 100, 2)) STORED,
  mistake_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  review_due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Weight Tracking
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(4, 1) NOT NULL,
  notes TEXT,
  UNIQUE(user_id, log_date)
);

-- Running Logs
CREATE TABLE IF NOT EXISTS public.running_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 11),
  interval_protocol TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  xp_awarded INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Urge & Mental Discipline
CREATE TABLE IF NOT EXISTS public.urge_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  trigger_type urge_trigger_type NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  was_slip BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_xp INTEGER NOT NULL DEFAULT 0,
  trigger_context TEXT,
  ai_redemption_action TEXT,
  redemption_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- RLS Enforcement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marrow_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own modules" ON public.marrow_modules FOR ALL USING (auth.uid() = user_id);
`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(storage.getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(storage.getSupabaseConfig().anonKey);
  const [connectionSaved, setConnectionSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSupabaseConfig({
      url: supabaseUrl,
      anonKey: supabaseKey,
      connected: !!(supabaseUrl && supabaseKey)
    });
    setConnectionSaved(true);
    setTimeout(() => setConnectionSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#090D14] border border-neutral-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Supabase PostgreSQL Schema & Cloud Sync
              </h3>
              <p className="text-xs text-neutral-400">
                Complete database architecture for NEET PG / University Profs OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local Storage Offline Notice */}
        <div className="mt-4 p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Offline Local Cache Active:</strong> All modules, weigh-ins, running logs, and urge events are saved locally with immediate zero-latency persistence. Connecting a remote Supabase project enables cross-device cloud synchronization.
          </div>
        </div>

        {/* Remote Supabase Connection Form */}
        <form onSubmit={handleSaveConfig} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {connectionSaved && (
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Connection Config Saved
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Save Supabase Credentials
              </button>
            </div>
          </div>
        </form>

        {/* Complete SQL Migration Script */}
        <div className="mt-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-neutral-400 font-bold">
              Complete PostgreSQL Migration Script (supabase_migration.sql)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-sky-400 text-xs font-semibold transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl max-h-56 overflow-y-auto">
            <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre leading-relaxed">
              {SUPABASE_SQL_SCRIPT}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
