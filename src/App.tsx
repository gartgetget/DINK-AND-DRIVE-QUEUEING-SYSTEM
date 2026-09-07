import React, { useState, useEffect } from 'react';
import { AdminAccount, Court, Player, PaddleQueueItem, CourtReservation } from './types';
import { INITIAL_COURTS, INITIAL_PLAYERS, INITIAL_QUEUE, INITIAL_RESERVATIONS } from './data/mockData';
import { Header } from './components/Header';
import { LiveCourtsView } from './components/LiveCourtsView';
import { PaddleQueueView } from './components/PaddleQueueView';
import { SkillMatchingView } from './components/SkillMatchingView';
import { CourtBookingView } from './components/CourtBookingView';
import { MemberDirectoryView } from './components/MemberDirectoryView';
import { AdminLoginView } from './components/AdminLoginView';
import { MongoStatusModal } from './components/MongoStatusModal';
import { playCourtCalledChime, playMatchBuzzer } from './utils/audio';
import {
  fetchMongoStatus,
  MongoStatusResponse,
  apiGetCourts,
  apiSaveCourt,
  apiGetPlayers,
  apiCreatePlayer,
  apiGetQueue,
  apiAddQueueItem,
  apiRemoveQueueItem,
  apiReorderQueue,
  apiGetReservations,
  apiAddReservation,
  apiCancelReservation,
} from './services/api';
import { Database } from 'lucide-react';

