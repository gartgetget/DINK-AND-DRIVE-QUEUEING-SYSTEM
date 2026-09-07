export type SkillTier = 'All Levels' | 'Novice (2.0-2.9)' | 'Intermediate (3.0-3.9)' | 'Advanced (4.0-4.9)' | 'Elite (5.0+)';

export interface AdminAccount {
  id: string;
  name: string;
  role: 'admin';
  permissions: 'full_access';
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  duprRating: number; // e.g., 3.65
  singlesDupr?: number;
  phone?: string;
  email?: string;
  playStyle: 'All-Court' | 'Kitchen Dinker' | 'Power Banger' | 'Control & Reset' | 'Tactical Stacker';
  preferredSide: 'Left' | 'Right' | 'Either';
  membershipTier: 'Club Champion' | 'Gold Member' | 'Open Play Pass';
  gamesPlayed: number;
  winRate: number; // percentage e.g. 68
  isCheckedIn: boolean;
  status: 'available' | 'in_queue' | 'on_court' | 'booked';
  currentCourtId?: string;
}

export interface Court {
  id: string;
  name: string;
  courtNumber: number;
  surface: 'Pro-Cushion Acrylic' | 'Competition Hardcourt' | 'Covered Turf-Blend';
  isIndoor: boolean;
  hasLights: boolean;
  courtType: 'Championship' | 'Standard' | 'Training / Ball Machine' | 'Covered Pavilion';
  status: 'occupied' | 'available' | 'reserved' | 'maintenance';
  currentGame?: {
    matchId: string;
    teamA: Player[];
    teamB: Player[];
    startTime: number; // timestamp
    durationMinutes: number; // standard duration
    rentalHours?: number; // court rental duration in hours
    rentalName?: string; // name attached to the court rental
    scoreA: number;
    scoreB: number;
    matchType: 'doubles' | 'singles';
    gameFormat: '11 pts (Win by 2)' | '15 pts (Sudden Death)' | '15 min Timed Play';
  };
  currentReservation?: {
    id: string;
    bookedByName: string;
    startTime: string;
    endTime: string;
    purpose: string;
  };
}

export interface PaddleQueueItem {
  id: string;
  queueNumber: number;
  teamName?: string;
  players: Player[];
  format: 'doubles' | 'singles';
  requestedAt: number; // timestamp
  skillTier: SkillTier;
  rotationRule: '4-in-4-out' | '2-in-2-out (Winners Stay)' | 'King of Court' | 'Challenge Court';
  preferredCourtId?: string;
  estWaitMinutes: number;
  status: 'waiting' | 'on_deck' | 'called' | 'playing';
}

export interface CourtReservation {
  id: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  bookedBy: Player;
  players: Player[];
  matchType: 'doubles' | 'singles' | 'coaching' | 'open_session';
  fee: number;
  notes?: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface MatchmakingRequest {
  id: string;
  initiator: Player;
  targetTier: SkillTier;
  minDupr: number;
  maxDupr: number;
  format: 'doubles' | 'singles';
  competitiveLevel: 'Casual Fun' | 'Competitive Meter Rated' | 'Skill Building Drills';
  preferredTime: 'Now (Next Court)' | 'Within 30 Mins' | 'Scheduled Open Play';
  matchedGroup?: {
    teamA: Player[];
    teamB: Player[];
    avgRatingA: number;
    avgRatingB: number;
    fairnessPercentage: number;
    duprVariance: number;
  };
}
