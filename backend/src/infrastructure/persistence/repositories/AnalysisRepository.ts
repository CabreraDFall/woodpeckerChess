import { eq } from "drizzle-orm";
import { db } from "../db";
import { analysis } from "../schema";
import { IAnalysisRepository } from "../../../domain/repositories/interfaces";
import { Analysis } from "../../../domain/models/entities";

export class DrizzleAnalysisRepository implements IAnalysisRepository {
  async getByGameId(gameId: string): Promise<Analysis[]> {
    const result = await db.select().from(analysis).where(eq(analysis.gameId, gameId));
    return result as unknown as Analysis[];
  }

  async create(data: Omit<Analysis, "id" | "createdAt">): Promise<Analysis> {
    const [result] = await db.insert(analysis).values({
      ...data,
      pv: data.pv, // Drizzle maneja jsonb
    } as any).returning();
    return result as unknown as Analysis;
  }
}