export default function App() {
  const adminAccount: AdminAccount = {
    id: 'admin-1',
    name: 'System Administrator',
    role: 'admin',
    permissions: 'full_access',
  };
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [queue, setQueue] = useState<PaddleQueueItem[]>(INITIAL_QUEUE);
  const [reservations, setReservations] = useState<CourtReservation[]>(INITIAL_RESERVATIONS);
  const [allPlayers, setAllPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [activePlayer, setActivePlayer] = useState<Player>(INITIAL_PLAYERS[0]); // Elena Rostova (4.85)
  const [activeTab, setActiveTab] = useState<'courts' | 'queue' | 'matchmaking' | 'bookings' | 'members'>('courts');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mongoStatus, setMongoStatus] = useState<MongoStatusResponse | null>(null);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const refreshMongoStatus = async () => {
    const status = await fetchMongoStatus();
    if (status) {
      setMongoStatus(status);
    }
  };

  // Hydrate from MongoDB / REST API on mount
  useEffect(() => {
    async function loadData() {
      refreshMongoStatus();

      const courtsData = await apiGetCourts();
      if (courtsData && courtsData.length > 0) {
        setCourts(courtsData);
      }

      const playersData = await apiGetPlayers();
      if (playersData && playersData.length > 0) {
        setAllPlayers(playersData);
        if (playersData[0]) setActivePlayer(playersData[0]);
      }

      const queueData = await apiGetQueue();
      if (queueData) {
        setQueue(queueData);
      }

      const resData = await apiGetReservations();
      if (resData) {
        setReservations(resData);
      }
    }
    loadData();
  }, []);

  // Score keeper handler
  const handleUpdateCourtScore = (courtId: string, team: 'A' | 'B', delta: number) => {
    let updatedTarget: Court | null = null;
    setCourts(prev => prev.map(court => {
      if (court.id !== courtId || !court.currentGame) return court;
      const game = court.currentGame;
      let newScoreA = game.scoreA;
      let newScoreB = game.scoreB;

      if (team === 'A') {
        newScoreA = Math.max(0, game.scoreA + delta);
      } else {
        newScoreB = Math.max(0, game.scoreB + delta);
      }

      const updated = {
        ...court,
        currentGame: {
          ...game,
          scoreA: newScoreA,
          scoreB: newScoreB,
        }
      };
      updatedTarget = updated;
      return updated;
    }));

    if (updatedTarget) {
      apiSaveCourt(updatedTarget);
    }
  };

  // Automated Rotation: End match and pull next from queue
  const handleEndMatchAndRotate = (courtId: string, rule: '4-in-4-out' | '2-in-2-out (Winners Stay)') => {
    const targetCourt = courts.find(c => c.id === courtId);
    if (!targetCourt || !targetCourt.currentGame) return;

    if (rule === '4-in-4-out') {
      // Check if queue has waiting players
      if (queue.length > 0) {
        const nextItem = queue[0];
        const remainingQueue = queue.slice(1);

        let newTeamA: Player[] = [];
        let newTeamB: Player[] = [];

        if (nextItem.players.length >= 4) {
          newTeamA = [nextItem.players[0], nextItem.players[1]];
          newTeamB = [nextItem.players[2], nextItem.players[3]];
        } else if (nextItem.players.length === 2) {
          newTeamA = [nextItem.players[0]];
          newTeamB = [nextItem.players[1]];
        } else {
          // If 1 or 3 players, borrow from active players
          const fillers = allPlayers.filter(p => !nextItem.players.some(np => np.id === p.id));
          const combined = [...nextItem.players, ...fillers.slice(0, 4 - nextItem.players.length)];
          newTeamA = [combined[0], combined[1]];
          newTeamB = [combined[2], combined[3]];
        }

        setCourts(prev => prev.map(c => {
          if (c.id !== courtId) return c;
          return {
            ...c,
            status: 'occupied',
            currentGame: {
              matchId: `match-${Date.now()}`,
              teamA: newTeamA,
              teamB: newTeamB,
              startTime: Date.now(),
              durationMinutes: 15,
              scoreA: 0,
              scoreB: 0,
              rentalHours: 1,
              rentalName: nextItem.teamName || nextItem.players.map(player => player.name).join(' & '),
              matchType: newTeamA.length === 2 ? 'doubles' : 'singles',
              gameFormat: '11 pts (Win by 2)',
            }
          };
        }));

        setQueue(remainingQueue);
      } else {
        // No queue: Court opens up
        setCourts(prev => prev.map(c => {
          if (c.id !== courtId) return c;
          return {
            ...c,
            status: 'available',
            currentGame: undefined,
          };
        }));
      }
    } else if (rule === '2-in-2-out (Winners Stay)') {
      const game = targetCourt.currentGame;
      const teamAWon = game.scoreA >= game.scoreB;
      const winningTeam = teamAWon ? game.teamA : game.teamB;

      if (queue.length > 0) {
        const nextItem = queue[0];
        const remainingQueue = queue.slice(1);

        const challenger1 = nextItem.players[0] || allPlayers[4];
        const challenger2 = nextItem.players[1] || allPlayers[5];

        // Winners split: Winner 1 + Challenger 1 vs Winner 2 + Challenger 2
        const winner1 = winningTeam[0] || allPlayers[0];
        const winner2 = winningTeam[1] || allPlayers[1];

        setCourts(prev => prev.map(c => {
          if (c.id !== courtId) return c;
          return {
            ...c,
            status: 'occupied',
            currentGame: {
              matchId: `match-${Date.now()}`,
              teamA: [winner1, challenger1],
              teamB: [winner2, challenger2],
              startTime: Date.now(),
              durationMinutes: 15,
              scoreA: 0,
              scoreB: 0,
              rentalHours: 1,
              rentalName: nextItem.teamName || nextItem.players.map(player => player.name).join(' & '),
              matchType: 'doubles',
              gameFormat: '11 pts (Win by 2)',
            }
          };
        }));

        setQueue(remainingQueue);
      } else {
        // Free the court
        setCourts(prev => prev.map(c => {
          if (c.id !== courtId) return c;
          return {
            ...c,
            status: 'available',
            currentGame: undefined,
          };
        }));
      }
    }
  };

  // Assign a specific queue item to a court
  const handleAssignQueueToCourt = (courtId: string, queueItemId: string) => {
    const queueItem = queue.find(q => q.id === queueItemId);
    if (!queueItem) return;

    let teamA: Player[] = [];
    let teamB: Player[] = [];

    if (queueItem.players.length >= 4) {
      teamA = [queueItem.players[0], queueItem.players[1]];
      teamB = [queueItem.players[2], queueItem.players[3]];
    } else if (queueItem.players.length === 2) {
      teamA = [queueItem.players[0]];
      teamB = [queueItem.players[1]];
    } else {
      const fillers = allPlayers.filter(p => !queueItem.players.some(np => np.id === p.id));
      const combined = [...queueItem.players, ...fillers.slice(0, 4 - queueItem.players.length)];
      teamA = [combined[0], combined[1]];
      teamB = [combined[2], combined[3]];
    }

    setCourts(prev => prev.map(c => {
      if (c.id !== courtId) return c;
      return {
        ...c,
        status: 'occupied',
        currentGame: {
          matchId: `match-${Date.now()}`,
          teamA,
          teamB,
          startTime: Date.now(),
          durationMinutes: 15,
          scoreA: 0,
          scoreB: 0,
          rentalHours: 1,
          rentalName: queueItem.teamName || queueItem.players.map(player => player.name).join(' & '),
          matchType: teamA.length === 2 ? 'doubles' : 'singles',
          gameFormat: '11 pts (Win by 2)',
        }
      };
    }));

    setQueue(prev => prev.filter(q => q.id !== queueItemId));
  };

  // Quick Start Game direct to court
  const handleQuickStartCourt = (courtId: string, teamA: Player[], teamB: Player[], format: 'doubles' | 'singles', rentalHours = 1, rentalName = 'Court Rental') => {
    setCourts(prev => prev.map(c => {
      if (c.id !== courtId) return c;
      return {
        ...c,
        status: 'occupied',
        currentGame: {
          matchId: `match-${Date.now()}`,
          teamA,
          teamB,
          startTime: Date.now(),
          durationMinutes: 15,
          scoreA: 0,
          scoreB: 0,
          rentalHours,
          rentalName,
          matchType: format,
          gameFormat: '11 pts (Win by 2)',
        }
      };
    }));
  };

  // Queue Operations
  const handleJoinQueue = (newItem: Omit<PaddleQueueItem, 'id' | 'queueNumber'>) => {
    const nextQueueNumber = queue.length > 0 ? Math.max(...queue.map(q => q.queueNumber)) + 1 : 1;
    const item: PaddleQueueItem = {
      ...newItem,
      id: `queue-${Date.now()}`,
      queueNumber: nextQueueNumber,
    };
    setQueue(prev => [...prev, item]);
    apiAddQueueItem(item);
  };

  const handleLeaveQueue = (queueId: string) => {
    setQueue(prev => prev.filter(q => q.id !== queueId));
    apiRemoveQueueItem(queueId);
  };

  const handleReorderQueue = (queueId: string, direction: 'up' | 'down') => {
    setQueue(prev => {
      const idx = prev.findIndex(q => q.id === queueId);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;

      const newQueue = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const temp = newQueue[idx];
      newQueue[idx] = newQueue[targetIdx];
      newQueue[targetIdx] = temp;
      apiReorderQueue(newQueue);
      return newQueue;
    });
  };

  // Reservation Operations
  const handleAddReservation = (res: Omit<CourtReservation, 'id'>) => {
    const newReservation: CourtReservation = {
      ...res,
      id: `res-${Date.now()}`,
    };
    setReservations(prev => [newReservation, ...prev]);
    apiAddReservation(newReservation);
  };

  const handleCancelReservation = (resId: string) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'cancelled' } : r));
    apiCancelReservation(resId);
  };

  // Member Registration
  const handleRegisterMember = (newPlayer: Player) => {
    setAllPlayers(prev => [newPlayer, ...prev]);
    apiCreatePlayer(newPlayer);
  };

  if (!isAdminAuthenticated) {
    return <AdminLoginView onLogin={() => setIsAdminAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 flex flex-col font-sans selection:bg-lime-400 selection:text-slate-900">
      {/* Header with live statistics and profile switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminAccount={adminAccount}
        allPlayers={allPlayers}
        courts={courts}
        queue={queue}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        mongoStatus={mongoStatus}
        onOpenMongoModal={() => setIsMongoModalOpen(true)}
        onAdminLogout={() => setIsAdminAuthenticated(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'courts' && (
          <LiveCourtsView
            courts={courts}
            queue={queue}
            allPlayers={allPlayers}
            activePlayer={activePlayer}
            onUpdateCourtScore={handleUpdateCourtScore}
            onEndMatchAndRotate={handleEndMatchAndRotate}
            onAssignQueueToCourt={handleAssignQueueToCourt}
            onQuickStartCourt={handleQuickStartCourt}
            soundEnabled={soundEnabled}
            onNavigateToQueue={() => setActiveTab('queue')}
          />
        )}

        {activeTab === 'queue' && (
          <PaddleQueueView
            queue={queue}
            courts={courts}
            allPlayers={allPlayers}
            activePlayer={activePlayer}
            onJoinQueue={handleJoinQueue}
            onLeaveQueue={handleLeaveQueue}
            onReorderQueue={handleReorderQueue}
            onAssignQueueToCourt={handleAssignQueueToCourt}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'matchmaking' && (
          <SkillMatchingView
            allPlayers={allPlayers}
            activePlayer={activePlayer}
            courts={courts}
            onAddToQueue={handleJoinQueue}
            onQuickStartCourt={handleQuickStartCourt}
            soundEnabled={soundEnabled}
            onNavigateToCourts={() => setActiveTab('courts')}
            onNavigateToQueue={() => setActiveTab('queue')}
          />
        )}

        {activeTab === 'bookings' && (
          <CourtBookingView
            courts={courts}
            reservations={reservations}
            allPlayers={allPlayers}
            activePlayer={activePlayer}
            onAddReservation={handleAddReservation}
            onCancelReservation={handleCancelReservation}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'members' && (
          <MemberDirectoryView
            allPlayers={allPlayers}
            onRegisterMember={handleRegisterMember}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Global Quick Status Footer */}
      <footer className="bg-slate-900 border-t-4 border-slate-950 py-4 px-6 sm:px-8 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="font-black uppercase tracking-wider text-white">Dink&amp;Drive Operational</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <div className="text-slate-300 font-bold">
              <span>{courts.filter(c => c.status === 'occupied').length} / {courts.length} Courts In Play</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <button
              id="footer-mongodb-status"
              onClick={() => setIsMongoModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-lime-400 transition-colors font-mono text-[11px]"
              title="View MongoDB connection details"
            >
              <Database className="w-3 h-3 text-lime-400" />
              <span>MongoDB: {mongoStatus?.isConnected ? 'Cluster Live' : 'Base Ready (14 Courts)'}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-xs">
            <span>Managed by <strong className="text-lime-400 font-black">{adminAccount.name}</strong></span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('matchmaking')}
              className="bg-lime-400 text-slate-900 font-black px-2.5 py-1 rounded-lg hover:bg-lime-300 transition-colors uppercase tracking-tight text-[11px]"
            >
              Matchmaker
            </button>
          </div>
        </div>
      </footer>

      {/* MongoDB Diagnostics & Config Modal */}
      <MongoStatusModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
        status={mongoStatus}
        onRefresh={refreshMongoStatus}
      />
    </div>
  );
}
