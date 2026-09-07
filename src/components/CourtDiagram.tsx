import React from 'react';
import { Player } from '../types';

interface CourtDiagramProps {
  teamA?: Player[];
  teamB?: Player[];
  scoreA?: number;
  scoreB?: number;
  courtName?: string;
  compact?: boolean;
}

export const CourtDiagram: React.FC<CourtDiagramProps> = ({
  teamA = [],
  teamB = [],
  scoreA = 0,
  scoreB = 0,
  courtName,
  compact = false,
}) => {
  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-inner ${compact ? 'p-2' : 'p-4'}`}>
      {courtName && (
        <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {courtName}
          </span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-600 font-mono text-emerald-400">
            {scoreA} - {scoreB}
          </span>
        </div>
      )}

      {/* Pickleball Court Graphic: 20ft wide x 44ft long (2:1 aspect ratio roughly) */}
      <div
        className={`relative w-full mx-auto rounded-lg overflow-hidden border-2 border-white/80 bg-[#1e4b85] shadow-lg flex flex-col justify-between ${
          compact ? 'h-36' : 'h-52'
        }`}
      >
        {/* Court Boundary Lines and Markings */}
        
        {/* TEAM B HALF (Top) */}
        <div className="relative flex-1 bg-[#1a4073] flex flex-col">
          {/* Baseline area */}
          <div className="flex-1 relative flex">
            {/* Left Service Court (from player perspective) */}
            <div className="flex-1 border-r border-white/80 flex items-center justify-center p-1 relative">
              <span className="absolute top-1 left-1.5 text-[9px] font-mono text-white/40 select-none">L SVC</span>
              {teamB[0] && (
                <div className="flex flex-col items-center z-10 transition-transform hover:scale-105">
                  <img
                    src={teamB[0].avatar}
                    alt={teamB[0].name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-amber-400 shadow object-cover"
                  />
                  <span className="text-[9px] font-semibold text-white bg-slate-900/80 px-1 rounded truncate max-w-[65px] mt-0.5">
                    {teamB[0].name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Right Service Court */}
            <div className="flex-1 flex items-center justify-center p-1 relative">
              <span className="absolute top-1 right-1.5 text-[9px] font-mono text-white/40 select-none">R SVC</span>
              {teamB[1] && (
                <div className="flex flex-col items-center z-10 transition-transform hover:scale-105">
                  <img
                    src={teamB[1].avatar}
                    alt={teamB[1].name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-amber-400 shadow object-cover"
                  />
                  <span className="text-[9px] font-semibold text-white bg-slate-900/80 px-1 rounded truncate max-w-[65px] mt-0.5">
                    {teamB[1].name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Top Non-Volley Zone (The Kitchen) - 7ft */}
          <div className="h-6 sm:h-8 bg-[#15803d]/80 border-t-2 border-white/90 flex items-center justify-center relative">
            <span className="text-[8px] sm:text-[10px] tracking-widest font-bold text-white/70 uppercase">
              Kitchen (NVZ)
            </span>
          </div>
        </div>

        {/* NET LINE (Center) */}
        <div className="relative h-2 bg-slate-300 border-y border-slate-400 flex items-center justify-center z-20 shadow-sm">
          <div className="absolute -left-1 w-2.5 h-3.5 bg-slate-800 rounded-sm" title="Net Post" />
          <div className="w-full h-0.5 bg-slate-700 dashed" />
          <span className="absolute bg-white/90 text-slate-800 text-[8px] font-extrabold px-1 rounded uppercase tracking-tighter shadow-xs">
            NET
          </span>
          <div className="absolute -right-1 w-2.5 h-3.5 bg-slate-800 rounded-sm" title="Net Post" />
        </div>

        {/* TEAM A HALF (Bottom) */}
        <div className="relative flex-1 bg-[#1a4073] flex flex-col justify-between">
          {/* Bottom Non-Volley Zone (The Kitchen) - 7ft */}
          <div className="h-6 sm:h-8 bg-[#15803d]/80 border-b-2 border-white/90 flex items-center justify-center relative">
            <span className="text-[8px] sm:text-[10px] tracking-widest font-bold text-white/70 uppercase">
              Kitchen (NVZ)
            </span>
          </div>

          {/* Baseline Area */}
          <div className="flex-1 relative flex">
            {/* Right Service Court (Team A) */}
            <div className="flex-1 border-r border-white/80 flex items-center justify-center p-1 relative">
              <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-white/40 select-none">R SVC</span>
              {teamA[0] && (
                <div className="flex flex-col items-center z-10 transition-transform hover:scale-105">
                  <img
                    src={teamA[0].avatar}
                    alt={teamA[0].name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-emerald-400 shadow object-cover"
                  />
                  <span className="text-[9px] font-semibold text-white bg-slate-900/80 px-1 rounded truncate max-w-[65px] mt-0.5">
                    {teamA[0].name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Left Service Court (Team A) */}
            <div className="flex-1 flex items-center justify-center p-1 relative">
              <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/40 select-none">L SVC</span>
              {teamA[1] && (
                <div className="flex flex-col items-center z-10 transition-transform hover:scale-105">
                  <img
                    src={teamA[1].avatar}
                    alt={teamA[1].name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-emerald-400 shadow object-cover"
                  />
                  <span className="text-[9px] font-semibold text-white bg-slate-900/80 px-1 rounded truncate max-w-[65px] mt-0.5">
                    {teamA[1].name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Details Footer */}
      {!compact && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/80 p-1.5 rounded border border-emerald-500/30">
            <span className="text-emerald-400 font-bold block mb-0.5">Team A</span>
            <div className="text-slate-300 truncate">
              {teamA.map(p => `${p.name} (${p.duprRating})`).join(', ') || 'Awaiting players'}
            </div>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded border border-amber-500/30">
            <span className="text-amber-400 font-bold block mb-0.5">Team B</span>
            <div className="text-slate-300 truncate">
              {teamB.map(p => `${p.name} (${p.duprRating})`).join(', ') || 'Awaiting players'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
