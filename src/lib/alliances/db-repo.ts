import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { AllianceLevelType, getNextAllianceLevelObject } from "../alliance-levels.config";
import { db } from "../db";
import { alliancesTable, usersTable } from "../db/schema";

export const upgradeAlliance = async (
  userId: number,
  allianceId: number,
  type: AllianceLevelType,
) => {
  console.log("[upgradeAlliance] Starting alliance upgrade", {
    userId,
    allianceId,
    type,
  });

  const alliance = await db.query.alliancesTable.findFirst({
    where: (alliances) => eq(alliances.id, allianceId),
  });

  console.log("[upgradeAlliance] Alliance data", { alliance });

  if (!alliance) {
    console.log("[upgradeAlliance] Alliance not found", { allianceId });
    throw new TRPCError({ code: "NOT_FOUND", message: "Alliance not found" });
  }

  console.log("[upgradeAlliance] Current alliance levels", { levels: alliance.levels });
  const currentLevel = alliance.levels[type] || 0;
  console.log("[upgradeAlliance] Current level for type", { type, currentLevel });

  const newLevel = getNextAllianceLevelObject(type, currentLevel);
  console.log("[upgradeAlliance] New level object", { newLevel });

  if (!newLevel) {
    console.log("[upgradeAlliance] Alliance is at max level", { type, currentLevel });
    throw new TRPCError({ code: "BAD_REQUEST", message: "Alliance is at max level" });
  }

  const price = newLevel.price;
  console.log("[upgradeAlliance] Upgrade price", { price });

  const user = await db.query.usersTable.findFirst({
    where: (users) => eq(users.id, userId),
  });

  console.log("[upgradeAlliance] User data", { user });

  if (!user) {
    console.log("[upgradeAlliance] User not found", { userId });
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  console.log("[upgradeAlliance] User balance check", {
    userBalance: user.tokenBalance,
    requiredPrice: price,
    sufficient: user.tokenBalance >= price,
  });

  if (user.tokenBalance < price) {
    console.log("[upgradeAlliance] Insufficient balance", {
      userBalance: user.tokenBalance,
      requiredPrice: price,
    });
    throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
  }

  console.log("[upgradeAlliance] Updating user balance", {
    userId,
    oldBalance: user.tokenBalance,
    newBalance: user.tokenBalance - price,
  });

  await db
    .update(usersTable)
    .set({ tokenBalance: user.tokenBalance - price })
    .where(eq(usersTable.id, userId));

  console.log("[upgradeAlliance] Updating alliance level", {
    allianceId,
    type,
    oldLevel: currentLevel,
    newLevel: newLevel.level,
  });

  await db
    .update(alliancesTable)
    .set({ levels: { ...alliance.levels, [type]: newLevel.level } })
    .where(eq(alliancesTable.id, allianceId));

  console.log("[upgradeAlliance] Alliance upgrade completed successfully", {
    allianceId,
    type,
    newLevel: newLevel.level,
    newValue: newLevel.value,
  });

  return newLevel;
};
