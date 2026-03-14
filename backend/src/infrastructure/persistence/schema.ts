import { pgTable, serial, text, integer, timestamp, jsonb, primaryKey, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  lichessId: text("lichess_id").unique(),
  chessComId: text("chess_com_id").unique(),
  username: text("username").notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id").unique(), // ID de Lichess o Chess.com
  source: text("source"), // 'lichess' | 'chess.com'
  white: text("white"),
  black: text("black"),
  result: text("result"),
  pgn: text("pgn"),
  fen: text("fen"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  gameId: uuid("game_id").references(() => games.id),
  moveNumber: integer("move_number").notNull(),
  fen: text("fen").notNull(),
  eval: text("evaluation"), // e.g. "+0.5", "-1.2", "M5"
  depth: integer("depth"),
  pv: jsonb("principal_variation"), // Array de jugadas
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingCycles = pgTable("training_cycles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"), // 'active', 'completed'
  progress: jsonb("progress").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").references(() => games.id),
  userId: uuid("user_id").references(() => users.id),
  cycleId: uuid("cycle_id").references(() => trainingCycles.id), // <- New Relation
  fen: text("fen").notNull(),
  solution: text("solution").notNull(),
  category: text("category"), // 'blunder', 'tactic', etc.
  difficulty: integer("difficulty"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


