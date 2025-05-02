import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { getFarmLevelByLevel } from "../dm-farm.config";

export const updateDmBalance = async (userId: number) => {
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  if (!user) {
    throw new Error("User not found");
  }

  const dmFarmLevel = user.dmFarmLevel;
  const farmLevel = getFarmLevelByLevel(dmFarmLevel);
  if (!farmLevel) {
    throw new Error("Farm level not found");
  }

  const incomePerHour = farmLevel.incomePerHour;
  const now = new Date();
  const lastUpdatedBalanceAt = user.lastUpdatedBalanceAt;
  const timeElapsed = now.getTime() - (lastUpdatedBalanceAt?.getTime() ?? now.getTime());
  const elapsedSeconds = timeElapsed / 1000;
  const incomePerSecond = incomePerHour / 3600;
  const balance = incomePerSecond * elapsedSeconds;

  await db
    .update(usersTable)
    .set({ starBalance: user.starBalance + balance })
    .where(eq(usersTable.id, userId));
};
