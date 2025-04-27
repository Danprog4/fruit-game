import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { FARMS_CONFIG } from "farms.config";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { procedure } from "./init";
export const farmRouter = {
  buyFarm: procedure
    .input(
      z.object({
        farmId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { farmId } = input;
      const farm = FARMS_CONFIG.find((f) => f.id === farmId);
      if (!farm) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Farm not found" });
      }
      const userId = ctx.userId;
      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.tokenBalance < farm.priceInFRU) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough FRU tokens",
        });
      }

      const currentFarms = (user.farms as Record<string, number>) || {};

      const farmCount = currentFarms[farmId] || 0;
      const updatedFarms = {
        ...currentFarms,
        [farmId]: farmCount + 1,
      };

      await db
        .update(usersTable)
        .set({
          farms: updatedFarms,
          tokenBalance: user.tokenBalance - farm.priceInFRU,
        })
        .where(eq(usersTable.id, userId));

      return { success: true, farms: updatedFarms };
    }),
};
