import { eq } from "drizzle-orm";
import { db } from "../db";
import { games } from "../schema";
import { IGameRepository } from "../../../domain/repositories/interfaces";
import { Game } from "../../../domain/models/entities";

export class DrizzleGameRepository implements IGameRepository {
  async getById(id: string): Promise<Game | null> {
    const [result] = await db.select().from(games).where(eq(games.id, id));
    return (result as Game) || null;
  }

  async listByUserId(userId: string): Promise<Game[]> {
    const result = await db.select().from(games).where(eq(games.userId, userId));
    return result as Game[];
  }

  async create(game: Omit<Game, "id" | "createdAt">): Promise<Game> {
    const [result] = await db.insert(games).values(game).returning();
    return result as Game;
  }
}
