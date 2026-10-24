import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Award,
  Sparkles,
  RefreshCw,
  Check,
  Flame,
  Shield,
  Coffee,
  Youtube,
  Utensils,
  Gamepad,
  Book,
  Moon,
  Tv,
  Compass,
  Music,
  Headphones,
  Sun,
  PenTool,
  Clock,
  Shirt,
  Cake,
  Plus,
  Lock,
  Layers,
  Edit2
} from 'lucide-react';
import { RewardItem } from '../types/index.ts';
import { storage } from '../services/supabaseStorage.ts';

interface RewardStoreProps {
  xpPoints: number;
  onRedeemReward: (item: RewardItem) => void;
  onDeductXP: (xp: number, reason: string) => void;
}

export const RewardStore: React.FC<RewardStoreProps> = ({
  xpPoints,
  onRedeemReward,
  onDeductXP
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [allRewardsPool, setAllRewardsPool] = useState<RewardItem[]>(() =>
    storage.getAllRewardsPool()
  );

  // Daily accessible items (8 items)
  const [dailyAccessibleRewards, setDailyAccessibleRewards] = useState<RewardItem[]>([]);

  // Add custom reward modal state
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState(300);
  const [newCategory, setNewCategory] = useState<RewardItem['category']>('LEISURE');
  const [newIcon, setNewIcon] = useState('Award');

  // Edit reward state
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);

  const [redeemedHistory, setRedeemedHistory] = useState<
    { item: RewardItem; redeemedAt: string }[]
  >([]);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  const handleSaveEditReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    storage.updateReward(editingReward);
    setAllRewardsPool(storage.getAllRewardsPool());
    setPurchaseSuccessMessage(`Updated "${editingReward.title}" in Master Catalog!`);
    setEditingReward(null);
    setTimeout(() => setPurchaseSuccessMessage(null), 3000);
  };

  // Generate 8 randomized accessible items from master pool
  useEffect(() => {
    const pool = [...allRewardsPool];
    // Deterministic pseudo-shuffle using day and seedOffset
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i) + seedOffset;
      hash |= 0;
    }
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng(hash + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const accessible = shuffled.slice(0, 8).map((item, idx) => ({
      ...item,
      isFeaturedToday: idx < 2
    }));

    setDailyAccessibleRewards(accessible);
  }, [allRewardsPool, seedOffset]);

  const handleReroll = () => {
    if (xpPoints < 25) return;
    onDeductXP(25, "Rerolled Today's Reward Shop Selection");
    setSeedOffset((prev) => prev + 1);
    setPurchaseSuccessMessage("Shop refreshed with a fresh randomized selection!");
    setTimeout(() => setPurchaseSuccessMessage(null), 3000);
  };

  const handleRedeem = (item: RewardItem) => {
    if (xpPoints < item.xpCost) return;
    onRedeemReward(item);
    setRedeemedHistory((prev) => [
      { item, redeemedAt: new Date().toISOString() },
      ...prev
    ]);
    setPurchaseSuccessMessage(`Successfully unlocked: ${item.title} (-${item.xpCost} XP)`);
    setTimeout(() => setPurchaseSuccessMessage(null), 3500);
  };

  const handleCreateCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const customReward: RewardItem = {
      id: `custom-rew-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom residency leisure pass',
      xpCost: newCost,
      category: newCategory,
      icon: newIcon,
      isCustom: true
    };

    storage.addCustomReward(customReward);
    setAllRewardsPool(storage.getAllRewardsPool());

    setNewTitle('');
    setNewDescription('');
    setShowAddRewardModal(false);
    setPurchaseSuccessMessage(`Added "${customReward.title}" to Master Reward Catalog!`);
    setTimeout(() => setPurchaseSuccessMessage(null), 3500);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Youtube':
        return <Youtube className="w-5 h-5 text-rose-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-sky-400" />;
      case 'Gamepad':
        return <Gamepad className="w-5 h-5 text-purple-400" />;
      case 'Book':
        return <Book className="w-5 h-5 text-indigo-400" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-blue-300" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-rose-300" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-teal-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-pink-400" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5 text-violet-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-300" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-emerald-300" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-cyan-400" />;
      case 'Cake':
        return <Cake className="w-5 h-5 text-pink-300" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const accessibleIds = new Set(dailyAccessibleRewards.map((r) => r.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* 1. Economy Banner */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                  Asclepius Reward Economy
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  Daily 8-Item Rotation
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Disciplinary Rewards &amp; Leisure Store
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/60 border border-neutral-800 rounded-xl px-4 py-2 font-mono text-right">
              <span className="text-[10px] text-neutral-400 block uppercase">
                Spendable Balance
              </span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                {xpPoints.toLocaleString()} XP
              </span>
            </div>

            <button
              onClick={handleReroll}
              disabled={xpPoints < 25}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              title="Reshuffle today's randomized selection (-25 XP)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reroll (-25 XP)</span>
            </button>

            <button
              onClick={() => setShowAddRewardModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reward</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {purchaseSuccessMessage && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purchaseSuccessMessage}</span>
          </div>
        )}
      </section>

      {/* 2. Today's Accessible Rewards (Randomized 8 Items) */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Today's Accessible &amp; Redeemable Selections (8 Featured)
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Randomized Daily · Guilt-Free Rest
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Only these 8 items can be redeemed today. Unlocked passes guarantee guilt-free leisure earned through disciplined clinical focus:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {dailyAccessibleRewards.map((item) => {
            const canAfford = xpPoints >= item.xpCost;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  item.isFeaturedToday
                    ? 'bg-gradient-to-b from-amber-950/20 to-black/70 border-amber-500/40 ring-1 ring-amber-500/20'
                    : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      {getIcon(item.icon)}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 block">
                        {item.xpCost} XP
                      </span>
                      {item.isFeaturedToday && (
                        <span className="text-[9px] font-mono font-bold text-amber-300 uppercase px-1 py-0.2 rounded bg-amber-500/20 border border-amber-500/30">
                          ★ Daily Deal
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-2.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl text-xs font-semibold font-mono transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                        : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                    }`}
                  >
                    <span>{canAfford ? 'Redeem Pass' : 'Insufficient XP'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Master Reward Catalog & Pool List */}
      <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Complete Rewards Master Catalog ({allRewardsPool.length} Total in Rotation)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddRewardModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reward to Rotation</span>
            </button>
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
              (Random 8 selected each day)
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          This is the entire master catalog of rewards. You can add new rewards or change existing ones. All items enter the randomized rotation pool for the daily shop:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {allRewardsPool.map((item) => {
            const isAccessibleToday = accessibleIds.has(item.id);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-black/60 border border-neutral-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {item.xpCost} XP
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white mt-2 tracking-tight">
                    {item.title}
                  </h5>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                  {isAccessibleToday ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>In Shop</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Reserve</span>
                    </span>
                  )}
                  <button
                    onClick={() => setEditingReward(item)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 font-semibold transition cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Redemption Ledger History */}
      {redeemedHistory.length > 0 && (
        <section className="bg-[#090D14] border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Recently Redeemed Leisure Passes
            </h3>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {redeemedHistory.map((entry, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{entry.item.title}</span>
                  <span className="text-neutral-500 font-mono text-[10px] ml-2">
                    {new Date(entry.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="font-mono text-amber-400 font-bold">-{entry.item.xpCost} XP</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Custom Reward Modal */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">
                Add Custom Reward to Catalog Pool
              </h3>
              <button
                onClick={() => setShowAddRewardModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomReward} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 1hr Deep Sci-Fi Book Reading, Japanese Ramen Dinner"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">XP Cost</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LEISURE">Leisure</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="STUDY">Study Fuel</option>
                    <option value="EXPERIENCE">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What guilt-free relaxation does this grant?"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Add to Master Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white font-mono">
                Edit Reward in Master Catalog
              </h3>
              <button
                onClick={() => setEditingReward(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditReward} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={editingReward.title}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">XP Cost</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={editingReward.xpCost}
                    onChange={(e) => setEditingReward({ ...editingReward, xpCost: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">Category</label>
                  <select
                    value={editingReward.category}
                    onChange={(e) => setEditingReward({ ...editingReward, category: e.target.value as any })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="LEISURE">Leisure</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="STUDY">Study Fuel</option>
                    <option value="EXPERIENCE">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    storage.deleteReward(editingReward.id);
                    setAllRewardsPool(storage.getAllRewardsPool());
                    setEditingReward(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  Remove Reward
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingReward(null)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
