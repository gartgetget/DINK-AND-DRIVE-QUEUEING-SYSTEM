import React, { useState } from 'react';
import { Player, SkillTier, Court, PaddleQueueItem } from '../types';
import { optimizeDoublesTeams, optimizeSinglesMatch, getPlayersInTier, MatchBalanceResult } from '../utils/matchmaker';
import { 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Check, 
  Flame, 
  Zap, 
  RefreshCw, 
  ArrowRight, 
  Trophy,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { playPaddlePop, playCourtCalledChime } from '../utils/audio';

interface SkillMatchingViewProps {
  allPlayers: Player[];
  activePlayer: Player;
  courts: Court[];
  onAddToQueue: (newItem: Omit<PaddleQueueItem, 'id' | 'queueNumber'>) => void;
  onQuickStartCourt: (courtId: string, teamA: Player[], teamB: Player[], format: 'doubles' | 'singles') => void;
  soundEnabled: boolean;
  onNavigateToCourts: () => void;
  onNavigateToQueue: () => void;
}

export const SkillMatchingView: React.FC<SkillMatchingViewProps> = ({
  allPlayers,
  activePlayer,
  courts,
  onAddToQueue,
  onQuickStartCourt,
  soundEnabled,
  onNavigateToCourts,
  onNavigateToQueue,
}) => {
  const [matchingMode, setMatchingMode] = useState<'doubles_balancer' | 'singles_challenger' | 'tier_browser'>('doubles_balancer');
  
  // Selected 4 players for the doubles balancer (initially picks active player + 3 closest DUPR players)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(() => {
    // Sort other players by closest rating to active player
    const others = allPlayers
      .filter(p => p.id !== activePlayer.id)
      .sort((a, b) => Math.abs(a.duprRating - activePlayer.duprRating) - Math.abs(b.duprRating - activePlayer.duprRating));
    return [activePlayer.id, ...others.slice(0, 3).map(p => p.id)];
  });

  // Selected challenger for singles
  const [selectedChallengerId, setSelectedChallengerId] = useState<string>(() => {
    const closest = allPlayers
      .filter(p => p.id !== activePlayer.id)
      .sort((a, b) => Math.abs((a.singlesDupr ?? a.duprRating) - (activePlayer.singlesDupr ?? activePlayer.duprRating)))[0];
    return closest ? closest.id : allPlayers[1]?.id;
  });

  const [activeTierFilter, setActiveTierFilter] = useState<SkillTier>('All Levels');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Compute balanced doubles pairing
  const selected4Players = allPlayers.filter(p => selectedPlayerIds.includes(p.id));
  const doublesBalanceResult = selected4Players.length === 4 ? optimizeDoublesTeams(selected4Players) : null;

  // Compute singles matchup
  const challenger = allPlayers.find(p => p.id === selectedChallengerId);
  const singlesResult = challenger ? optimizeSinglesMatch(activePlayer, challenger) : null;

  // Auto-pick 3 compatible partners for active user
  const handleAutoPickCompatible = () => {
    const sorted = allPlayers
      .filter(p => p.id !== activePlayer.id)
      .sort((a, b) => Math.abs(a.duprRating - activePlayer.duprRating) - Math.abs(b.duprRating - activePlayer.duprRating));
    setSelectedPlayerIds([activePlayer.id, ...sorted.slice(0, 3).map(p => p.id)]);
    if (soundEnabled) playPaddlePop();
  };

  // Dispatch matched 4 to Paddle Rack Queue
  const handleSendToQueue = (result: MatchBalanceResult) => {
    onAddToQueue({
      teamName: `Balanced ${result.tier.split(' ')[0]} Match`,
      players: [...result.teamA, ...result.teamB],
      format: result.teamA.length === 2 ? 'doubles' : 'singles',
      requestedAt: Date.now(),
      skillTier: result.tier,
      rotationRule: '4-in-4-out',
      estWaitMinutes: 6,
      status: 'waiting',
    });
    if (soundEnabled) playPaddlePop();
    setSuccessNotice('Match successfully balanced and placed into Paddle Rack Queue!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Launch directly to first available court if open
  const openCourt = courts.find(c => c.status === 'available');
  const handleDirectLaunchToCourt = (result: MatchBalanceResult) => {
    if (!openCourt) return;
    onQuickStartCourt(openCourt.id, result.teamA, result.teamB, result.teamA.length === 2 ? 'doubles' : 'singles');
    if (soundEnabled) playCourtCalledChime();
    setSuccessNotice(`Match launched directly onto ${openCourt.name}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase tracking-tight flex items-center gap-2">
              <span>DUPR Skill-Level Matchmaker</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Dynamic Universal Pickleball Rating (DUPR) algorithmic balancer for balanced, competitive games.
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 flex text-xs font-black w-full md:w-auto">
          <button
            id="matchmaker-mode-doubles"
            onClick={() => setMatchingMode('doubles_balancer')}
            className={`px-3.5 py-2 rounded-xl transition-all flex-1 md:flex-initial uppercase tracking-tight ${
              matchingMode === 'doubles_balancer' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doubles Balancer
          </button>
          <button
            id="matchmaker-mode-singles"
            onClick={() => setMatchingMode('singles_challenger')}
            className={`px-3.5 py-2 rounded-xl transition-all flex-1 md:flex-initial uppercase tracking-tight ${
              matchingMode === 'singles_challenger' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1v1 Singles Finder
          </button>
          <button
            id="matchmaker-mode-browser"
            onClick={() => setMatchingMode('tier_browser')}
            className={`px-3.5 py-2 rounded-xl transition-all flex-1 md:flex-initial uppercase tracking-tight ${
              matchingMode === 'tier_browser' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skill Tier Pool
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-lime-100 border-2 border-lime-400 text-slate-900 text-xs font-black flex items-center justify-between shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-lime-700" />
            <span>{successNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToQueue}
              className="underline text-slate-900 hover:text-slate-700 font-black uppercase tracking-wider text-[11px]"
            >
              View Queue
            </button>
            <span>•</span>
            <button
              onClick={onNavigateToCourts}
              className="underline text-slate-900 hover:text-slate-700 font-black uppercase tracking-wider text-[11px]"
            >
              View Courts
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: 4-PLAYER DOUBLES BALANCER */}
      {matchingMode === 'doubles_balancer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Player Selection Pool */}
          <div className="lg:col-span-5 bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Select 4 Players</h3>
                <p className="text-xs font-bold text-slate-500">Currently selected: {selectedPlayerIds.length}/4</p>
              </div>
              <button
                id="auto-pick-compatible-btn"
                onClick={handleAutoPickCompatible}
                className="text-xs text-slate-900 bg-lime-400 hover:bg-lime-300 border-2 border-lime-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black uppercase tracking-tight transition-all shadow-xs"
                title="Auto pick 3 players closest to your DUPR"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Match</span>
              </button>
            </div>

            <div className="max-h-[440px] overflow-y-auto space-y-2 pr-1">
              {allPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id);
                const isSelf = player.id === activePlayer.id;
                const duprDelta = (player.duprRating - activePlayer.duprRating).toFixed(2);
                const isClose = Math.abs(player.duprRating - activePlayer.duprRating) <= 0.35;

                return (
                  <div
                    key={player.id}
                    id={`player-select-card-${player.id}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                      } else {
                        if (selectedPlayerIds.length < 4) {
                          setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                        }
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-lime-100 border-lime-400 text-slate-900 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-300"
                        />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-lime-400 flex items-center justify-center text-[10px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black flex items-center gap-1.5 text-slate-900">
                          <span>{player.name}</span>
                          {isSelf && <span className="text-[9px] bg-slate-900 text-lime-400 px-1.5 py-0.5 rounded-full font-black">You</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">
                          {player.playStyle} • {player.preferredSide} Side
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-slate-900 bg-lime-300 px-2 py-0.5 rounded-full inline-block">
                        {player.duprRating.toFixed(2)}
                      </div>
                      {!isSelf && (
                        <span className={`block text-[10px] font-mono font-bold mt-0.5 ${isClose ? 'text-lime-700' : 'text-slate-400'}`}>
                          {Number(duprDelta) > 0 ? `+${duprDelta}` : duprDelta}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Algorithmic Balance Results */}
          <div className="lg:col-span-7 bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-lime-400 text-slate-900 flex items-center justify-center font-black">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Optimal Doubles Pairing Engine</h3>
                    <p className="text-xs font-bold text-slate-500">Evaluates team combinations for minimal rating differential</p>
                  </div>
                </div>

                {doublesBalanceResult && (
                  <div className="bg-lime-100 border-2 border-lime-400 px-3.5 py-1.5 rounded-2xl text-right shadow-xs">
                    <span className="text-[10px] text-slate-700 block uppercase font-black">Fairness Score</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {doublesBalanceResult.fairnessScore}%
                    </span>
                  </div>
                )}
              </div>

              {doublesBalanceResult ? (
                <div className="space-y-4">
                  {/* Visual Versus Matchup Card */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-[2rem] border-2 border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                      {/* VS divider badge */}
                      <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                        <span className="bg-slate-900 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg">
                          VS
                        </span>
                      </div>

                      {/* TEAM A */}
                      <div className="bg-white border-2 border-lime-400 rounded-2xl p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-lime-800 uppercase tracking-wider">
                            Team A
                          </span>
                          <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Avg: {doublesBalanceResult.avgA}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {doublesBalanceResult.teamA.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.avatar}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                                />
                                <span className="font-black text-slate-900">{p.name}</span>
                              </div>
                              <span className="font-mono text-slate-900 font-black bg-lime-300 px-2 py-0.5 rounded-full text-[11px]">{p.duprRating.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TEAM B */}
                      <div className="bg-white border-2 border-amber-400 rounded-2xl p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                            Team B
                          </span>
                          <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Avg: {doublesBalanceResult.avgB}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {doublesBalanceResult.teamB.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.avatar}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                                />
                                <span className="font-black text-slate-900">{p.name}</span>
                              </div>
                              <span className="font-mono text-amber-950 font-black bg-amber-300 px-2 py-0.5 rounded-full text-[11px]">{p.duprRating.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Differential & Tactical Insights */}
                    <div className="bg-white p-3.5 rounded-xl border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
                      <div>
                        <span className="text-slate-500">Rating Differential: </span>
                        <strong className="text-slate-900 font-mono font-black">
                          Δ {doublesBalanceResult.diff} DUPR
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Bracket: </span>
                        <span className="font-black text-slate-900">{doublesBalanceResult.tier}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-bold bg-lime-100/70 p-3 rounded-xl border-2 border-lime-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{doublesBalanceResult.balanceComment}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2">
                  <p className="text-sm font-black text-slate-800">
                    Select 4 players to calculate optimal pairings.
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    Currently selected: {selectedPlayerIds.length}/4. Click names on the left or use "Auto-Match".
                  </p>
                </div>
              )}
            </div>

            {/* Match Actions */}
            {doublesBalanceResult && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-slate-200">
                <button
                  id="send-balanced-to-queue-btn"
                  onClick={() => handleSendToQueue(doublesBalanceResult)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-lime-400">
                    <path d="M7 2h7c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5H10v5.5a1.5 1.5 0 0 1-3 0V14H7c-2.5 0-4.5-2-4.5-4.5v-3C2.5 4 4.5 2 7 2z"/>
                  </svg>
                  <span>Place Balanced 4 into Paddle Queue</span>
                </button>

                {openCourt ? (
                  <button
                    id="launch-balanced-direct-btn"
                    onClick={() => handleDirectLaunchToCourt(doublesBalanceResult)}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Launch to {openCourt.name}</span>
                  </button>
                ) : (
                  <div className="flex-1 text-center py-3 px-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-xs font-bold text-slate-500 flex items-center justify-center">
                    All courts in play. Use queue button to waitlist.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: 1V1 SINGLES CHALLENGER FINDER */}
      {matchingMode === 'singles_challenger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-md space-y-4">
            <h3 className="text-base font-black text-slate-900">Choose a Singles Challenger</h3>
            <p className="text-xs font-bold text-slate-500">Matching against you ({activePlayer.name} - {activePlayer.duprRating} DUPR)</p>

            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {allPlayers
                .filter(p => p.id !== activePlayer.id)
                .map((player) => {
                  const isSelected = player.id === selectedChallengerId;
                  const delta = Math.abs(player.duprRating - activePlayer.duprRating);

                  return (
                    <div
                      key={player.id}
                      id={`challenger-card-${player.id}`}
                      onClick={() => setSelectedChallengerId(player.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-lime-100 border-lime-400 text-slate-900 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="text-xs font-black text-slate-900">{player.name}</div>
                          <div className="text-[11px] text-slate-500">{player.playStyle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-900 font-black text-xs bg-lime-300 px-2 py-0.5 rounded-full inline-block">
                          {player.duprRating.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-bold mt-0.5">
                          Δ {delta.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
            {singlesResult && challenger ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">1v1 Matchup Analysis</h4>
                  <span className="bg-lime-300 text-slate-900 border border-lime-400 text-xs font-mono font-black px-3 py-1 rounded-full">
                    {singlesResult.fairnessScore}% Compatibility
                  </span>
                </div>

                <div className="bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                  <div className="bg-white p-4 rounded-2xl border-2 border-lime-400 shadow-xs">
                    <img
                      src={activePlayer.avatar}
                      alt={activePlayer.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-lime-400"
                    />
                    <h5 className="font-black text-sm text-slate-900">{activePlayer.name}</h5>
                    <p className="text-xs font-bold text-slate-500">{activePlayer.playStyle}</p>
                    <span className="inline-block mt-2 font-mono font-black text-slate-900 bg-lime-300 px-2.5 py-0.5 rounded-full text-xs">
                      {activePlayer.duprRating.toFixed(2)} DUPR
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-2 border-amber-400 shadow-xs">
                    <img
                      src={challenger.avatar}
                      alt={challenger.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-amber-400"
                    />
                    <h5 className="font-black text-sm text-slate-900">{challenger.name}</h5>
                    <p className="text-xs font-bold text-slate-500">{challenger.playStyle}</p>
                    <span className="inline-block mt-2 font-mono font-black text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-full text-xs">
                      {challenger.duprRating.toFixed(2)} DUPR
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs text-slate-700 font-bold flex items-center justify-between">
                  <span>Rating Spread: <strong className="text-slate-900 font-mono font-black">Δ {singlesResult.diff}</strong></span>
                  <span>Suggested Format: <strong className="text-slate-900">11 pts (Win by 2)</strong></span>
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                  <button
                    id="queue-singles-btn"
                    onClick={() => handleSendToQueue(singlesResult)}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md"
                  >
                    Queue Singles Matchup
                  </button>
                  {openCourt && (
                    <button
                      id="launch-singles-btn"
                      onClick={() => handleDirectLaunchToCourt(singlesResult)}
                      className="flex-1 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider transition-colors shadow-md"
                    >
                      Play on {openCourt.name}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODE 3: TIER BROWSER & DUPR REFERENCE */}
      {matchingMode === 'tier_browser' && (
        <div className="space-y-6">
          {/* Tier filter tabs */}
          <div className="flex flex-wrap gap-2">
            {(['All Levels', 'Novice (2.0-2.9)', 'Intermediate (3.0-3.9)', 'Advanced (4.0-4.9)', 'Elite (5.0+)'] as SkillTier[]).map((tier) => (
              <button
                key={tier}
                id={`tier-filter-${tier}`}
                onClick={() => setActiveTierFilter(tier)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight border-2 transition-all ${
                  activeTierFilter === tier
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getPlayersInTier(allPlayers, activeTierFilter).map((player) => (
              <div
                key={player.id}
                className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-5 space-y-3 hover:border-lime-400 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{player.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500">{player.playStyle}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block">DUPR</span>
                    <span className="font-mono font-black text-slate-900 bg-lime-300 px-2 py-0.5 rounded-full inline-block mt-0.5">{player.duprRating.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block">Win Rate</span>
                    <span className="font-mono font-black text-slate-800 inline-block mt-0.5">{player.winRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{player.preferredSide} Side</span>
                  <span className="text-slate-900 font-black">{player.membershipTier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
