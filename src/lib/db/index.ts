import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

throw new Error(
  "My custom error with DATABASE_URL: " +
    process.env.DATABASE_URL +
    " and dbs urls: " +
    import.meta.env.DATABASE_URL +
    import.meta.env.DB_URL +
    process.env.DB_URL,
);

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
