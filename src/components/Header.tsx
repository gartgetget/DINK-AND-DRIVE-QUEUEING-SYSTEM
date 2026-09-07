import React from 'react';
import { AdminAccount, Player, Court, PaddleQueueItem } from '../types';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Users, 
  Clock, 
  ShieldCheck,
  Database
} from 'lucide-react';
import { playPaddlePop } from '../utils/audio';
import { MongoStatusResponse } from '../services/api';

interface HeaderProps {
  activeTab: 'courts' | 'queue' | 'matchmaking' | 'bookings' | 'members';
  setActiveTab: (tab: 'courts' | 'queue' | 'matchmaking' | 'bookings' | 'members') => void;
  adminAccount: AdminAccount;
  allPlayers: Player[];
  courts: Court[];
  queue: PaddleQueueItem[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  mongoStatus?: MongoStatusResponse | null;
  onOpenMongoModal?: () => void;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  adminAccount,
  allPlayers,
  courts,
  queue,
  soundEnabled,
  setSoundEnabled,
  mongoStatus,
  onOpenMongoModal,
  onAdminLogout,
}) => {
  const occupiedCourtsCount = courts.filter(c => c.status === 'occupied').length;
  const queuedPlayersCount = queue.reduce((acc, item) => acc + item.players.length, 0);
  const avgWaitTime = queue.length > 0 ? queue[0].estWaitMinutes : 0;

  const navItems: Array<{
    id: 'courts' | 'queue' | 'matchmaking' | 'bookings' | 'members';
    label: string;
    badge?: string;
  }> = [
    { id: 'courts', label: 'Courts Rental Queue', badge: `${occupiedCourtsCount}/${courts.length}` },
    { id: 'queue', label: 'Paddle Rack Waitlist', badge: queuedPlayersCount > 0 ? `${queuedPlayersCount}` : undefined },
    { id: 'matchmaking', label: 'Meter Skill Matcher', badge: 'AI Balanced' },
    { id: 'bookings', label: 'Court Reservations' },
    { id: 'members', label: 'Member Directory', badge: `${allPlayers.length}` },
  ];

  return (
    <header className="bg-white border-b-4 border-lime-400 sticky top-0 z-40 shadow-sm">
      {/* Top Utility & Status Ribbon */}
      <div className="bg-amber-100/70 border-b border-amber-200/80 px-4 py-1.5 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Live Metrics Ticker */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-slate-600">Courts:</span>
              <span className="bg-lime-400 text-slate-900 font-black px-2 py-0.5 rounded-full text-[11px]">
                {occupiedCourtsCount} of {courts.length} In Play
              </span>
            </div>
            <div className="h-3.5 w-px bg-amber-300 hidden sm:block" />
            <div className="flex items-center gap-1.5 font-bold">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-600">Waiting:</span>
              <span className="bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full text-[11px]">
                {queuedPlayersCount} in Queue ({queue.length} Racks)
              </span>
            </div>
            <div className="h-3.5 w-px bg-amber-300 hidden sm:block" />
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-600">Estimated Next:</span>
              <span className="bg-sky-400 text-sky-950 font-black px-2 py-0.5 rounded-full text-[11px]">
                {avgWaitTime > 0 ? `~${avgWaitTime} mins` : 'Open Now'}
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5 ml-auto">
            {onOpenMongoModal && (
              <button
                id="mongodb-status-btn"
                onClick={onOpenMongoModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all border shadow-xs bg-white text-slate-800 border-slate-300 hover:border-lime-500 hover:bg-lime-50"
                title="MongoDB Engine Status & Diagnostics"
              >
                <Database className="w-3.5 h-3.5 text-lime-600" />
                <span className="hidden xs:inline text-[11px] font-bold">MongoDB:</span>
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                  mongoStatus?.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-lime-200 text-slate-900'
                }`}>
                  {mongoStatus?.isConnected ? 'Live' : 'Ready'}
                </span>
              </button>
            )}

            <button
              id="sound-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors px-2 py-1 rounded-lg hover:bg-amber-200/60"
              title={soundEnabled ? 'Disable Audio Chimes' : 'Enable Audio Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-lime-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline text-xs font-black">{soundEnabled ? 'Audio: On' : 'Muted'}</span>
            </button>
            <div className="text-slate-900 font-black text-[11px] bg-lime-400 px-2.5 py-0.5 rounded-full border border-lime-500 shadow-xs flex items-center gap-1 uppercase tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              Live Arena ({courts.length} Courts)
            </div>
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Club identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 text-slate-950 border-2 border-white">
            {/* Custom SVG Pickleball Paddle & Ball */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" stroke="none">
              <path d="M7 2h7c2.5 0 4.5 2 4.5 4.5v3c0 2.5-2 4.5-4.5 4.5H10v5.5a1.5 1.5 0 0 1-3 0V14H7c-2.5 0-4.5-2-4.5-4.5v-3C2.5 4 4.5 2 7 2z"/>
              <circle cx="18" cy="18" r="3.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.2"/>
              <circle cx="17.2" cy="17" r="0.6" fill="#0f172a"/>
              <circle cx="18.8" cy="17" r="0.6" fill="#0f172a"/>
              <circle cx="18" cy="19" r="0.6" fill="#0f172a"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                Dink<span className="text-lime-600">&amp;</span>Drive
              </h1>
              <span className="text-[10px] uppercase font-black tracking-wider bg-slate-900 text-lime-400 px-2 py-0.5 rounded-full shadow-xs">
                Verified
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">Court Rotation Engine • Automated Waitlists • Skill Matching</p>
          </div>
        </div>

        {/* Admin Operator Status */}
        <button
          id="admin-profile-logout-btn"
          type="button"
          onClick={onAdminLogout}
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-2xl border-2 border-slate-700 hover:border-lime-400 shadow-sm text-left transition-colors"
          title="Log out of admin account"
        >
          <ShieldCheck className="w-5 h-5 text-lime-400" />
          <div>
            <div className="text-xs font-black text-white uppercase tracking-tight">{adminAccount.name}</div>
            <div className="text-[11px] text-slate-300 font-semibold">Administrator • Logout</div>
          </div>
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <nav className="flex space-x-2 sm:space-x-4 border-t-2 border-slate-100 pt-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (soundEnabled) playPaddlePop();
                }}
                className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-b-4 whitespace-nowrap uppercase tracking-tight ${
                  isActive
                    ? 'border-lime-400 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-lime-200'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
