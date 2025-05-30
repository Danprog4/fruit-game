import { toNano } from "@ton/core";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getNextAllianceLevelObject } from "~/lib/alliance-levels.config";
import {
  payForAllianceUpgradeWithBalance,
  upgradeAlliance,
} from "~/lib/alliances/db-repo";
import { db } from "~/lib/db";
import {
  alliancesTable,
  blockchainPaymentsTable,
  NewBlockchainPayment,
  usersTable,
} from "~/lib/db/schema";
import { uploadBase64Image } from "~/lib/s3/upload";
import { ALLIANCE_TX_TYPE_MAPPING_REVERSE } from "~/lib/tx-type.config";
import { createMemo } from "~/lib/web3/memo";
import { procedure } from "./init";

export const alliancesRouter = {
  createAllianceForFRU: procedure
    .input(
      z.object({
        imageBase64: z.string(),
        name: z.string(),
        telegramChannelUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, telegramChannelUrl, imageBase64 } = input;

      const imageUUID = await uploadBase64Image(imageBase64);

      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, ctx.userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.tokenBalance < 40000) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough FRU" });
      }

      await db
        .update(usersTable)
        .set({
          tokenBalance: user.tokenBalance - 40000,
        })
        .where(eq(usersTable.id, ctx.userId));

      const [alliance] = await db
        .insert(alliancesTable)
        .values({
          name,
          telegramChannelUrl,
          avatarId: imageUUID,
          ownerId: ctx.userId,
          levels: {
            capacity: 0,
            coefficient: 0,
            profitability: 0,
          },
        })
        .returning();
      await db
        .update(usersTable)
        .set({
          allianceId: alliance.id,
        })
        .where(eq(usersTable.id, ctx.userId));

      return alliance;
    }),

  createAllianceForTON: procedure
    .input(
      z.object({
        imageBase64: z.string(),
        name: z.string(),
        telegramChannelUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, telegramChannelUrl, imageBase64 } = input;

      const imageUUID = await uploadBase64Image(imageBase64);

      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, ctx.userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const id = nanoid();

      const newTransaction: NewBlockchainPayment = {
        id,
        userId: ctx.userId,
        status: "pending",
        txType: "alliance",
        fruAmount: toNano(40000),
        avatarId: imageUUID,
        name,
        telegramChannelUrl,
      };

      await db.insert(blockchainPaymentsTable).values(newTransaction);

      const memo = createMemo("alliance", id);

      return memo;
    }),

  getAlliances: procedure.query(async ({ ctx }) => {
    const alliances = await db.query.alliancesTable.findMany();

    return alliances;
  }),
  updateAlliance: procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        telegramChannelUrl: z.string().optional(),
        imageBase64: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, telegramChannelUrl, imageBase64 } = input;

      const updateData: Record<string, any> = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (telegramChannelUrl !== undefined) {
        updateData.telegramChannelUrl = telegramChannelUrl;
      }

      if (imageBase64 !== undefined) {
        const imageUUID = await uploadBase64Image(imageBase64);
        updateData.avatarId = imageUUID;
      }

      const alliance = await db
        .update(alliancesTable)
        .set(updateData)
        .where(eq(alliancesTable.id, Number(id)));

      return alliance;
    }),

  joinAlliance: procedure
    .input(
      z.object({
        allianceId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const allianceId = input.allianceId;
      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const alliance = await db.query.alliancesTable.findFirst({
        where: (alliances) => eq(alliances.id, Number(allianceId)),
      });
      if (!alliance) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alliance not found" });
      }

      if (alliance.members === alliance.levels.capacity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alliance is fully" });
      }

      if (user.allianceId !== null && user.allianceId !== allianceId) {
        const previousAlliance = await db.query.alliancesTable.findFirst({
          where: (alliances) => eq(alliances.id, user.allianceId || 0),
        });

        if (previousAlliance) {
          await db
            .update(alliancesTable)
            .set({ members: Math.max(0, (previousAlliance.members || 1) - 1) })
            .where(eq(alliancesTable.id, user.allianceId));
        }
      }

      await db
        .update(usersTable)
        .set({ allianceId: Number(allianceId), allianceJoinDate: new Date() })
        .where(eq(usersTable.id, userId));

      if (user.allianceId !== allianceId) {
        await db
          .update(alliancesTable)
          .set({ members: (alliance.members || 0) + 1 })
          .where(eq(alliancesTable.id, Number(allianceId)));
      }
    }),
  kickFromAlliance: procedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId: targetUserId } = input;
      await db
        .update(usersTable)
        .set({ allianceId: null })
        .where(eq(usersTable.id, targetUserId));
    }),
  getSeason: procedure.query(async () => {
    try {
      // Check if the table exists and has data
      const season = await db.query.allianceSessionTable.findFirst();
      console.log(season, "first season");

      // if (!season) {
      //   // Create a new season if none exists
      //   const newSeason = {
      //     seasonCurr: "strawberry",
      //     seasonStart: new Date(),
      //     seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      //   };

      //   // Insert the new season into the database
      //   await db.insert(allianceSessionTable).values(newSeason);

      //   return newSeason;
      // }

      return season;
    } catch (error) {
      console.error("Error with alliance season:", error);
      // Return a default season object if there's an error
      return {
        seasonCurr: "strawberry",
        seasonStart: new Date(),
        seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };
    }
  }),
  deleteAlliance: procedure
    .input(z.object({ allianceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { allianceId } = input;
      if (!allianceId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Alliance ID is required" });
      }
      await db
        .update(usersTable)
        .set({ allianceId: null })
        .where(eq(usersTable.allianceId, allianceId));

      await db.delete(alliancesTable).where(eq(alliancesTable.id, allianceId));
    }),
  upgradeAlliance: procedure
    .input(
      z.object({
        allianceId: z.number(),
        type: z.enum(["capacity", "coefficient", "profitability"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await payForAllianceUpgradeWithBalance(ctx.userId, input.allianceId, input.type);
      return upgradeAlliance(input.allianceId, input.type);
    }),

  createUpgradeAlliancePayment: procedure
    .input(
      z.object({
        allianceId: z.number(),
        type: z.enum(["capacity", "coefficient", "profitability"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { allianceId, type } = input;

      // Get the appropriate transaction type for this alliance upgrade
      const txType = ALLIANCE_TX_TYPE_MAPPING_REVERSE[type];

      // Get the next level object to determine price
      const alliance = await db.query.alliancesTable.findFirst({
        where: (alliances) => eq(alliances.id, allianceId),
      });

      if (!alliance) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alliance not found" });
      }

      const nextLevel = getNextAllianceLevelObject(type, alliance.levels[type] || 0);

      if (!nextLevel) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Alliance is at max level" });
      }

      const id = nanoid();

      const newTransaction: NewBlockchainPayment = {
        id,
        userId: ctx.userId,
        status: "pending",
        txType,
        fruAmount: toNano(nextLevel.price.toString()),
      };

      await db.insert(blockchainPaymentsTable).values(newTransaction);

      const memo = createMemo(txType, id);

      return memo;
    }),
} satisfies TRPCRouterRecord;
