import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Database,
  Sparkles,
  Heart,
  Smile,
  Compass,
  Star,
  Check,
  X,
  PhoneCall,
  Calendar,
  Coffee,
  BookOpen,
  Camera
} from 'lucide-react';
import { SocialContact, RecreationEntry } from '../types/index.ts';
import { formatDateWithDay, formatDateDDMMYY } from '../utils/engine.ts';

interface SocialMatrixProps {
  contacts: SocialContact[];
  onContactToday: (contactId: string) => void;
  onAddContact: (contact: Omit<SocialContact, 'id' | 'lastContactDate'>) => void;
  onEditContact: (contact: SocialContact) => void;
  onDeleteContact: (contactId: string) => void;
  recreationList: RecreationEntry[];
  onAddRecreation: (entry: Omit<RecreationEntry, 'id'>) => void;
  onOpenSupabaseModal: () => void;
  onAwardXP: (xp: number, reason: string) => void;
}

export const SocialMatrix: React.FC<SocialMatrixProps> = ({
  contacts,
  onContactToday,
  onAddContact,
  onEditContact,
  onDeleteContact,
  recreationList,
  onAddRecreation,
  onOpenSupabaseModal,
  onAwardXP
}) => {
  // Add / Edit contact modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SocialContact | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Family');
  const [contactTargetDays, setContactTargetDays] = useState<number>(3);
  const [contactNotes, setContactNotes] = useState('');

  // Recreation form state
  const [showAddRecreation, setShowAddRecreation] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState<RecreationEntry['category']>('HOBBY');
  const [recNotes, setRecNotes] = useState('');
  const [recRating, setRecRating] = useState<number>(5);

  const getDaysSinceContact = (dateStr: string) => {
    const contactDate = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactName('');
    setContactRelationship('Family');
    setContactTargetDays(3);
    setContactNotes('');
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c: SocialContact) => {
    setEditingContact(c);
    setContactName(c.name);
    setContactRelationship(c.relationship);
    setContactTargetDays(c.targetFrequencyDays);
    setContactNotes(c.customNotes || '');
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    if (editingContact) {
      onEditContact({
        ...editingContact,
        name: contactName.trim(),
        relationship: contactRelationship.trim(),
        targetFrequencyDays: contactTargetDays,
        customNotes: contactNotes.trim()
      });
      onAwardXP(20, `Updated connection target for ${contactName}`);
    } else {
      onAddContact({
        name: contactName.trim(),
        relationship: contactRelationship.trim(),
        targetFrequencyDays: contactTargetDays,
        customNotes: contactNotes.trim()
      });
      onAwardXP(30, `Added new relationship connection: ${contactName}`);
    }

    setIsContactModalOpen(false);
  };

  const handleSaveRecreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    onAddRecreation({
      date: todayStr,
      title: recTitle.trim(),
      category: recCategory,
      notes: recNotes.trim(),
      rating: recRating,
      xpAwarded: 50
    });

    onAwardXP(50, `Tried new restorative recreation experience: ${recTitle}`);

    setRecTitle('');
    setRecNotes('');
    setShowAddRecreation(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-5 pb-24 font-sans text-neutral-200">
      {/* 1. Social Relationship Matrix (Mobile-First Optimized) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-purple-400 font-mono font-bold">
                  Relational Health
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Target Tracking
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Social Relationship Matrix
              </h2>
            </div>
          </div>

          <button
            onClick={handleOpenAddContact}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Relationship</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Prevent relational isolation during high-intensity hospital duties and exam preparation. Custom cadences trigger alerts before relationships decay:
        </p>

        {/* Contacts Grid: Optimized touch cards for phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map((c) => {
            const daysSince = getDaysSinceContact(c.lastContactDate);
            const isDue = daysSince >= c.targetFrequencyDays;
            const isToday = daysSince === 0;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isToday
                    ? 'bg-neutral-950/60 border-neutral-800'
                    : isDue
                    ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-black/60 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{c.name}</h4>
                      <span className="text-[11px] font-mono text-purple-300 block mt-0.5">
                        {c.relationship}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditContact(c)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                        title="Edit Relationship"
                        aria-label="Edit contact"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteContact(c.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                        title="Delete Contact"
                        aria-label="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {c.customNotes && (
                    <p className="text-xs text-neutral-300 mt-2 italic bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/60">
                      "{c.customNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono mt-3 pt-2 border-t border-neutral-800/70">
                    <span className={isToday ? 'text-emerald-400 font-semibold' : isDue ? 'text-amber-400 font-bold' : 'text-neutral-400'}>
                      {isToday ? 'Contacted Today' : `Last: ${daysSince}d ago`}
                    </span>
                    <span className="text-neutral-400">
                      Target: &le; {c.targetFrequencyDays}d
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <button
                    onClick={() => onContactToday(c.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                      isToday
                        ? 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        : isDue
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                        : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isToday ? 'Contact Recorded Today' : 'Mark Contacted (+30 XP)'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Recreation & Novel Experiences Section (Mobile-First) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold">
                  Novelty &amp; Recovery
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-300">
                  +50 XP Per Activity
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Recreation &amp; Novel Experiences
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowAddRecreation(!showAddRecreation)}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Note New Experience</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Record restorative leisure, new hobbies, outdoor walks, creative experiments, or culinary brewing to cultivate prefrontal recovery and prevent burnout:
        </p>

        {/* Add Recreation Form */}
        {showAddRecreation && (
          <form onSubmit={handleSaveRecreation} className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Log New Recreation / Hobby Activity
              </h4>
              <button
                type="button"
                onClick={() => setShowAddRecreation(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Activity Title</label>
              <input
                type="text"
                required
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                placeholder="e.g. Aeropress Coffee Brewing, Campus Botany Walk, Classical Vinyl Listening"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                <select
                  value={recCategory}
                  onChange={(e) => setRecCategory(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="HOBBY">Hobby &amp; Craft</option>
                  <option value="OUTDOOR">Outdoor &amp; Nature</option>
                  <option value="CREATIVE">Creative Pursuit</option>
                  <option value="READING_FILM">Reading &amp; Film</option>
                  <option value="CULINARY">Culinary &amp; Coffee</option>
                  <option value="OTHER">Other Recreation</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Rating</label>
                <select
                  value={recRating}
                  onChange={(e) => setRecRating(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="5">5 ★ (Highly Restorative)</option>
                  <option value="4">4 ★ (Very Grounding)</option>
                  <option value="3">3 ★ (Moderate)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Restorative Reflection &amp; Sensations</label>
              <textarea
                rows={2}
                value={recNotes}
                onChange={(e) => setRecNotes(e.target.value)}
                placeholder="What sensations, insights, or mental clarity did this activity bring?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Log Experience (+50 XP)
              </button>
            </div>
          </form>
        )}

        {/* Recreation Entries List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recreationList.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-black/60 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {entry.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    {'★'.repeat(entry.rating)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight mt-2">{entry.title}</h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{entry.notes}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-3 pt-2 border-t border-neutral-800/80">
                <span>{formatDateWithDay(entry.date, true)}</span>
                <span className="text-emerald-400 font-semibold">+{entry.xpAwarded} XP</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">
                {editingContact ? 'Edit Contact & Custom Cadence' : 'Add New Relationship Connection'}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ma, Papa, Arjun (Friend), Mentor"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Relationship</label>
                  <select
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Family">Family</option>
                    <option value="Close Friends">Close Friends</option>
                    <option value="Colleagues / On-Call">Colleagues / On-Call</option>
                    <option value="Mentors & Consultants">Mentors &amp; Consultants</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Target Cadence: &le; {contactTargetDays}d
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={contactTargetDays}
                    onChange={(e) => setContactTargetDays(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Context Notes</label>
                <input
                  type="text"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="e.g. Daily morning check-in before ward rounds"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Relationship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
