import {
  bigint,
  jsonb,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  referrerId: bigint("referrerId", { mode: "number" }),
  tokenBalance: bigint("tokenBalance", { mode: "number" }).default(0).notNull(),
  photoUrl: varchar({ length: 255 }),
  name: varchar("name", { length: 255 }),
  allianceId: bigint("allianceId", { mode: "number" }),
  allianceJoinDate: timestamp("allianceJoinDate", { withTimezone: true }),
  farms: jsonb("farms").default({}).$type<Record<string, number>>().notNull(),
  lastUpdatedBalanceAt: timestamp("lastUpdatedBalance", { withTimezone: true }),
  balances: jsonb("balances").default({}).$type<Record<string, number>>().notNull(),
  starBalance: bigint("starBalance", { mode: "number" }).default(0).notNull(),
  walletAddress: varchar("walletAddress", { length: 255 }),
  dmFarmLevel: bigint("dmFarmLevel", { mode: "number" }).default(1).notNull(),
});

export const alliancesTable = pgTable("alliances", {
  id: serial("id").primaryKey(),
  ownerId: bigint("ownerId", { mode: "number" })
    .references(() => usersTable.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarId: uuid("avatarId"),
  telegramChannelUrl: varchar("telegramChannelUrl", { length: 255 }),
  members: bigint("members", { mode: "number" }).default(1),
  capacity: bigint("capacity", { mode: "number" }).default(10),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const allianceSessionTable = pgTable("allianceSession", {
  id: serial("id").primaryKey(),
  seasonCurr: varchar("seasonCurr", { length: 255 }).notNull(),
  seasonStart: timestamp("seasonStart", { withTimezone: true }).notNull(),
  seasonEnd: timestamp("seasonEnd", { withTimezone: true }).notNull(),
});

export const blockchainPaymentsTable = pgTable("blockchain_payments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 255 })
    .$type<"pending" | "completed" | "failed">()
    .notNull(),
  txType: varchar("tx_type", { length: 255 }).notNull(),
  fruAmount: bigint("fru_amount", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  txId: varchar("tx_id", { length: 255 }),
});

export const withdrawalsTable = pgTable("withdrawals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  status: varchar("status", { length: 255 })
    .$type<
      "waiting_for_approve" | "approved" | "sending_to_wallet" | "completed" | "failed"
    >()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type BlockchainPayment = typeof blockchainPaymentsTable.$inferSelect;
export type NewBlockchainPayment = typeof blockchainPaymentsTable.$inferInsert;

export type Alliance = typeof alliancesTable.$inferSelect;
export type NewAlliance = typeof alliancesTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
