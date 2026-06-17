import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DATABASE_URL } from "@/config/env";
import * as schema from "./schema";

const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  const client = await pool.connect();
  client.release();
  console.log("Connected to PostgreSQL");
};
