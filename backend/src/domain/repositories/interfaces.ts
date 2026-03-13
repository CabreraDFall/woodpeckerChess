import { User, Game, Analysis } from "../models/entities";

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  create(user: Omit<User, "id" | "createdAt">): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
}

export interface IGameRepository {
  getById(id: string): Promise<Game | null>;
  listByUserId(userId: string): Promise<Game[]>;
  create(game: Omit<Game, "id" | "createdAt">): Promise<Game>;
}

export interface IAnalysisRepository {
  getByGameId(gameId: string): Promise<Analysis[]>;
  create(analysis: Omit<Analysis, "id" | "createdAt">): Promise<Analysis>;
}
