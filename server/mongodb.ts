import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';
import { Court, Player, PaddleQueueItem, CourtReservation } from '../src/types';
import { INITIAL_COURTS, INITIAL_PLAYERS, INITIAL_QUEUE, INITIAL_RESERVATIONS } from '../src/data/mockData';

// Configuration
const DEFAULT_DB_NAME = 'picklequeue';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || '';

export interface MongoStatusInfo {
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

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let lastPingTime = 0;
let connectionError: string | null = null;

// In-Memory fallback store mirroring the MongoDB collections
// This guarantees zero crashes and full app responsiveness even before the user sets their MONGODB_URI
class InMemoryStore {
  courts: Court[] = JSON.parse(JSON.stringify(INITIAL_COURTS));
  players: Player[] = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
  queue: PaddleQueueItem[] = JSON.parse(JSON.stringify(INITIAL_QUEUE));
  reservations: CourtReservation[] = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));

  resetToDefault() {
    this.courts = JSON.parse(JSON.stringify(INITIAL_COURTS));
    this.players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    this.queue = JSON.parse(JSON.stringify(INITIAL_QUEUE));
    this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
  }
}

const localStore = new InMemoryStore();

/**
 * Initializes and retrieves MongoDB database connection.
 * Resilient: Never throws or halts the dev server if URI is unset or unreachable.
 */
export async function getDatabase(): Promise<{ db: Db | null; isConnected: boolean }> {
  if (!MONGODB_URI) {
    return { db: null, isConnected: false };
  }

  if (db && client) {
    return { db, isConnected: true };
  }

  if (isConnecting) {
    // Wait briefly if connection is already in progress
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (db) return { db, isConnected: true };
  }

  try {
    isConnecting = true;
    connectionError = null;

    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });

    const startPing = Date.now();
    await client.connect();
    lastPingTime = Date.now() - startPing;

    // Use default db from URI or fallback to DEFAULT_DB_NAME
    db = client.db(DEFAULT_DB_NAME);
    console.log(`[MongoDB] Successfully connected to database: "${db.databaseName}" (ping: ${lastPingTime}ms)`);

    // Auto-seed collections if empty
    await seedDatabaseIfEmpty(db);

    return { db, isConnected: true };
  } catch (err: any) {
    console.warn(`[MongoDB] Connection attempt failed: ${err?.message || err}. Falling back to in-memory store.`);
    connectionError = err?.message || String(err);
    client = null;
    db = null;
    return { db: null, isConnected: false };
  } finally {
    isConnecting = false;
  }
}

/**
 * Auto-seeds initial 14 courts, players, queue items, and reservations
 * if the MongoDB collections are unpopulated.
 */
