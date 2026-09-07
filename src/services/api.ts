import { Court, Player, PaddleQueueItem, CourtReservation } from '../types';

export interface MongoStatusResponse {
  isConfigured: boolean;
  isConnected: boolean;
  status: 'connected' | 'ready_waiting_uri' | 'connection_error';
  databaseName: string;
  driver: string;
  uriMasked?: string;
  pingLatencyMs?: number;
  collections: {
    courts: number;
    players: number;
    paddle_queue: number;
    reservations: number;
  };
  lastChecked: string;
  message: string;
}

const API_BASE = '/api';

export async function fetchMongoStatus(): Promise<MongoStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/db/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function seedMongoDatabase(): Promise<{ success: boolean; target?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/db/seed`, { method: 'POST' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetCourts(): Promise<Court[] | null> {
  try {
    const res = await fetch(`${API_BASE}/courts`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSaveCourt(court: Court): Promise<Court | null> {
  try {
    const res = await fetch(`${API_BASE}/courts/${court.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(court),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetPlayers(): Promise<Player[] | null> {
  try {
    const res = await fetch(`${API_BASE}/players`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiCreatePlayer(player: Player): Promise<Player | null> {
  try {
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetQueue(): Promise<PaddleQueueItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/queue`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiAddQueueItem(item: PaddleQueueItem): Promise<PaddleQueueItem | null> {
  try {
    const res = await fetch(`${API_BASE}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRemoveQueueItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/queue/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiReorderQueue(queue: PaddleQueueItem[]): Promise<PaddleQueueItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/queue/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetReservations(): Promise<CourtReservation[] | null> {
  try {
    const res = await fetch(`${API_BASE}/reservations`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiAddReservation(reservation: CourtReservation): Promise<CourtReservation | null> {
  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiCancelReservation(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reservations/${id}/cancel`, {
      method: 'PUT',
    });
    return res.ok;
  } catch {
    return false;
  }
}
