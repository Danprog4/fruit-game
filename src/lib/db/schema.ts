import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  levels: jsonb("levels").default({}).$type<Record<string, number>>().notNull(),
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
  avatarId: uuid("avatarId"),
  name: varchar("name", { length: 255 }),
  telegramChannelUrl: varchar("telegramChannelUrl", { length: 255 }),
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

export type TaskDataTelegram = {
  type: "telegram";
  data: {
    chatId: string;
    channelName: string;
  };
};

export type TaskDataLink = {
  type: "link";
};

export type TaskData = TaskDataTelegram | TaskDataLink;

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  imageUrl: varchar("image_url", { length: 300 }),
  reward: integer("reward").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completed: integer("completed").notNull().default(0),
  limit: integer("limit"),
  active: boolean("active").notNull().default(true),
  type: varchar("type", { length: 50 }).notNull().default("join"), // telegram, fake, twitter, external
  data: jsonb("data").$type<TaskData>(),
});

export type Task = typeof tasksTable.$inferSelect;
export type TaskInsert = typeof tasksTable.$inferInsert;

export type FrontendTask = {
  id: number;
  name: string;
  imageUrl: string | null;
  reward: number;
  status: TaskStatus;
  taskData: TaskData;
};

/**
 * If you want user-task statuses, define a join table with a status field.
 */
export const userTasksTable = pgTable(
  "user_tasks",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    taskId: integer("task_id").notNull(),
    status: varchar("task_status", { length: 32 }).notNull().default("checking"),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.userId, table.taskId] }),
        userIdIdx: index("user_task_user_id_idx").on(table.userId),
      },
    ];
  },
);

export type UserTask = typeof userTasksTable.$inferSelect;

export type TaskStatus = "checking" | "completed" | "failed" | "notStarted" | "started";

export type BlockchainPayment = typeof blockchainPaymentsTable.$inferSelect;
export type NewBlockchainPayment = typeof blockchainPaymentsTable.$inferInsert;

export type Alliance = typeof alliancesTable.$inferSelect;
export type NewAlliance = typeof alliancesTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
