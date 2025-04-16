import { bigint, pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  referrerId: bigint("referrer_id", { mode: "number" }),
  tokenBalance: bigint("token_balance", { mode: "number" }).default(0),
});
