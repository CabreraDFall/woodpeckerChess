import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { DrizzleUserRepository } from "../infrastructure/persistence/repositories/UserRepository";
import { DrizzleGameRepository } from "../infrastructure/persistence/repositories/GameRepository";
import { DrizzleAnalysisRepository } from "../infrastructure/persistence/repositories/AnalysisRepository";
import { LichessService } from "../infrastructure/external/LichessService";

import { sql } from "drizzle-orm";
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

// Verify Database Connection
async function checkDb() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("[db]: Database connection successful");
  } catch (err: any) {
    console.error("[db]: Database connection failed. Make sure PostgreSQL is running and DATABASE_URL is correct.");
    console.error("[db]: Error:", err.message);
  }
}
checkDb();

// Middleware Mock User (until auth is implemented)
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"; // Deberías crear este usuario primero o hacerlo dinámico

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
        console.error(`[sync]: Error saving game ${ext.id}:`, dbErr.message);
        // Continue with other games or fail? For now, log and keep going
      }
    }

    console.log(`[sync]: Sync completed for ${username}. ${syncedGames.length} games saved.`);
    res.json({ message: `Synced ${syncedGames.length} games`, games: syncedGames });
  } catch (err: any) {
    console.error(`[sync]: Fatal error during sync:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
