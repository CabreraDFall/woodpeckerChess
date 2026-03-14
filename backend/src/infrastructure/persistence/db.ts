import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, integer, timestamp, jsonb, primaryKey, uuid } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, { schema });
