import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { allianceSessionTable, alliancesTable, usersTable } from "~/lib/db/schema";
import { uploadBase64Image } from "~/lib/s3/upload";
import { procedure } from "./init";

export const alliancesRouter = {
  createAlliance: procedure
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

      const alliance = await db.insert(alliancesTable).values({
        name,
        telegramChannelUrl,
        avatarId: imageUUID,
        ownerId: ctx.userId,
      });

      return alliance;
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
  addCapacity: procedure
    .input(
      z.object({
        allianceId: z.string(),
        capacity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { allianceId, capacity } = input;

      const alliance = await db
        .update(alliancesTable)
        .set({ capacity: capacity })
        .where(eq(alliancesTable.id, Number(allianceId)));

      return alliance;
    }),
  removeCapacity: procedure
    .input(
      z.object({
        allianceId: z.string(),
        capacity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { allianceId, capacity } = input;

      const alliance = await db
        .update(alliancesTable)
        .set({ capacity: capacity })
        .where(eq(alliancesTable.id, Number(allianceId)));

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
    const season = await db.query.allianceSessionTable.findFirst();

    if (!season) {
      const defaultSeason = {
        seasonCurr: "strawberry",
        seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      await db.insert(allianceSessionTable).values(defaultSeason);

      return {
        season: defaultSeason,
        isDefault: true,
      };
    }

    return {
      season,
      isDefault: false,
      currentTime: new Date(),
      timeRemaining: season.seasonEnd.getTime() - Date.now(),
    };
  }),
} satisfies TRPCRouterRecord;
