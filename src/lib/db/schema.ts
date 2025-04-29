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
  farms: jsonb("farms").default({}).notNull(),
  lastUpdatedBalanceAt: timestamp("lastUpdatedBalance", { withTimezone: true }),
  balances: jsonb("balances").default({}).notNull(),
  starBalance: bigint("starBalance", { mode: "number" }).default(0).notNull(),
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
  seasonCurr: varchar("seasonCurr", { length: 255 }).notNull(),
  seasonStart: timestamp("seasonStart", { withTimezone: true }).notNull(),
  seasonEnd: timestamp("seasonEnd", { withTimezone: true }).notNull(),
});

export type Alliance = typeof alliancesTable.$inferSelect;
export type NewAlliance = typeof alliancesTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