export async function seedDatabaseIfEmpty(targetDb: Db) {
  try {
    const courtsColl = targetDb.collection('courts');
    const courtsCount = await courtsColl.countDocuments();

    if (courtsCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_COURTS.length} courts into MongoDB collection 'courts'...`);
      await courtsColl.insertMany(INITIAL_COURTS as any[]);
      await courtsColl.createIndex({ id: 1 }, { unique: true });
      await courtsColl.createIndex({ courtNumber: 1 });
    }

    const playersColl = targetDb.collection('players');
    const playersCount = await playersColl.countDocuments();
    if (playersCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_PLAYERS.length} players into collection 'players'...`);
      await playersColl.insertMany(INITIAL_PLAYERS as any[]);
      await playersColl.createIndex({ id: 1 }, { unique: true });
      await playersColl.createIndex({ duprRating: -1 });
    }

    const queueColl = targetDb.collection('paddle_queue');
    const queueCount = await queueColl.countDocuments();
    if (queueCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_QUEUE.length} waitlist racks into 'paddle_queue'...`);
      await queueColl.insertMany(INITIAL_QUEUE as any[]);
      await queueColl.createIndex({ id: 1 }, { unique: true });
      await queueColl.createIndex({ queueNumber: 1 });
    }

    const resColl = targetDb.collection('reservations');
    const resCount = await resColl.countDocuments();
    if (resCount === 0) {
      console.log(`[MongoDB] Seeding initial ${INITIAL_RESERVATIONS.length} reservations into 'reservations'...`);
      await resColl.insertMany(INITIAL_RESERVATIONS as any[]);
      await resColl.createIndex({ id: 1 }, { unique: true });
      await resColl.createIndex({ date: 1, courtId: 1 });
    }
  } catch (seedErr: any) {
    console.error('[MongoDB] Error during collection seeding:', seedErr);
  }
}

/**
 * Force re-seed or synchronize in-memory state into MongoDB
 */
export async function forceSeedDatabase() {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('courts').deleteMany({});
    await activeDb.collection('courts').insertMany(INITIAL_COURTS as any[]);

    await activeDb.collection('players').deleteMany({});
    await activeDb.collection('players').insertMany(INITIAL_PLAYERS as any[]);

    await activeDb.collection('paddle_queue').deleteMany({});
    await activeDb.collection('paddle_queue').insertMany(INITIAL_QUEUE as any[]);

    await activeDb.collection('reservations').deleteMany({});
    await activeDb.collection('reservations').insertMany(INITIAL_RESERVATIONS as any[]);

    return { success: true, target: 'mongodb' };
  } else {
    localStore.resetToDefault();
    return { success: true, target: 'in_memory' };
  }
}

/**
 * Returns structured status of the MongoDB integration
 */
export async function getMongoStatus(): Promise<MongoStatusInfo> {
  const isConfigured = Boolean(MONGODB_URI);
  let isConnected = false;
  let counts = {
    courts: localStore.courts.length,
    players: localStore.players.length,
    paddle_queue: localStore.queue.length,
    reservations: localStore.reservations.length,
  };

  const { db: activeDb } = await getDatabase();
  if (activeDb) {
    try {
      const courtsCount = await activeDb.collection('courts').countDocuments();
      const playersCount = await activeDb.collection('players').countDocuments();
      const queueCount = await activeDb.collection('paddle_queue').countDocuments();
      const resCount = await activeDb.collection('reservations').countDocuments();

      counts = {
        courts: courtsCount,
        players: playersCount,
        paddle_queue: queueCount,
        reservations: resCount,
      };
      isConnected = true;
    } catch {
      isConnected = false;
    }
  }

  // Mask URI for display security
  let uriMasked: string | undefined;
  if (MONGODB_URI) {
    uriMasked = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }

  let statusText: 'connected' | 'ready_waiting_uri' | 'connection_error' = 'ready_waiting_uri';
  let message = 'MongoDB connection layer ready. Provide MONGODB_URI to connect to an external cluster.';

  if (isConnected) {
    statusText = 'connected';
    message = `Connected to live MongoDB cluster database '${DEFAULT_DB_NAME}' with ${counts.courts} courts active.`;
  } else if (connectionError) {
    statusText = 'connection_error';
    message = `Connection attempt failed: ${connectionError}. In-memory fallback active.`;
  }

  return {
    isConfigured,
    isConnected,
    status: statusText,
    databaseName: DEFAULT_DB_NAME,
    driver: 'mongodb v6.x native driver',
    uriMasked,
    pingLatencyMs: isConnected ? lastPingTime : undefined,
    collections: counts,
    lastChecked: new Date().toISOString(),
    message,
  };
}

// -------------------------------------------------------------
// CRUD Operations with transparent MongoDB / In-Memory sync
// -------------------------------------------------------------

export async function fetchAllCourts(): Promise<Court[]> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection('courts').find({}).sort({ courtNumber: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest as unknown as Court);
  }
  return localStore.courts;
}

export async function upsertCourt(court: Court): Promise<Court> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('courts').updateOne(
      { id: court.id },
      { $set: court },
      { upsert: true }
    );
  }

  // Also update local memory mirror
  const idx = localStore.courts.findIndex(c => c.id === court.id);
  if (idx >= 0) {
    localStore.courts[idx] = court;
  } else {
    localStore.courts.push(court);
  }
  return court;
}

export async function fetchAllPlayers(): Promise<Player[]> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection('players').find({}).sort({ duprRating: -1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest as unknown as Player);
  }
  return localStore.players;
}

export async function upsertPlayer(player: Player): Promise<Player> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('players').updateOne(
      { id: player.id },
      { $set: player },
      { upsert: true }
    );
  }

  const idx = localStore.players.findIndex(p => p.id === player.id);
  if (idx >= 0) {
    localStore.players[idx] = player;
  } else {
    localStore.players.unshift(player);
  }
  return player;
}

export async function fetchQueue(): Promise<PaddleQueueItem[]> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection('paddle_queue').find({}).sort({ queueNumber: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest as unknown as PaddleQueueItem);
  }
  return localStore.queue;
}

export async function addQueueItem(item: PaddleQueueItem): Promise<PaddleQueueItem> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('paddle_queue').insertOne(item as any);
  }
  localStore.queue.push(item);
  return item;
}

export async function removeQueueItem(id: string): Promise<boolean> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('paddle_queue').deleteOne({ id });
  }
  localStore.queue = localStore.queue.filter(q => q.id !== id);
  return true;
}

export async function reorderQueueItems(newQueue: PaddleQueueItem[]): Promise<PaddleQueueItem[]> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('paddle_queue').deleteMany({});
    if (newQueue.length > 0) {
      await activeDb.collection('paddle_queue').insertMany(newQueue as any[]);
    }
  }
  localStore.queue = newQueue;
  return newQueue;
}

export async function fetchReservations(): Promise<CourtReservation[]> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    const raw = await activeDb.collection('reservations').find({}).sort({ date: 1, startTime: 1 }).toArray();
    return raw.map(({ _id, ...rest }) => rest as unknown as CourtReservation);
  }
  return localStore.reservations;
}

export async function addReservation(res: CourtReservation): Promise<CourtReservation> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('reservations').insertOne(res as any);
  }
  localStore.reservations.unshift(res);
  return res;
}

export async function cancelReservation(id: string): Promise<boolean> {
  const { db: activeDb, isConnected } = await getDatabase();
  if (isConnected && activeDb) {
    await activeDb.collection('reservations').updateOne({ id }, { $set: { status: 'cancelled' } });
  }
  localStore.reservations = localStore.reservations.map(r => r.id === id ? { ...r, status: 'cancelled' } : r);
  return true;
}
