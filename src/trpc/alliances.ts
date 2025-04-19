import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { alliancesTable } from "~/lib/db/schema";
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
} satisfies TRPCRouterRecord;
