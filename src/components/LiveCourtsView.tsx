import React, { useState } from 'react';
import { Court, Player, PaddleQueueItem } from '../types';
import { CourtDiagram } from './CourtDiagram';
import { 
  Play, 
  RotateCw, 
  Plus, 
  Minus, 
  Clock, 
  Sparkles, 
  Check, 
  X,
  AlertCircle, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Users,
  ChevronRight,
  Flame
} from 'lucide-react';
import { playMatchBuzzer, playCourtCalledChime } from '../utils/audio';

interface LiveCourtsViewProps {
  courts: Court[];
  queue: PaddleQueueItem[];
  allPlayers: Player[];
  activePlayer: Player;
  onUpdateCourtScore: (courtId: string, team: 'A' | 'B', delta: number) => void;
  onEndMatchAndRotate: (courtId: string, rule: '4-in-4-out' | '2-in-2-out (Winners Stay)') => void;
  onAssignQueueToCourt: (courtId: string, queueItemId: string) => void;
  onQuickStartCourt: (courtId: string, teamA: Player[], teamB: Player[], format: 'doubles' | 'singles', rentalHours?: number) => void;
  soundEnabled: boolean;
  onNavigateToQueue: () => void;
}

export const LiveCourtsView: React.FC<LiveCourtsViewProps> = ({
  courts,
  queue,
  allPlayers,
  activePlayer,
  onUpdateCourtScore,
  onEndMatchAndRotate,
  onAssignQueueToCourt,
  onQuickStartCourt,
  soundEnabled,
  onNavigateToQueue,
}) => {
  const [filter, setFilter] = useState<'all' | 'occupied' | 'available' | 'championship'>('all');
  const [selectedCourtForRotation, setSelectedCourtForRotation] = useState<Court | null>(null);
  const [rotationRuleChoice, setRotationRuleChoice] = useState<'4-in-4-out' | '2-in-2-out (Winners Stay)'>('4-in-4-out');
  
  // Quick Start Modal State
  const [quickStartCourtId, setQuickStartCourtId] = useState<string | null>(null);
  const [quickFormat, setQuickFormat] = useState<'doubles' | 'singles'>('doubles');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [rentalHours, setRentalHours] = useState<number>(1);
  const [rentalName, setRentalName] = useState<string>('');
  const [rentalNotice, setRentalNotice] = useState<string | null>(null);

  const filteredCourts = courts.filter((court) => {
    if (filter === 'occupied') return court.status === 'occupied';
    if (filter === 'available') return court.status === 'available';
    if (filter === 'championship') return court.courtType === 'Championship';
    return true;
  });

  const handleStartQuickGame = () => {
    if (!quickStartCourtId) return;
    const chosen = allPlayers.filter(p => selectedPlayerIds.includes(p.id));
    if (quickFormat === 'doubles' && chosen.length === 4) {
      onQuickStartCourt(quickStartCourtId, [chosen[0], chosen[1]], [chosen[2], chosen[3]], 'doubles', rentalHours, rentalName || `${activePlayer.name}'s Rental`);
      setQuickStartCourtId(null);
      setSelectedPlayerIds([]);
      if (soundEnabled) playCourtCalledChime();
    } else if (quickFormat === 'singles' && chosen.length === 2) {
      onQuickStartCourt(quickStartCourtId, [chosen[0]], [chosen[1]], 'singles', rentalHours, rentalName || `${activePlayer.name}'s Rental`);
      setQuickStartCourtId(null);
      setSelectedPlayerIds([]);
      if (soundEnabled) playCourtCalledChime();
    }
  };

  const handleConfirmRotation = () => {
    if (!selectedCourtForRotation) return;
    if (soundEnabled) playMatchBuzzer();
    onEndMatchAndRotate(selectedCourtForRotation.id, rotationRuleChoice);
    setRentalNotice(`COURT ${selectedCourtForRotation.courtNumber} rental completed for ${selectedCourtForRotation.currentGame?.rentalName || 'the current booking'}.`);
    setSelectedCourtForRotation(null);
    window.setTimeout(() => setRentalNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {rentalNotice && (
        <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-2xl px-4 py-3 shadow-md flex items-center justify-between gap-3" role="status">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tight">
            <Check className="w-4 h-4" />
            <span>{rentalNotice}</span>
          </div>
          <button type="button" onClick={() => setRentalNotice(null)} className="text-emerald-800 hover:text-emerald-950" aria-label="Dismiss rental notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Fast Actions */}
      <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display uppercase tracking-tight">
              Courts Rental Queue
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Real-time score tracking, automated paddle rotation rules, and dynamic court assignment.
          </p>
        </div>

        {/* Filters and Queue Callout */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 flex text-xs font-black">
            <button
              id="filter-court-all"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({courts.length})
            </button>
            <button
              id="filter-court-occupied"
              onClick={() => setFilter('occupied')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'occupied' ? 'bg-lime-400 text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Play ({courts.filter(c => c.status === 'occupied').length})
            </button>
            <button
              id="filter-court-available"
              onClick={() => setFilter('available')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'available' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open ({courts.filter(c => c.status === 'available').length})
            </button>
          </div>

          {queue.length > 0 && (
            <button
              id="queue-callout-btn"
              onClick={onNavigateToQueue}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-300 text-xs font-black px-3.5 py-2 rounded-2xl flex items-center gap-1.5 transition-all shadow-sm uppercase tracking-tight"
            >
              <Users className="w-4 h-4" />
              <span>{queue.length} Racks Waiting</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourts.map((court) => {
          const isOccupied = court.status === 'occupied';
          const isAvailable = court.status === 'available';
          const isReserved = court.status === 'reserved';
          const game = court.currentGame;

          // Compute average team ratings
          const avgRatingA = game && game.teamA.length > 0
            ? (game.teamA.reduce((sum, p) => sum + p.duprRating, 0) / game.teamA.length).toFixed(2)
            : '0.00';
          const avgRatingB = game && game.teamB.length > 0
            ? (game.teamB.reduce((sum, p) => sum + p.duprRating, 0) / game.teamB.length).toFixed(2)
            : '0.00';

          return (
            <div
              key={court.id}
              id={`court-card-${court.id}`}
              className={`rounded-[2.5rem] border-4 transition-all flex flex-col justify-between overflow-hidden shadow-md p-5 ${
                isOccupied
                  ? 'bg-lime-100/90 border-lime-400 text-slate-900'
                  : isAvailable
                  ? 'bg-white border-slate-200 hover:border-lime-400 text-slate-800'
                  : 'bg-white border-sky-300 text-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="pb-4 border-b-2 border-slate-200/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shadow-xs ${
                      isOccupied ? 'bg-lime-400 text-slate-900 border border-lime-500' : 'bg-slate-900 text-white'
                    }`}>
                      C{court.courtNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 truncate max-w-[180px]">COURT {court.courtNumber}</h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isOccupied && (
                      <span className="bg-lime-400 text-slate-900 border border-lime-500 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs uppercase tracking-tight">
                        <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                        In Play
                      </span>
                    )}
                    {isAvailable && (
                      <span className="bg-slate-100 text-slate-700 border-2 border-slate-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-tight">
                        Open
                      </span>
                    )}
                    {isReserved && (
                      <span className="bg-blue-400 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tight shadow-xs">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="py-4 flex-1 flex flex-col justify-between space-y-4">
                {isOccupied && game ? (
                  <div className="space-y-3.5">
                    {/* Visual Court Mini Diagram */}
                    <div className="rounded-2xl overflow-hidden border-2 border-lime-300 shadow-xs">
                      <CourtDiagram
                        courtName={`COURT ${court.courtNumber}`}
                        teamA={game.teamA}
                        teamB={game.teamB}
                        scoreA={game.scoreA}
                        scoreB={game.scoreB}
                        compact={true}
                      />
                    </div>

                    {/* Live Score Counter and Match Stats */}
                    <div className="bg-white p-3.5 rounded-2xl border-2 border-lime-300 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-bold">
                        <span className="flex items-center gap-1 text-slate-800 font-black uppercase tracking-tight">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          {game.matchType} ({game.gameFormat})
                        </span>
                        <span className="font-mono text-lime-700 flex items-center gap-1 font-black">
                          <Clock className="w-3 h-3" />
                          Rental: {game.rentalHours ?? 1} hr
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-slate-600 truncate mb-2">
                        Rented by: <span className="text-slate-900">{game.rentalName || 'Court Rental'}</span>
                      </div>

                      {/* Interactive Scoreboard */}
                      <div className="grid grid-cols-2 gap-3 items-center">
                        {/* Team A Score Controls */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200 text-center">
                          <div className="text-[11px] text-slate-700 font-black mb-1 truncate">
                            Team A (avg {avgRatingA})
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              id={`score-minus-a-${court.id}`}
                              onClick={() => onUpdateCourtScore(court.id, 'A', -1)}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center transition-colors font-bold"
                              title="Decrease score"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-2xl font-black font-mono text-slate-900 min-w-[32px]">
                              {game.scoreA}
                            </span>
                            <button
                              id={`score-plus-a-${court.id}`}
                              onClick={() => onUpdateCourtScore(court.id, 'A', 1)}
                              className="w-7 h-7 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-900 font-black flex items-center justify-center transition-colors shadow-xs"
                              title="Point for Team A"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Team B Score Controls */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200 text-center">
                          <div className="text-[11px] text-slate-700 font-black mb-1 truncate">
                            Team B (avg {avgRatingB})
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              id={`score-minus-b-${court.id}`}
                              onClick={() => onUpdateCourtScore(court.id, 'B', -1)}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center transition-colors font-bold"
                              title="Decrease score"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-2xl font-black font-mono text-slate-900 min-w-[32px]">
                              {game.scoreB}
                            </span>
                            <button
                              id={`score-plus-b-${court.id}`}
                              onClick={() => onUpdateCourtScore(court.id, 'B', 1)}
                              className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-black flex items-center justify-center transition-colors shadow-xs"
                              title="Point for Team B"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="py-6 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-lime-100 border-2 border-lime-300 flex items-center justify-center text-lime-600 shadow-sm">
                      <Play className="w-7 h-7 ml-0.5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">Court Ready for Play</h4>
                      <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto mt-0.5">
                        Assign the top waiting paddle rack or launch an open match.
                      </p>
                    </div>

                    {queue.length > 0 && (
                      <div className="w-full bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 text-left">
                        <div className="text-[11px] font-black text-slate-500 mb-1 flex items-center justify-between uppercase tracking-wider">
                          <span>Next in Paddle Rack:</span>
                          <span className="text-lime-700 bg-lime-200 px-2 py-0.5 rounded-full">#1 on Deck</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-slate-800">
                            {queue[0].players.map(p => p.name).join(' & ')}
                          </div>
                          <span className="text-[10px] bg-white border border-slate-200 font-bold text-slate-700 px-2 py-0.5 rounded-full">
                            {queue[0].skillTier}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-sky-600 shadow-sm">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">Reserved Court</h4>
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        Booked by <strong className="text-slate-900">{court.currentReservation?.bookedByName}</strong>
                      </p>
                      <p className="text-xs text-sky-600 font-black font-mono mt-0.5">
                        {court.currentReservation?.startTime} - {court.currentReservation?.endTime}
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-1 font-medium">
                        "{court.currentReservation?.purpose}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="pt-4 border-t-2 border-slate-200/80">
                {isOccupied && (
                  <button
                    id={`rotate-court-btn-${court.id}`}
                    onClick={() => setSelectedCourtForRotation(court)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <RotateCw className="w-4 h-4 text-lime-400" />
                    <span>End Match &amp; Rotate Court</span>
                  </button>
                )}

                {isAvailable && (
                  <div className="flex gap-2">
                    {queue.length > 0 ? (
                      <button
                        id={`assign-next-btn-${court.id}`}
                        onClick={() => onAssignQueueToCourt(court.id, queue[0].id)}
                        className="flex-1 py-3.5 px-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-900 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Call Next Paddle Rack (#{queue[0].queueNumber})</span>
                      </button>
                    ) : (
                      <button
                        id={`quick-start-btn-${court.id}`}
                        onClick={() => {
                          setQuickStartCourtId(court.id);
                          setRentalHours(1);
                          setRentalName(`${activePlayer.name}'s Rental`);
                          setSelectedPlayerIds([activePlayer.id]);
                        }}
                        className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4 text-lime-400" />
                        <span>Quick Start Game</span>
                      </button>
                    )}
                  </div>
                )}

                {isReserved && (
                  <button
                    id={`check-in-reserve-btn-${court.id}`}
                    onClick={() => {
                      const p1 = allPlayers.find(p => p.name === court.currentReservation?.bookedByName) || activePlayer;
                      const dummyOpponent = allPlayers.find(p => p.id !== p1.id) || allPlayers[0];
                      onQuickStartCourt(court.id, [p1], [dummyOpponent], 'singles', 1, `${p1.name}'s Reservation`);
                      if (soundEnabled) playCourtCalledChime();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check-In Booker &amp; Start Match</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ROTATION CONFIRMATION MODAL */}
      {selectedCourtForRotation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-slate-200 rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-900 flex items-center justify-center font-black shadow-sm">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Court Rotation: COURT {selectedCourtForRotation.courtNumber}</h3>
                <p className="text-xs font-bold text-slate-500">Match concluded. Select automated rotation rule.</p>
              </div>
            </div>

            {/* Score Review */}
            {selectedCourtForRotation.currentGame && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-slate-200 text-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Final Game Score</span>
                <div className="flex items-center justify-center gap-4 text-2xl font-mono font-black mt-1">
                  <span className="text-lime-700">Team A: {selectedCourtForRotation.currentGame.scoreA}</span>
                  <span className="text-slate-400">-</span>
                  <span className="text-amber-700">Team B: {selectedCourtForRotation.currentGame.scoreB}</span>
                </div>
              </div>
            )}

            {/* Rotation Rule Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Choose Court Rotation Protocol:</label>
              <div className="space-y-2">
                <button
                  id="rotation-rule-4in4out"
                  type="button"
                  onClick={() => setRotationRuleChoice('4-in-4-out')}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${
                    rotationRuleChoice === '4-in-4-out'
                      ? 'bg-lime-100 border-lime-500 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <span>4-in / 4-out (Full Court Rotation)</span>
                      <span className="text-[10px] font-black bg-lime-400 text-slate-900 px-2 py-0.5 rounded-full">Standard</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">
                      All 4 current players rotate off. The next waitlist paddle rack immediately takes the court.
                    </p>
                  </div>
                  {rotationRuleChoice === '4-in-4-out' && <Check className="w-5 h-5 text-lime-700 shrink-0 mt-0.5" />}
                </button>

                <button
                  id="rotation-rule-2in2out"
                  type="button"
                  onClick={() => setRotationRuleChoice('2-in-2-out (Winners Stay)')}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${
                    rotationRuleChoice === '2-in-2-out (Winners Stay)'
                      ? 'bg-amber-100 border-amber-500 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <span>2-in / 2-out (Winners Stay &amp; Split)</span>
                      <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">Challenge</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">
                      Winning team splits to opposite sides. Top 2 queued players rotate in to join them.
                    </p>
                  </div>
                  {rotationRuleChoice === '2-in-2-out (Winners Stay)' && <Check className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                id="cancel-rotation-modal-btn"
                type="button"
                onClick={() => setSelectedCourtForRotation(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-rotation-modal-btn"
                type="button"
                onClick={handleConfirmRotation}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-lime-400" />
                <span>Execute Rotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK START MODAL */}
      {quickStartCourtId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-slate-200 rounded-[2rem] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-9 h-9 rounded-2xl bg-lime-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current text-slate-900" />
                </div>
                <h3 className="font-black text-base uppercase tracking-tight">Quick Start Match</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-black border border-slate-200">
                {courts.find(c => c.id === quickStartCourtId)?.name}
              </span>
            </div>

            {/* Format Selector */}
            <div className="flex gap-2">
              <button
                id="quick-format-doubles"
                type="button"
                onClick={() => {
                  setQuickFormat('doubles');
                  setSelectedPlayerIds([activePlayer.id]);
                }}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                  quickFormat === 'doubles'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Doubles (4 Players)
              </button>
              <button
                id="quick-format-singles"
                type="button"
                onClick={() => {
                  setQuickFormat('singles');
                  setSelectedPlayerIds([activePlayer.id]);
                }}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                  quickFormat === 'singles'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Singles (2 Players)
              </button>
            </div>

            {/* Rental Duration */}
            <div className="bg-lime-50 p-3.5 rounded-2xl border-2 border-lime-300">
              <label htmlFor="quick-rental-name" className="text-xs font-black text-slate-900 uppercase tracking-tight block mb-1">
                Rental Name
              </label>
              <input
                id="quick-rental-name"
                type="text"
                value={rentalName}
                onChange={(e) => setRentalName(e.target.value)}
                placeholder={`${activePlayer.name}'s Rental`}
                className="w-full bg-white border-2 border-lime-400 rounded-xl px-3 py-2 mb-3 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
              />
              <label htmlFor="quick-rental-hours" className="text-xs font-black text-slate-900 uppercase tracking-tight block mb-1">
                Court Rental Hours
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="quick-rental-hours"
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={rentalHours}
                  onChange={(e) => setRentalHours(Math.max(0.5, Number(e.target.value) || 0.5))}
                  className="w-28 bg-white border-2 border-lime-400 rounded-xl px-3 py-2 text-slate-900 font-mono font-black focus:outline-none focus:border-slate-900"
                />
                <span className="text-xs font-bold text-slate-600">hour(s), default 1 hour</span>
              </div>
            </div>

            {/* Select Players from Directory */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-700 font-bold mb-2">
                <span>Select Players ({selectedPlayerIds.length} of {quickFormat === 'doubles' ? 4 : 2}):</span>
                <span className="text-lime-700 font-black text-[11px]">
                  {quickFormat === 'doubles' ? (4 - selectedPlayerIds.length) : (2 - selectedPlayerIds.length)} more needed
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200">
                {allPlayers.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  const isRequired = quickFormat === 'doubles' ? 4 : 2;
                  return (
                    <button
                      key={player.id}
                      id={`select-player-quick-${player.id}`}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                        } else {
                          if (selectedPlayerIds.length < isRequired) {
                            setSelectedPlayerIds([...selectedPlayerIds, player.id]);
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
                          className="w-6 h-6 rounded-full object-cover border border-slate-300"
                        />
                        <span>{player.name}</span>
                        {player.id === activePlayer.id && (
                          <span className="text-[10px] bg-slate-900 text-lime-400 px-1.5 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{player.playStyle}</span>
                        <span className="font-mono text-slate-900 font-black bg-lime-300 px-2 py-0.5 rounded-full">
                          {player.duprRating.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                id="cancel-quickstart-modal-btn"
                type="button"
                onClick={() => {
                  setQuickStartCourtId(null);
                  setSelectedPlayerIds([]);
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                id="launch-quickstart-btn"
                type="button"
                disabled={selectedPlayerIds.length !== (quickFormat === 'doubles' ? 4 : 2)}
                onClick={handleStartQuickGame}
                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  selectedPlayerIds.length === (quickFormat === 'doubles' ? 4 : 2)
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current text-lime-400" />
                <span>Launch Match to Court</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
