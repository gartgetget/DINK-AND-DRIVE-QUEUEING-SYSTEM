import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getMongoStatus,
  forceSeedDatabase,
  fetchAllCourts,
  upsertCourt,
  fetchAllPlayers,
  upsertPlayer,
  fetchQueue,
  addQueueItem,
  removeQueueItem,
  reorderQueueItems,
  fetchReservations,
  addReservation,
  cancelReservation,
} from './server/mongodb';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // -------------------------------------------------------------
  // REST API Endpoints
  // -------------------------------------------------------------

  // Health check & MongoDB diagnostic endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const status = await getMongoStatus();
      res.json({
        status: 'ok',
        service: 'Pickleball Court Management & Queue System',
        courtsAvailable: status.collections.courts,
        mongodb: {
          connected: status.isConnected,
          status: status.status,
          database: status.databaseName,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err?.message || err });
    }
  });

  // MongoDB Deep Status & Configuration
  app.get('/api/db/status', async (req, res) => {
    try {
      const status = await getMongoStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // Re-seed or synchronize database
  app.post('/api/db/seed', async (req, res) => {
    try {
      const result = await forceSeedDatabase();
      const status = await getMongoStatus();
      res.json({ success: true, result, status });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // Courts CRUD
  app.get('/api/courts', async (req, res) => {
    try {
      const courts = await fetchAllCourts();
      res.json(courts);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.put('/api/courts/:id', async (req, res) => {
    try {
      const court = req.body;
      const updated = await upsertCourt(court);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // Players / Members CRUD
  app.get('/api/players', async (req, res) => {
    try {
      const players = await fetchAllPlayers();
      res.json(players);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.post('/api/players', async (req, res) => {
    try {
      const player = req.body;
      const created = await upsertPlayer(player);
      res.json(created);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // Paddle Queue CRUD
  app.get('/api/queue', async (req, res) => {
    try {
      const queue = await fetchQueue();
      res.json(queue);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.post('/api/queue', async (req, res) => {
    try {
      const item = req.body;
      const added = await addQueueItem(item);
      res.json(added);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.delete('/api/queue/:id', async (req, res) => {
    try {
      await removeQueueItem(req.params.id);
      res.json({ success: true, removedId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.put('/api/queue/reorder', async (req, res) => {
    try {
      const { queue } = req.body;
      const reordered = await reorderQueueItems(queue);
      res.json(reordered);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // Reservations CRUD
  app.get('/api/reservations', async (req, res) => {
    try {
      const reservations = await fetchReservations();
      res.json(reservations);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    try {
      const reservation = req.body;
      const created = await addReservation(reservation);
      res.json(created);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  app.put('/api/reservations/:id/cancel', async (req, res) => {
    try {
      await cancelReservation(req.params.id);
      res.json({ success: true, cancelledId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || err });
    }
  });

  // -------------------------------------------------------------
  // Vite Middleware / Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PickleQueue Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PickleQueue Server] Startup error:', err);
  process.exit(1);
});
