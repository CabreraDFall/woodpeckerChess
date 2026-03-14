import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { DrizzleUserRepository } from "../infrastructure/persistence/repositories/UserRepository";
import { DrizzleGameRepository } from "../infrastructure/persistence/repositories/GameRepository";
import { DrizzleAnalysisRepository } from "../infrastructure/persistence/repositories/AnalysisRepository";
import { LichessService } from "../infrastructure/external/LichessService";

import { sql, eq, desc } from "drizzle-orm";
import { db } from "../infrastructure/persistence/db";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Bootstrap logic (Wiring)
const userRepository = new DrizzleUserRepository();
const gameRepository = new DrizzleGameRepository();
const analysisRepository = new DrizzleAnalysisRepository();
const lichessService = new LichessService();

// Middleware Mock User (until auth is implemented)
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"; // Deberías crear este usuario primero o hacerlo dinámico

// Verify Database Connection & Ensure Mock User Exists
async function checkDb() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("[db]: Database connection successful");
    
    // Asegurar que el usuario temporal existe para no romper Foreign Keys al sincronizar partidas
    await db.execute(sql`
      INSERT INTO users (id, username, created_at)
      VALUES (${MOCK_USER_ID}, 'falllorius', NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("[db]: Mock user ready for syncs.");

    // Fix: Asegurar que la tabla exercises tiene la columna cycle_id si las migraciones fallaron
    try {
      await db.execute(sql`
        ALTER TABLE exercises ADD COLUMN IF NOT EXISTS cycle_id uuid REFERENCES training_cycles(id);
      `);
      console.log("[db]: Column 'cycle_id' verified or added to 'exercises' table.");
    } catch (colErr: any) {
      console.error("[db]: Error updating exercises schema:", colErr.message);
    }
  } catch (err: any) {
    console.error("[db]: Database connection failed. Make sure PostgreSQL is running and DATABASE_URL is correct.");
    console.error("[db]: Error:", err.message);
  }
}
checkDb();

// Sample Route (Testing)
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await userRepository.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Game Routes
app.get("/api/games", async (req, res) => {
  try {
    const games = await gameRepository.listByUserId(MOCK_USER_ID);
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/game/:id", async (req, res) => {
  try {
    const game = await gameRepository.getById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    
    // Adapt for frontend expectations if necessary
    // Frontend expects: { id, players: { white, black }, moves, speed }
    res.json({
      id: game.id,
      players: { white: game.white, black: game.black },
      moves: game.pgn,
      speed: "blitz" // Mocked, should come from game metadata
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analysis Routes
app.get("/api/analysis/:gameId", async (req, res) => {
  try {
    const evaluations = await analysisRepository.getByGameId(req.params.gameId);
    res.json(evaluations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/analysis", async (req, res) => {
  try {
    const { gameId, moveNumber, fen, eval: evaluation, depth, pv } = req.body;
    const result = await analysisRepository.create({
      gameId,
      moveNumber,
      fen,
      eval: evaluation,
      depth,
      pv
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/games/sync", async (req, res) => {
  try {
    const { username } = req.body;
    console.log(`[sync]: Starting sync for user: ${username}`);
    if (!username) return res.status(400).json({ error: "Username is required" });

    // 1. Crear el Training Cycle para esta importación
    const cycleName = `Training Cycle - ${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}`;
    const cycleResult = (await db.insert(require('../infrastructure/persistence/schema').trainingCycles).values({
      userId: MOCK_USER_ID,
      name: cycleName,
      status: 'active'
    }).returning()) as any[];
    
    const cycle = cycleResult[0];
    console.log(`[sync]: Created Training Cycle: ${cycle.id}`);

    const externalGames = await lichessService.getGamesByUsername(username);
    console.log(`[sync]: Fetched ${externalGames.length} games from Lichess`);
    
    const syncedGames = [];

    for (const ext of externalGames) {
      console.log(`[sync]: Processing game ${ext.id}`);
      try {
        const game = await gameRepository.create({
          externalId: ext.id,
          source: 'lichess',
          white: ext.players.white.user?.name || 'Unknown',
          black: ext.players.black.user?.name || 'Unknown',
          result: ext.winner === 'white' ? '1-0' : (ext.winner === 'black' ? '0-1' : '1/2-1/2'),
          pgn: ext.moves,
          fen: 'startpos',
          userId: MOCK_USER_ID
        });
        
        syncedGames.push(game);
      } catch (dbErr: any) {
        if (dbErr.code === '23505') { 
          // Unique constraint violation (El juego ya existía)
          console.log(`[sync]: Game ${ext.id} already exists in database.`);
        } else {
          console.error(`[sync]: Error saving game ${ext.id}:`, dbErr.message);
        }
      }
    }

    console.log(`[sync]: Sync completed for ${username}. ${syncedGames.length} games saved.`);
    res.json({ 
      message: `Synced ${syncedGames.length} games and created new Training Cycle.`, 
      games: syncedGames,
      trainingCycleId: cycle.id
    });
  } catch (err: any) {
    console.error(`[sync]: Fatal error during sync:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Training Cycles & Exercises Routes
app.get("/api/training-cycles", async (req, res) => {
  try {
    const { trainingCycles } = require('../infrastructure/persistence/schema');
    const cycles = await db.select()
      .from(trainingCycles)
      .where(eq(trainingCycles.userId, MOCK_USER_ID))
      .orderBy(desc(trainingCycles.createdAt));
    res.json(cycles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/exercises/:cycleId", async (req, res) => {
  try {
    const { exercises } = require('../infrastructure/persistence/schema');
    const paramsCycle = req.params.cycleId;
    const exList = await db.select()
      .from(exercises)
      .where(eq(exercises.cycleId, paramsCycle));
    res.json(exList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/exercises", async (req, res) => {
  try {
    const { exercises } = require('../infrastructure/persistence/schema');
    const { gameId, cycleId, fen, solution, category, difficulty } = req.body;
    
    if (!gameId || !cycleId || !fen || !solution) {
      return res.status(400).json({ error: "Faltan parámetros requeridos: gameId, cycleId, fen o solution" });
    }

    const exerciseResult = (await db.insert(exercises).values({
      gameId,
      userId: MOCK_USER_ID,
      cycleId: cycleId,
      fen,
      solution,
      category: category || "blunder",
      difficulty: difficulty || 1200
    }).returning()) as any[];

    const exercise = exerciseResult[0];
    
    res.json(exercise);
  } catch (err: any) {
    console.error("[api]: Error creando ejercicio", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
