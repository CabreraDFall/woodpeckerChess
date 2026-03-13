import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";
import { IUserRepository } from "../../../domain/repositories/interfaces";
import { User } from "../../../domain/models/entities";

export class DrizzleUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return (result as User) || null;
  }

  async getByUsername(username: string): Promise<User | null> {
    const [result] = await db.select().from(users).where(eq(users.username, username));
    return (result as User) || null;
  }

  async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result as User;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const [result] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result as User;
  }
}
