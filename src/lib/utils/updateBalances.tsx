import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { getFarmLevelByLevel } from "../dm-farm.config";
import { FARMS_CONFIG } from "../farms.config";

/**
 * Updates all farms' balances for the given user based on the time elapsed
 * since the user's last update, using mining rates from farms.config (GRUSH per hour).
 * Also updates the DM farm balance based on the user's DM farm level.
 * @param userId - the ID of the user whose farms should be updated
 */
export async function updateBalances(userId: string | number): Promise<void> {
  // Ensure userId is a number
  const id = typeof userId === "string" ? Number(userId) : userId;

  // Fetch the user record
  const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
  const user = users[0];
  if (!user) {
    throw new Error(`User not found: ${id}`);
  }

  // Determine last update timestamp in ms
  const nowMs = Date.now();
  // Cast lastUpdatedBalanceAt to Date or null for safe getTime
  const lastDate = user.lastUpdatedBalanceAt as unknown as Date | null;
  const lastUpdatedMs = lastDate?.getTime() ?? nowMs;
  const elapsedSeconds = (nowMs - lastUpdatedMs) / 1000;

  // Parse user's farms and balances JSON fields
  const farms: Record<string, number> = user.farms as unknown as Record<string, number>;
  const balances: Record<string, number> = user.balances as unknown as Record<
    string,
    number
  >;

  // Compute updated balances
  const updatedBalances: Record<string, number> = { ...balances };
  for (const farmId in farms) {
    const count = farms[farmId];
    const farmConfig = FARMS_CONFIG.find((f) => f.id === farmId);
    if (!farmConfig) continue;

    const ratePerSecond = farmConfig.miningRate / 3600;
    const amountMined = count * elapsedSeconds * ratePerSecond;
    const prev = balances[farmId] ?? 0;
    updatedBalances[farmId] = prev + amountMined;
  }

  // Calculate DM farm income
  const dmFarmLevel = user.dmFarmLevel;
  const farmLevel = getFarmLevelByLevel(dmFarmLevel);
  let starBalance = user.starBalance;

  if (farmLevel) {
    const incomePerHour = farmLevel.incomePerHour;
    const incomePerSecond = incomePerHour / 3600;
    const dmIncome = Math.floor(incomePerSecond * elapsedSeconds);
    starBalance += dmIncome;
  }

  // Update user record with new balances and timestamp
  await db
    .update(usersTable)
    .set({
      balances: updatedBalances,
      starBalance: Math.floor(starBalance),
      lastUpdatedBalanceAt: new Date(nowMs),
    })
    .where(eq(usersTable.id, id));
}
