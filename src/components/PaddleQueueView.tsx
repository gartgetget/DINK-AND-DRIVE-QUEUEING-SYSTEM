import React, { useState } from 'react';
import { PaddleQueueItem, Player, Court, SkillTier } from '../types';
import { 
  Users, 
  Plus, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  ChevronRight,
  Flame
} from 'lucide-react';
import { playPaddlePop, playCourtCalledChime } from '../utils/audio';

interface PaddleQueueViewProps {
  queue: PaddleQueueItem[];
  courts: Court[];
  allPlayers: Player[];
  activePlayer: Player;
  onJoinQueue: (newItem: Omit<PaddleQueueItem, 'id' | 'queueNumber'>) => void;
  onLeaveQueue: (queueId: string) => void;
  onReorderQueue: (queueId: string, direction: 'up' | 'down') => void;
  onAssignQueueToCourt: (courtId: string, queueItemId: string) => void;
  soundEnabled: boolean;
}

export const PaddleQueueView: React.FC<PaddleQueueViewProps> = ({
  queue,
  courts,
  allPlayers,
  activePlayer,
  onJoinQueue,
  onLeaveQueue,
  onReorderQueue,
  onAssignQueueToCourt,
  soundEnabled,
}) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [format, setFormat] = useState<'doubles' | 'singles'>('doubles');
  const [teamName, setTeamName] = useState('');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([activePlayer.id]);
  const [selectedTier, setSelectedTier] = useState<SkillTier>('Intermediate (3.0-3.9)');
  const [rotationRule, setRotationRule] = useState<'4-in-4-out' | '2-in-2-out (Winners Stay)' | 'King of Court'>('4-in-4-out');
  const [selectedCourtForCall, setSelectedCourtForCall] = useState<Record<string, string>>({});

  const availableCourts = courts.filter(c => c.status === 'available');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenPlayers = allPlayers.filter(p => selectedPartnerIds.includes(p.id));
    if (chosenPlayers.length === 0) return;

    onJoinQueue({
      teamName: teamName.trim() || `${chosenPlayers[0].name.split(' ')[0]}'s Crew`,
      players: chosenPlayers,
      format,
      requestedAt: Date.now(),
      skillTier: selectedTier,
      rotationRule,
      estWaitMinutes: (queue.length + 1) * 6,
      status: queue.length === 0 ? 'on_deck' : 'waiting',
    });

    if (soundEnabled) playPaddlePop();
    setShowJoinModal(false);
    setSelectedPartnerIds([activePlayer.id]);
    setTeamName('');
  };

  const isUserAlreadyInQueue = queue.some(item => 
    item.players.some(p => p.id === activePlayer.id)
  );

  return (
    <div className="space-y-6">
      {/* Queue Header & Actions */}
      <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase tracking-tight">
              Paddle Rack &amp; Waitlist
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Pickleball paddle rack rotation system. Racks are called automatically as courts finish.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="open-join-queue-modal-btn"
            onClick={() => setShowJoinModal(true)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {/* Paddle icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-lime-400">
              <path d="M7 2h7c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5H10v5.5a1.5 1.5 0 0 1-3 0V14H7c-2.5 0-4.5-2-4.5-4.5v-3C2.5 4 4.5 2 7 2z"/>
            </svg>
            <span>Rack My Paddle (Join Waitlist)</span>
          </button>
        </div>
      </div>

      {/* RACK VISUALIZER & WAITING SLOTS */}
      {queue.length === 0 ? (
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-lime-100 border-2 border-lime-300 text-lime-700 mx-auto flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
              <path d="M7 2h7c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5H10v5.5a1.5 1.5 0 0 1-3 0V14H7c-2.5 0-4.5-2-4.5-4.5v-3C2.5 4 4.5 2 7 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Paddle Rack is Clear</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md mx-auto mt-1">
              There are currently no waiting players. Courts are open or rotating freely. Put your paddle in the rack to claim next court availability!
            </p>
          </div>
          <button
            id="empty-rack-join-btn"
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Be First in the Rack</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-black uppercase tracking-wider">
            <span>ACTIVE PADDLE RACKS IN ORDER OF ARRIVAL</span>
            <span className="font-mono text-slate-900 bg-lime-300 px-2.5 py-0.5 rounded-full font-black">
              {queue.length} Racks Queued
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {queue.map((item, index) => {
              const isOnDeck = index === 0;
              const avgDupr = (item.players.reduce((sum, p) => sum + p.duprRating, 0) / item.players.length).toFixed(2);
              const isCurrentUserInGroup = item.players.some(p => p.id === activePlayer.id);

              return (
                <div
                  key={item.id}
                  id={`queue-item-${item.id}`}
                  className={`rounded-[2.5rem] border-4 transition-all overflow-hidden p-5 sm:p-6 shadow-md ${
                    isOnDeck
                      ? 'bg-lime-100/90 border-lime-400 shadow-xl'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Queue Number & Team Info */}
                    <div className="flex items-center gap-3.5">
                      {/* Rack Slot Badge */}
                      <div className="flex flex-col items-center justify-center">
                        <span className={`w-12 h-12 rounded-2xl font-display font-black text-base flex items-center justify-center shadow-xs ${
                          isOnDeck 
                            ? 'bg-lime-400 text-slate-900 border-2 border-lime-500' 
                            : 'bg-slate-100 text-slate-800 border-2 border-slate-200'
                        }`}>
                          #{index + 1}
                        </span>
                        {isOnDeck && (
                          <span className="text-[9px] font-black uppercase bg-slate-900 text-lime-400 px-2 py-0.5 rounded-full tracking-wider mt-1.5 animate-pulse">
                            ON DECK
                          </span>
                        )}
                      </div>

                      {/* Team & Rule Tags */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-slate-900">{item.teamName || `Rack Slot #${item.queueNumber}`}</h4>
                          {isCurrentUserInGroup && (
                            <span className="bg-slate-900 text-lime-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              Your Paddle
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                            {item.format}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 flex-wrap font-bold">
                          <span className="text-slate-800 font-black flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
                            {item.skillTier} (avg {avgDupr})
                          </span>
                          <span>•</span>
                          <span>Rule: <strong className="text-slate-900">{item.rotationRule}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700 font-mono font-black">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Est. wait: ~{Math.max(2, item.estWaitMinutes - index * 2)}m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Physical Paddle Rack Representation */}
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 w-full lg:w-auto overflow-x-auto">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mr-1 hidden sm:inline">
                        PADDLES:
                      </span>
                      {item.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-1.5 bg-white border-2 border-slate-200 px-2.5 py-1 rounded-xl shrink-0 shadow-xs"
                            title={`${player.name} (${player.duprRating} Meter) - ${player.playStyle}`}
                        >
                          <img
                            src={player.avatar}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover border border-slate-300"
                          />
                          <span className="text-xs font-black text-slate-800 truncate max-w-[85px]">
                            {player.name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-mono text-slate-900 font-black bg-lime-300 px-1.5 rounded-md">
                            {player.duprRating.toFixed(1)}
                          </span>
                        </div>
                      ))}
                      {/* Empty slots indicator if fewer than 4 */}
                      {item.format === 'doubles' && item.players.length < 4 && (
                        <div className="text-[10px] font-black text-amber-900 bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-xl">
                          +{4 - item.players.length} looking for partner
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Call Court Button */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                      {availableCourts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <select
                            id={`court-select-${item.id}`}
                            value={selectedCourtForCall[item.id] || availableCourts[0].id}
                            onChange={(e) => setSelectedCourtForCall({ ...selectedCourtForCall, [item.id]: e.target.value })}
                            className="bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 py-2 px-3 rounded-xl focus:outline-none"
                          >
                            {availableCourts.map(c => (
                              <option key={c.id} value={c.id}>
                                COURT {c.courtNumber}
                              </option>
                            ))}
                          </select>
                          <button
                            id={`call-court-btn-${item.id}`}
                            onClick={() => {
                              const courtId = selectedCourtForCall[item.id] || availableCourts[0].id;
                              if (soundEnabled) playCourtCalledChime();
                              onAssignQueueToCourt(courtId, item.id);
                            }}
                            className="bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Call Court</span>
                          </button>
                        </div>
                      )}

                      {/* Reorder Up/Down */}
                      <div className="flex items-center gap-1 border-l-2 border-slate-200 pl-2">
                        <button
                          id={`bump-up-${item.id}`}
                          disabled={index === 0}
                          onClick={() => onReorderQueue(item.id, 'up')}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`bump-down-${item.id}`}
                          disabled={index === queue.length - 1}
                          onClick={() => onReorderQueue(item.id, 'down')}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`leave-queue-${item.id}`}
                          onClick={() => onLeaveQueue(item.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-500 transition-colors ml-1"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* JOIN QUEUE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-9 h-9 rounded-2xl bg-lime-400 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-900">
                    <path d="M7 2h7c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5H10v5.5a1.5 1.5 0 0 1-3 0V14H7c-2.5 0-4.5-2-4.5-4.5v-3C2.5 4 4.5 2 7 2z"/>
                  </svg>
                </div>
                <h3 className="font-black text-base uppercase tracking-tight">Rack Your Paddle</h3>
              </div>
              <span className="text-xs font-black text-slate-800 bg-lime-300 px-3 py-1 rounded-full">
                Slot #{queue.length + 1}
              </span>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              {/* Format Choice */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">Match Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="join-format-doubles"
                    onClick={() => setFormat('doubles')}
                    className={`py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      format === 'doubles'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Doubles (2 or 4 Paddles)
                  </button>
                  <button
                    type="button"
                    id="join-format-singles"
                    onClick={() => {
                      setFormat('singles');
                      setSelectedPartnerIds([activePlayer.id]);
                    }}
                    className={`py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      format === 'singles'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Singles (1v1)
                  </button>
                </div>
              </div>

              {/* Group / Team Name */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  Team / Paddle Name (Optional)
                </label>
                <input
                  id="join-team-name-input"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={`e.g. ${activePlayer.name.split(' ')[0]}'s Crew`}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Skill Tier */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Target Skill Tier</label>
                <select
                  id="join-skill-tier-select"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as SkillTier)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                >
                  <option value="All Levels">All Levels (Open Play)</option>
                  <option value="Novice (2.0-2.9)">Novice (2.0 - 2.9)</option>
                  <option value="Intermediate (3.0-3.9)">Intermediate (3.0 - 3.9)</option>
                  <option value="Advanced (4.0-4.9)">Advanced (4.0 - 4.9)</option>
                  <option value="Elite (5.0+)">Elite / Pro (5.0+)</option>
                </select>
              </div>

              {/* Rotation Rule */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Preferred Rotation Rule</label>
                <select
                  id="join-rotation-rule-select"
                  value={rotationRule}
                  onChange={(e) => setRotationRule(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                >
                  <option value="4-in-4-out">4-in-4-out (Full Team Rotation)</option>
                  <option value="2-in-2-out (Winners Stay)">2-in-2-out (Winners Stay &amp; Split)</option>
                  <option value="King of Court">King of the Court</option>
                </select>
              </div>

              {/* Select Team Members / Partners */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-700 font-bold mb-1.5">
                  <span>Include Registered Club Partners ({selectedPartnerIds.length} added):</span>
                  <span className="text-[11px] font-black text-lime-700">
                    Active: {activePlayer.name}
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200">
                  {allPlayers.map((player) => {
                    const isSelected = selectedPartnerIds.includes(player.id);
                    const isSelf = player.id === activePlayer.id;

                    return (
                      <button
                        key={player.id}
                        type="button"
                        id={`queue-partner-${player.id}`}
                        onClick={() => {
                          if (isSelf) return; // Must include yourself
                          if (isSelected) {
                            setSelectedPartnerIds(selectedPartnerIds.filter(id => id !== player.id));
                          } else {
                            if (format === 'doubles' && selectedPartnerIds.length < 4) {
                              setSelectedPartnerIds([...selectedPartnerIds, player.id]);
                            } else if (format === 'singles' && selectedPartnerIds.length < 2) {
                              setSelectedPartnerIds([...selectedPartnerIds, player.id]);
                            }
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-lime-100 border-2 border-lime-400 text-slate-900 font-black'
                            : 'hover:bg-white text-slate-700 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover border border-slate-300"
                          />
                          <span>{player.name}</span>
                          {isSelf && <span className="text-[9px] bg-slate-900 text-lime-400 px-1.5 py-0.5 rounded-full">You</span>}
                        </div>
                        <span className="font-mono text-slate-900 font-black bg-lime-300 px-2 py-0.5 rounded-full text-[10px]">
                          {player.duprRating.toFixed(2)} Meter
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  id="cancel-join-queue-modal-btn"
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  id="confirm-join-queue-btn"
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4 text-lime-400" />
                  <span>Place Paddle in Rack</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
