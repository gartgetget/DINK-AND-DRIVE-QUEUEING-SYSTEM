var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/mongodb.ts
var import_mongodb = require("mongodb");

// src/data/mockData.ts
var INITIAL_PLAYERS = [
  {
    id: "p1",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.85,
    singlesDupr: 4.7,
    phone: "(555) 234-5678",
    email: "elena.rostova@club.com",
    playStyle: "Control & Reset",
    preferredSide: "Left",
    membershipTier: "Club Champion",
    gamesPlayed: 142,
    winRate: 74,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-1"
  },
  {
    id: "p2",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.75,
    singlesDupr: 4.6,
    phone: "(555) 345-6789",
    email: "marcus.vance@club.com",
    playStyle: "Power Banger",
    preferredSide: "Right",
    membershipTier: "Club Champion",
    gamesPlayed: 128,
    winRate: 69,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-1"
  },
  {
    id: "p3",
    name: "Tariq Al-Mansoor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.6,
    singlesDupr: 4.5,
    phone: "(555) 456-7890",
    email: "tariq.m@club.com",
    playStyle: "Tactical Stacker",
    preferredSide: "Left",
    membershipTier: "Gold Member",
    gamesPlayed: 96,
    winRate: 65,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-1"
  },
  {
    id: "p4",
    name: "Chloe Zhang",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.65,
    singlesDupr: 4.55,
    phone: "(555) 567-8901",
    email: "chloe.z@club.com",
    playStyle: "Kitchen Dinker",
    preferredSide: "Right",
    membershipTier: "Club Champion",
    gamesPlayed: 110,
    winRate: 70,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-1"
  },
  {
    id: "p5",
    name: "Dave Miller",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.4,
    singlesDupr: 3.25,
    phone: "(555) 678-9012",
    email: "dave.miller@club.com",
    playStyle: "All-Court",
    preferredSide: "Either",
    membershipTier: "Gold Member",
    gamesPlayed: 54,
    winRate: 52,
    isCheckedIn: true,
    status: "in_queue"
  },
  {
    id: "p6",
    name: "Maya Patel",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.65,
    singlesDupr: 3.5,
    phone: "(555) 789-0123",
    email: "maya.patel@club.com",
    playStyle: "Kitchen Dinker",
    preferredSide: "Right",
    membershipTier: "Gold Member",
    gamesPlayed: 82,
    winRate: 58,
    isCheckedIn: true,
    status: "in_queue"
  },
  {
    id: "p7",
    name: "Brandon Cole",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.55,
    singlesDupr: 3.6,
    phone: "(555) 890-1234",
    email: "b.cole@club.com",
    playStyle: "Power Banger",
    preferredSide: "Left",
    membershipTier: "Open Play Pass",
    gamesPlayed: 45,
    winRate: 51,
    isCheckedIn: true,
    status: "in_queue"
  },
  {
    id: "p8",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.5,
    singlesDupr: 3.4,
    phone: "(555) 901-2345",
    email: "sarah.j@club.com",
    playStyle: "Control & Reset",
    preferredSide: "Either",
    membershipTier: "Gold Member",
    gamesPlayed: 60,
    winRate: 55,
    isCheckedIn: true,
    status: "in_queue"
  },
  {
    id: "p9",
    name: "Lucas Kim",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    duprRating: 2.85,
    singlesDupr: 2.75,
    phone: "(555) 012-3456",
    email: "lucas.kim@club.com",
    playStyle: "All-Court",
    preferredSide: "Right",
    membershipTier: "Open Play Pass",
    gamesPlayed: 28,
    winRate: 46,
    isCheckedIn: true,
    status: "available"
  },
  {
    id: "p10",
    name: "Olivia Martinez",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    duprRating: 2.9,
    singlesDupr: 2.8,
    phone: "(555) 123-4567",
    email: "olivia.m@club.com",
    playStyle: "Control & Reset",
    preferredSide: "Left",
    membershipTier: "Open Play Pass",
    gamesPlayed: 32,
    winRate: 48,
    isCheckedIn: true,
    status: "available"
  },
  {
    id: "p11",
    name: "Jackson Reed",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.15,
    singlesDupr: 4.2,
    phone: "(555) 223-3445",
    email: "j.reed@club.com",
    playStyle: "Tactical Stacker",
    preferredSide: "Left",
    membershipTier: "Club Champion",
    gamesPlayed: 94,
    winRate: 64,
    isCheckedIn: true,
    status: "available"
  },
  {
    id: "p12",
    name: "Rachel Adams",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.1,
    singlesDupr: 3.95,
    phone: "(555) 334-4556",
    email: "rachel.a@club.com",
    playStyle: "Kitchen Dinker",
    preferredSide: "Right",
    membershipTier: "Gold Member",
    gamesPlayed: 78,
    winRate: 62,
    isCheckedIn: true,
    status: "available"
  },
  {
    id: "p13",
    name: "Carlos Mendez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.25,
    singlesDupr: 4.15,
    phone: "(555) 445-5667",
    email: "carlos.m@club.com",
    playStyle: "Power Banger",
    preferredSide: "Left",
    membershipTier: "Club Champion",
    gamesPlayed: 88,
    winRate: 66,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-7"
  },
  {
    id: "p14",
    name: "Nina Johansson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    duprRating: 4.3,
    singlesDupr: 4.2,
    phone: "(555) 556-6778",
    email: "nina.j@club.com",
    playStyle: "Kitchen Dinker",
    preferredSide: "Right",
    membershipTier: "Gold Member",
    gamesPlayed: 92,
    winRate: 67,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-7"
  },
  {
    id: "p15",
    name: "Samuel Wright",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.8,
    singlesDupr: 3.7,
    phone: "(555) 667-7889",
    email: "sam.wright@club.com",
    playStyle: "Control & Reset",
    preferredSide: "Either",
    membershipTier: "Gold Member",
    gamesPlayed: 64,
    winRate: 59,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-7"
  },
  {
    id: "p16",
    name: "Amara Diallo",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.75,
    singlesDupr: 3.65,
    phone: "(555) 778-8990",
    email: "amara.d@club.com",
    playStyle: "All-Court",
    preferredSide: "Right",
    membershipTier: "Open Play Pass",
    gamesPlayed: 56,
    winRate: 54,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-7"
  },
  {
    id: "p17",
    name: "Kevin Tran",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    duprRating: 5.15,
    singlesDupr: 5.25,
    phone: "(555) 889-9001",
    email: "kevin.t@club.com",
    playStyle: "Tactical Stacker",
    preferredSide: "Left",
    membershipTier: "Club Champion",
    gamesPlayed: 160,
    winRate: 79,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-10"
  },
  {
    id: "p18",
    name: "Zoe Cooper",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    duprRating: 5.05,
    singlesDupr: 5.1,
    phone: "(555) 990-0112",
    email: "zoe.c@club.com",
    playStyle: "Control & Reset",
    preferredSide: "Right",
    membershipTier: "Club Champion",
    gamesPlayed: 148,
    winRate: 76,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-10"
  },
  {
    id: "p19",
    name: "Liam O'Connor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.25,
    singlesDupr: 3.1,
    phone: "(555) 112-2334",
    email: "liam.oc@club.com",
    playStyle: "All-Court",
    preferredSide: "Left",
    membershipTier: "Open Play Pass",
    gamesPlayed: 42,
    winRate: 50,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-14"
  },
  {
    id: "p20",
    name: "Hannah Lee",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    duprRating: 3.3,
    singlesDupr: 3.15,
    phone: "(555) 223-3445",
    email: "hannah.lee@club.com",
    playStyle: "Kitchen Dinker",
    preferredSide: "Right",
    membershipTier: "Gold Member",
    gamesPlayed: 48,
    winRate: 52,
    isCheckedIn: true,
    status: "on_court",
    currentCourtId: "court-14"
  }
];
var INITIAL_COURTS = [
  {
    id: "court-1",
    name: "Center Court (Stadium)",
    courtNumber: 1,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Championship",
    status: "occupied",
    currentGame: {
      matchId: "match-101",
      teamA: [INITIAL_PLAYERS[0], INITIAL_PLAYERS[1]],
      // Elena (4.85) & Marcus (4.75)
      teamB: [INITIAL_PLAYERS[2], INITIAL_PLAYERS[3]],
      // Tariq (4.60) & Chloe (4.65)
      startTime: Date.now() - 1e3 * 60 * 9,
      durationMinutes: 15,
      scoreA: 9,
      scoreB: 8,
      matchType: "doubles",
      gameFormat: "11 pts (Win by 2)"
    }
  },
  {
    id: "court-2",
    name: "North Lighted Court",
    courtNumber: 2,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Standard",
    status: "occupied",
    currentGame: {
      matchId: "match-102",
      teamA: [INITIAL_PLAYERS[10]],
      // Jackson Reed (4.15)
      teamB: [INITIAL_PLAYERS[11]],
      // Rachel Adams (4.10)
      startTime: Date.now() - 1e3 * 60 * 4,
      durationMinutes: 15,
      scoreA: 5,
      scoreB: 6,
      matchType: "singles",
      gameFormat: "11 pts (Win by 2)"
    }
  },
  {
    id: "court-3",
    name: "The Pavilion (Covered)",
    courtNumber: 3,
    surface: "Covered Turf-Blend",
    isIndoor: true,
    hasLights: true,
    courtType: "Covered Pavilion",
    status: "available"
  },
  {
    id: "court-4",
    name: "South Training Court",
    courtNumber: 4,
    surface: "Competition Hardcourt",
    isIndoor: false,
    hasLights: true,
    courtType: "Training / Ball Machine",
    status: "available"
  },
  {
    id: "court-5",
    name: "Dinkers Alley Court",
    courtNumber: 5,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Standard",
    status: "reserved",
    currentReservation: {
      id: "res-501",
      bookedByName: "Jackson Reed",
      startTime: "18:00",
      endTime: "19:30",
      purpose: "Intermediate Ladder League Practice"
    }
  },
  {
    id: "court-6",
    name: "West Open Play Court",
    courtNumber: 6,
    surface: "Competition Hardcourt",
    isIndoor: false,
    hasLights: false,
    courtType: "Standard",
    status: "available"
  },
  {
    id: "court-7",
    name: "Sunset East Court",
    courtNumber: 7,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Standard",
    status: "occupied",
    currentGame: {
      matchId: "match-107",
      teamA: [
        {
          id: "p13",
          name: "Carlos Mendez",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          duprRating: 4.25,
          playStyle: "Power Banger",
          preferredSide: "Left",
          membershipTier: "Club Champion",
          gamesPlayed: 88,
          winRate: 66,
          isCheckedIn: true,
          status: "on_court"
        },
        {
          id: "p14",
          name: "Nina Johansson",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          duprRating: 4.3,
          playStyle: "Kitchen Dinker",
          preferredSide: "Right",
          membershipTier: "Gold Member",
          gamesPlayed: 92,
          winRate: 67,
          isCheckedIn: true,
          status: "on_court"
        }
      ],
      teamB: [
        {
          id: "p15",
          name: "Samuel Wright",
          avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
          duprRating: 3.8,
          playStyle: "Control & Reset",
          preferredSide: "Either",
          membershipTier: "Gold Member",
          gamesPlayed: 64,
          winRate: 59,
          isCheckedIn: true,
          status: "on_court"
        },
        {
          id: "p16",
          name: "Amara Diallo",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          duprRating: 3.75,
          playStyle: "All-Court",
          preferredSide: "Right",
          membershipTier: "Open Play Pass",
          gamesPlayed: 56,
          winRate: 54,
          isCheckedIn: true,
          status: "on_court"
        }
      ],
      startTime: Date.now() - 1e3 * 60 * 6,
      durationMinutes: 15,
      scoreA: 7,
      scoreB: 5,
      matchType: "doubles",
      gameFormat: "11 pts (Win by 2)"
    }
  },
  {
    id: "court-8",
    name: "Championship Court B",
    courtNumber: 8,
    surface: "Competition Hardcourt",
    isIndoor: false,
    hasLights: true,
    courtType: "Championship",
    status: "available"
  },
  {
    id: "court-9",
    name: "Grandstand Show Court",
    courtNumber: 9,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Championship",
    status: "reserved",
    currentReservation: {
      id: "res-901",
      bookedByName: "Elena Rostova",
      startTime: "19:00",
      endTime: "20:30",
      purpose: "Club Championship Quarterfinals"
    }
  },
  {
    id: "court-10",
    name: "Apex Indoor Arena 1",
    courtNumber: 10,
    surface: "Covered Turf-Blend",
    isIndoor: true,
    hasLights: true,
    courtType: "Standard",
    status: "occupied",
    currentGame: {
      matchId: "match-110",
      teamA: [
        {
          id: "p17",
          name: "Kevin Tran",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          duprRating: 5.15,
          playStyle: "Tactical Stacker",
          preferredSide: "Left",
          membershipTier: "Club Champion",
          gamesPlayed: 160,
          winRate: 79,
          isCheckedIn: true,
          status: "on_court"
        }
      ],
      teamB: [
        {
          id: "p18",
          name: "Zoe Cooper",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          duprRating: 5.05,
          playStyle: "Control & Reset",
          preferredSide: "Right",
          membershipTier: "Club Champion",
          gamesPlayed: 148,
          winRate: 76,
          isCheckedIn: true,
          status: "on_court"
        }
      ],
      startTime: Date.now() - 1e3 * 60 * 11,
      durationMinutes: 15,
      scoreA: 10,
      scoreB: 9,
      matchType: "singles",
      gameFormat: "11 pts (Win by 2)"
    }
  },
  {
    id: "court-11",
    name: "Apex Indoor Arena 2",
    courtNumber: 11,
    surface: "Covered Turf-Blend",
    isIndoor: true,
    hasLights: true,
    courtType: "Standard",
    status: "available"
  },
  {
    id: "court-12",
    name: "High-Altitude South Court",
    courtNumber: 12,
    surface: "Competition Hardcourt",
    isIndoor: false,
    hasLights: true,
    courtType: "Standard",
    status: "available"
  },
  {
    id: "court-13",
    name: "The Kitchen Dwell Court",
    courtNumber: 13,
    surface: "Pro-Cushion Acrylic",
    isIndoor: false,
    hasLights: true,
    courtType: "Training / Ball Machine",
    status: "available"
  },
  {
    id: "court-14",
    name: "Founders Club Court",
    courtNumber: 14,
    surface: "Pro-Cushion Acrylic",
    isIndoor: true,
    hasLights: true,
    courtType: "Championship",
    status: "occupied",
    currentGame: {
      matchId: "match-114",
      teamA: [
        {
          id: "p19",
          name: "Liam O'Connor",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          duprRating: 3.25,
          playStyle: "All-Court",
          preferredSide: "Left",
          membershipTier: "Open Play Pass",
          gamesPlayed: 42,
          winRate: 50,
          isCheckedIn: true,
          status: "on_court"
        },
        {
          id: "p20",
          name: "Hannah Lee",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          duprRating: 3.3,
          playStyle: "Kitchen Dinker",
          preferredSide: "Right",
          membershipTier: "Gold Member",
          gamesPlayed: 48,
          winRate: 52,
          isCheckedIn: true,
          status: "on_court"
        }
      ],
      teamB: [
        INITIAL_PLAYERS[4],
        // Dave Miller (3.40)
        INITIAL_PLAYERS[5]
        // Maya Patel (3.65)
      ],
      startTime: Date.now() - 1e3 * 60 * 3,
      durationMinutes: 15,
      scoreA: 3,
      scoreB: 4,
      matchType: "doubles",
      gameFormat: "11 pts (Win by 2)"
    }
  }
];
var INITIAL_QUEUE = [
  {
    id: "queue-1",
    queueNumber: 1,
    teamName: "The Kitchen Dinkers",
    players: [INITIAL_PLAYERS[4], INITIAL_PLAYERS[5]],
    // Dave (3.40) & Maya (3.65)
    format: "doubles",
    requestedAt: Date.now() - 1e3 * 60 * 12,
    skillTier: "Intermediate (3.0-3.9)",
    rotationRule: "4-in-4-out",
    estWaitMinutes: 4,
    status: "on_deck"
  },
  {
    id: "queue-2",
    queueNumber: 2,
    teamName: "Third Shot Drops",
    players: [INITIAL_PLAYERS[6], INITIAL_PLAYERS[7]],
    // Brandon (3.55) & Sarah (3.50)
    format: "doubles",
    requestedAt: Date.now() - 1e3 * 60 * 7,
    skillTier: "Intermediate (3.0-3.9)",
    rotationRule: "4-in-4-out",
    estWaitMinutes: 11,
    status: "waiting"
  },
  {
    id: "queue-3",
    queueNumber: 3,
    teamName: "Baseline Bashers",
    players: [INITIAL_PLAYERS[8], INITIAL_PLAYERS[9]],
    // Lucas (2.85) & Olivia (2.90)
    format: "doubles",
    requestedAt: Date.now() - 1e3 * 60 * 3,
    skillTier: "Novice (2.0-2.9)",
    rotationRule: "2-in-2-out (Winners Stay)",
    estWaitMinutes: 18,
    status: "waiting"
  }
];
var INITIAL_RESERVATIONS = [
  {
    id: "res-1",
    courtId: "court-1",
    courtName: "Center Court (Stadium)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "09:30",
    bookedBy: INITIAL_PLAYERS[0],
    players: [INITIAL_PLAYERS[0], INITIAL_PLAYERS[1], INITIAL_PLAYERS[2], INITIAL_PLAYERS[3]],
    matchType: "doubles",
    fee: 750,
    status: "completed",
    notes: "Morning Championship Open Play"
  },
  {
    id: "res-2",
    courtId: "court-5",
    courtName: "Dinkers Alley Court",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "19:30",
    bookedBy: INITIAL_PLAYERS[10],
    players: [INITIAL_PLAYERS[10], INITIAL_PLAYERS[11]],
    matchType: "singles",
    fee: 750,
    status: "confirmed",
    notes: "Ladder League Prep"
  },
  {
    id: "res-3",
    courtId: "court-3",
    courtName: "The Pavilion (Covered)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    startTime: "20:00",
    endTime: "21:30",
    bookedBy: INITIAL_PLAYERS[4],
    players: [INITIAL_PLAYERS[4], INITIAL_PLAYERS[5], INITIAL_PLAYERS[6], INITIAL_PLAYERS[7]],
    matchType: "doubles",
    fee: 750,
    status: "confirmed",
    notes: "Night Social Doubles"
  }
];

