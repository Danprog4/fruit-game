import { TRPCRouterRecord } from "@trpc/server";
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
} satisfies TRPCRouterRecord;
