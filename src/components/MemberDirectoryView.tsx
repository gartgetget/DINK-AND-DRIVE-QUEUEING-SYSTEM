import React, { useState } from 'react';
import { Player, SkillTier } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  Trophy, 
  CheckCircle2, 
  Sparkles,
  Flame,
  Award,
  Filter
} from 'lucide-react';
import { playPaddlePop } from '../utils/audio';

interface MemberDirectoryViewProps {
  allPlayers: Player[];
  onRegisterMember: (newPlayer: Player) => void;
  soundEnabled: boolean;
}

export const MemberDirectoryView: React.FC<MemberDirectoryViewProps> = ({
  allPlayers,
  onRegisterMember,
  soundEnabled,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<SkillTier>('All Levels');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Player Form State
  const [name, setName] = useState('');
  const [duprLevel, setDuprLevel] = useState<'Novice' | 'Intermediate' | 'Advanced' | 'Elite'>('Intermediate');
  const [playStyle, setPlayStyle] = useState<Player['playStyle']>('All-Court');
  const [preferredSide, setPreferredSide] = useState<Player['preferredSide']>('Either');
  const [membershipTier, setMembershipTier] = useState<Player['membershipTier']>('Gold Member');

  const filteredPlayers = allPlayers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.playStyle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (tierFilter === 'Novice (2.0-2.9)') return p.duprRating >= 2.0 && p.duprRating < 3.0;
    if (tierFilter === 'Intermediate (3.0-3.9)') return p.duprRating >= 3.0 && p.duprRating < 4.0;
    if (tierFilter === 'Advanced (4.0-4.9)') return p.duprRating >= 4.0 && p.duprRating < 5.0;
    if (tierFilter === 'Elite (5.0+)') return p.duprRating >= 5.0;
    return true;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const duprRatingByLevel = {
      Novice: 2.5,
      Intermediate: 3.5,
      Advanced: 4.5,
      Elite: 5.2,
    };
    const duprRating = duprRatingByLevel[duprLevel];

    const newMember: Player = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      duprRating: Number(duprRating),
      singlesDupr: Number((duprRating - 0.1).toFixed(2)),
      playStyle,
      preferredSide,
      membershipTier,
      gamesPlayed: 0,
      winRate: 50,
      isCheckedIn: true,
      status: 'available',
    };

    onRegisterMember(newMember);
    if (soundEnabled) playPaddlePop();
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase tracking-tight">Member Roster &amp; Skill Ratings</h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Verified club players with Meter ratings, play styles, and win rate analytics.
          </p>
        </div>

        <button
          id="open-add-member-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lime-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Register Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="member-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member name or play style..."
            className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-lime-400 shadow-xs"
          />
        </div>

        {/* Tier filter pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {(['All Levels', 'Novice (2.0-2.9)', 'Intermediate (3.0-3.9)', 'Advanced (4.0-4.9)', 'Elite (5.0+)'] as SkillTier[]).map((tier) => (
            <button
              key={tier}
              id={`member-tier-pill-${tier}`}
              onClick={() => setTierFilter(tier)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-tight whitespace-nowrap border-2 transition-all ${
                tierFilter === tier
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => {
          return (
            <div
              key={player.id}
              id={`member-card-${player.id}`}
              className={`rounded-[2.5rem] border-4 transition-all p-5 flex flex-col justify-between space-y-4 bg-white shadow-sm ${
                'border-slate-200 hover:border-lime-400'
              }`}
            >
              <div className="space-y-3">
                {/* Avatar and Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={player.avatar}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-300"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        {player.name}
                      </h4>
                      <span className="text-[11px] text-slate-600 font-bold block">
                        {player.membershipTier}
                      </span>
                    </div>
                  </div>

                  {/* Meter Pill */}
                  <div className="bg-lime-300 px-3 py-1 rounded-2xl border border-lime-400 text-right">
                    <span className="text-[9px] text-slate-700 uppercase block font-black">Meter</span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      {player.duprRating.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Attributes badges */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full font-black border border-slate-200 uppercase tracking-tight">
                    {player.playStyle}
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full font-black border border-slate-200 uppercase tracking-tight">
                    {player.preferredSide} Side
                  </span>
                </div>

                {/* Performance stats */}
                <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block">Total Matches</span>
                    <span className="font-mono font-black text-slate-800 text-sm mt-0.5 inline-block">{player.gamesPlayed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block">Win Rate</span>
                    <span className="font-mono font-black text-slate-900 text-sm mt-0.5 inline-block">{player.winRate}%</span>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="pt-2 border-t-2 border-slate-100">
                <div className="text-center py-2.5 text-xs font-black text-slate-600 bg-slate-100 rounded-2xl uppercase tracking-wider">
                  Admin Managed Member
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTER MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Users className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-base uppercase tracking-tight">Register Club Member</h3>
              </div>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Full Name</label>
                <input
                  id="new-member-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Matthews"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Meter Level &amp; Rating</label>
                <select
                  id="new-member-dupr"
                  value={duprLevel}
                  onChange={(e) => setDuprLevel(e.target.value as typeof duprLevel)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                >
                  <option value="Novice">Novice - 2.50</option>
                  <option value="Intermediate">Intermediate - 3.50</option>
                  <option value="Advanced">Advanced - 4.50</option>
                  <option value="Elite">Elite - 5.20</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Play Style</label>
                  <select
                    id="new-member-style"
                    value={playStyle}
                    onChange={(e) => setPlayStyle(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                  >
                    <option value="All-Court">All-Court</option>
                    <option value="Kitchen Dinker">Kitchen Dinker</option>
                    <option value="Power Banger">Power Banger</option>
                    <option value="Control & Reset">Control &amp; Reset</option>
                    <option value="Tactical Stacker">Tactical Stacker</option>
                  </select>
                </div>

                <div>
                  <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Preferred Side</label>
                  <select
                    id="new-member-side"
                    value={preferredSide}
                    onChange={(e) => setPreferredSide(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                  >
                    <option value="Either">Either</option>
                    <option value="Left">Left (Stacking)</option>
                    <option value="Right">Right</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 block mb-1 uppercase tracking-tight">Membership Tier</label>
                <select
                  id="new-member-tier"
                  value={membershipTier}
                  onChange={(e) => setMembershipTier(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-lime-400"
                >
                  <option value="Gold Member">Gold Member</option>
                  <option value="Club Champion">Club Champion</option>
                  <option value="Open Play Pass">Open Play Pass</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  id="cancel-add-member-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-tight transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-member-btn"
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