// server/mongodb.ts
var DEFAULT_DB_NAME = "picklequeue";
var MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || "";
var client = null;
var db = null;
var isConnecting = false;
var lastPingTime = 0;
var connectionError = null;
var InMemoryStore = class {
  constructor() {
    this.courts = JSON.parse(JSON.stringify(INITIAL_COURTS));
    this.players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    this.queue = JSON.parse(JSON.stringify(INITIAL_QUEUE));
    this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
  }
  resetToDefault() {
    this.courts = JSON.parse(JSON.stringify(INITIAL_COURTS));
    this.players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    this.queue = JSON.parse(JSON.stringify(INITIAL_QUEUE));
    this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
  }
};
var localStore = new InMemoryStore();
async function getDatabase() {
  if (!MONGODB_URI) {
    return { db: null, isConnected: false };
  }
  if (db && client) {
    return { db, isConnected: true };
  }
  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (db) return { db, isConnected: true };
  }
  try {
    isConnecting = true;
    connectionError = null;
    client = new import_mongodb.MongoClient(MONGODB_URI, {
      serverApi: {
        version: import_mongodb.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      connectTimeoutMS: 4e3,
      serverSelectionTimeoutMS: 4e3
    });
    const startPing = Date.now();
    await client.connect();
    lastPingTime = Date.now() - startPing;
    db = client.db(DEFAULT_DB_NAME);
    console.log(`[MongoDB] Successfully connected to database: "${db.databaseName}" (ping: ${lastPingTime}ms)`);
    await seedDatabaseIfEmpty(db);
    return { db, isConnected: true };
  } catch (err) {
    console.warn(`[MongoDB] Connection attempt failed: ${err?.message || err}. Falling back to in-memory store.`);
    connectionError = err?.message || String(err);
    client = null;
    db = null;
    return { db: null, isConnected: false };
  } finally {
    isConnecting = false;
  }
}
async function seedDatabaseIfEmpty(targetDb) {
  try {
    const courtsColl = targetDb.collection("courts");
    const courtsCount = await courtsColl.countDocuments();
    if (courtsCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_COURTS.length} courts into MongoDB collection 'courts'...`);
      await courtsColl.insertMany(INITIAL_COURTS);
      await courtsColl.createIndex({ id: 1 }, { unique: true });
      await courtsColl.createIndex({ courtNumber: 1 });
    }
    const playersColl = targetDb.collection("players");
    const playersCount = await playersColl.countDocuments();
    if (playersCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_PLAYERS.length} players into collection 'players'...`);
      await playersColl.insertMany(INITIAL_PLAYERS);
      await playersColl.createIndex({ id: 1 }, { unique: true });
      await playersColl.createIndex({ duprRating: -1 });
    }
    const queueColl = targetDb.collection("paddle_queue");
    const queueCount = await queueColl.countDocuments();
    if (queueCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_QUEUE.length} waitlist racks into 'paddle_queue'...`);
      await queueColl.insertMany(INITIAL_QUEUE);
      await queueColl.createIndex({ id: 1 }, { unique: true });
      await queueColl.createIndex({ queueNumber: 1 });
    }
    const resColl = targetDb.collection("reservations");
    const resCount = await resColl.countDocuments();
    if (resCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_RESERVATIONS.length} reservations into 'reservations'...`);
      await resColl.insertMany(INITIAL_RESERVATIONS);
      await resColl.createIndex({ id: 1 }, { unique: true });
      await resColl.createIndex({ date: 1, courtId: 1 });
    }
  } catch (seedErr) {
    console.error("[MongoDB] Error during collection seeding:", seedErr);
  }
}
async function forceSeedDatabase() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("courts").deleteMany({});
    await activeDb.collection("courts").insertMany(INITIAL_COURTS);
    await activeDb.collection("players").deleteMany({});
    await activeDb.collection("players").insertMany(INITIAL_PLAYERS);
    await activeDb.collection("paddle_queue").deleteMany({});
    await activeDb.collection("paddle_queue").insertMany(INITIAL_QUEUE);
    await activeDb.collection("reservations").deleteMany({});
    await activeDb.collection("reservations").insertMany(INITIAL_RESERVATIONS);
    return { success: true, target: "mongodb" };
  } else {
    localStore.resetToDefault();
    return { success: true, target: "in_memory" };
  }
}
async function getMongoStatus() {
  const isConfigured = Boolean(MONGODB_URI);
  let isConnected = false;
  let counts = {
    courts: localStore.courts.length,
    players: localStore.players.length,
    paddle_queue: localStore.queue.length,
    reservations: localStore.reservations.length
  };
  const { db: activeDb } = await getDatabase();
  if (activeDb) {
    try {
      const courtsCount = await activeDb.collection("courts").countDocuments();
      const playersCount = await activeDb.collection("players").countDocuments();
      const queueCount = await activeDb.collection("paddle_queue").countDocuments();
      const resCount = await activeDb.collection("reservations").countDocuments();
      counts = {
        courts: courtsCount,
        players: playersCount,
        paddle_queue: queueCount,
        reservations: resCount
      };
      isConnected = true;
    } catch {
      isConnected = false;
    }
  }
  let uriMasked;
  if (MONGODB_URI) {
    uriMasked = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  }
  let statusText = "ready_waiting_uri";
  let message = "MongoDB connection layer ready. Provide MONGODB_URI to connect to an external cluster.";
  if (isConnected) {
    statusText = "connected";
    message = `Connected to live MongoDB cluster database '${DEFAULT_DB_NAME}' with ${counts.courts} courts active.`;
  } else if (connectionError) {
    statusText = "connection_error";
    message = `Connection attempt failed: ${connectionError}. In-memory fallback active.`;
  }
  return {
    isConfigured,
    isConnected,
    status: statusText,
    databaseName: DEFAULT_DB_NAME,
    driver: "mongodb v6.x native driver",
    uriMasked,
    pingLatencyMs: isConnected ? lastPingTime : void 0,
    collections: counts,
    lastChecked: (/* @__PURE__ */ new Date()).toISOString(),
    message
  };
}
async function fetchAllCourts() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection("courts").find({}).sort({ courtNumber: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest);
  }
  return localStore.courts;
}
async function upsertCourt(court) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("courts").updateOne(
      { id: court.id },
      { $set: court },
      { upsert: true }
    );
  }
  const idx = localStore.courts.findIndex((c) => c.id === court.id);
  if (idx >= 0) {
    localStore.courts[idx] = court;
  } else {
    localStore.courts.push(court);
  }
  return court;
}
async function fetchAllPlayers() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection("players").find({}).sort({ duprRating: -1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest);
  }
  return localStore.players;
}
async function upsertPlayer(player) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("players").updateOne(
      { id: player.id },
      { $set: player },
      { upsert: true }
    );
  }
  const idx = localStore.players.findIndex((p) => p.id === player.id);
  if (idx >= 0) {
    localStore.players[idx] = player;
  } else {
    localStore.players.unshift(player);
  }
  return player;
}
async function fetchQueue() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection("paddle_queue").find({}).sort({ queueNumber: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest);
  }
  return localStore.queue;
}
async function addQueueItem(item) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("paddle_queue").insertOne(item);
  }
  localStore.queue.push(item);
  return item;
}
async function removeQueueItem(id) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("paddle_queue").deleteOne({ id });
  }
  localStore.queue = localStore.queue.filter((q) => q.id !== id);
  return true;
}
async function reorderQueueItems(newQueue) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("paddle_queue").deleteMany({});
    if (newQueue.length > 0) {
      await activeDb.collection("paddle_queue").insertMany(newQueue);
    }
  }
  localStore.queue = newQueue;
  return newQueue;
}
async function fetchReservations() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection("reservations").find({}).sort({ date: 1, startTime: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest);
  }
  return localStore.reservations;
}
async function addReservation(res) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("reservations").insertOne(res);
  }
  localStore.reservations.unshift(res);
  return res;
}
async function cancelReservation(id) {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection("reservations").updateOne({ id }, { $set: { status: "cancelled" } });
  }
  localStore.reservations = localStore.reservations.map((r) => r.id === id ? { ...r, status: "cancelled" } : r);
  return true;
}

