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
  const alliance = await db.query.alliancesTable.findFirst({
    where: (alliances) => eq(alliances.id, allianceId),
  });

  if (!alliance) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Alliance not found" });
  }

  const newLevel = getNextAllianceLevelObject(type, alliance.levels[type] || 0);

  if (!newLevel) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Alliance is at max level" });
  }

  const price = newLevel.price;

  const user = await db.query.usersTable.findFirst({
    where: (users) => eq(users.id, userId),
  });

  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  if (user.tokenBalance < price) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
  }

  await db
    .update(usersTable)
    .set({ tokenBalance: user.tokenBalance - price })
    .where(eq(usersTable.id, userId));

  await db
    .update(alliancesTable)
    .set({ levels: { ...alliance.levels, [type]: newLevel.level } })
    .where(eq(alliancesTable.id, allianceId));

  return newLevel;
};
