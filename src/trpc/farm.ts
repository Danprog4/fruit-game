import { toNano } from "@ton/core";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/lib/db";
import { blockchainPaymentsTable, NewBlockchainPayment } from "~/lib/db/schema";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { createMemo } from "~/lib/web3/memo";
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

      const txType = farm.txType;
      const priceInFRU = farm.priceInFRU;

      const id = nanoid();

      const newTransaction: NewBlockchainPayment = {
        id,
        userId: ctx.userId,
        status: "pending",
        txType,
        fruAmount: toNano(priceInFRU),
      };

      await db.insert(blockchainPaymentsTable).values(newTransaction);

      const memo = createMemo(txType, id);

      return memo;
    }),
};