// server.ts
import_dotenv.default.config();
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.get("/api/health", async (req, res) => {
    try {
      const status = await getMongoStatus();
      res.json({
        status: "ok",
        service: "Pickleball Court Management & Queue System",
        courtsAvailable: status.collections.courts,
        mongodb: {
          connected: status.isConnected,
          status: status.status,
          database: status.databaseName
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      res.status(500).json({ status: "error", error: err?.message || err });
    }
  });
  app.get("/api/db/status", async (req, res) => {
    try {
      const status = await getMongoStatus();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.post("/api/db/seed", async (req, res) => {
    try {
      const result = await forceSeedDatabase();
      const status = await getMongoStatus();
      res.json({ success: true, result, status });
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.get("/api/courts", async (req, res) => {
    try {
      const courts = await fetchAllCourts();
      res.json(courts);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.put("/api/courts/:id", async (req, res) => {
    try {
      const court = req.body;
      const updated = await upsertCourt(court);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.get("/api/players", async (req, res) => {
    try {
      const players = await fetchAllPlayers();
      res.json(players);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.post("/api/players", async (req, res) => {
    try {
      const player = req.body;
      const created = await upsertPlayer(player);
      res.json(created);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.get("/api/queue", async (req, res) => {
    try {
      const queue = await fetchQueue();
      res.json(queue);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.post("/api/queue", async (req, res) => {
    try {
      const item = req.body;
      const added = await addQueueItem(item);
      res.json(added);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.delete("/api/queue/:id", async (req, res) => {
    try {
      await removeQueueItem(req.params.id);
      res.json({ success: true, removedId: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.put("/api/queue/reorder", async (req, res) => {
    try {
      const { queue } = req.body;
      const reordered = await reorderQueueItems(queue);
      res.json(reordered);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await fetchReservations();
      res.json(reservations);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservation = req.body;
      const created = await addReservation(reservation);
      res.json(created);
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  app.put("/api/reservations/:id/cancel", async (req, res) => {
    try {
      await cancelReservation(req.params.id);
      res.json({ success: true, cancelledId: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err?.message || err });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PickleQueue Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[PickleQueue Server] Startup error:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
