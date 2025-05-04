import { toNano } from "@ton/core";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/lib/db";
import {
  blockchainPaymentsTable,
  NewBlockchainPayment,
  usersTable,
} from "~/lib/db/schema";
import { getFarmLevelByLevel } from "~/lib/dm-farm.config";
import { incrementUserFarm } from "~/lib/farm/db-repo";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { changeBlockchainPaymentStatus } from "~/lib/web3/db-repo";
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
  cancelPayment: procedure
    .input(
      z.object({
        paymentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { paymentId } = input;

      // Проверяем, существует ли платеж и принадлежит ли он пользователю
      const payment = await db.query.blockchainPaymentsTable.findFirst({
        where: (payment) => eq(payment.id, paymentId) && eq(payment.userId, ctx.userId),
      });

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Обновляем статус платежа на "failed"
      await changeBlockchainPaymentStatus(paymentId, "failed");

      return { success: true };
    }),
  checkAndUpdatePaymentStatus: procedure
    .input(
      z.object({
        paymentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { paymentId } = input;

      // Проверяем, существует ли платеж и принадлежит ли он пользователю
      const payment = await db.query.blockchainPaymentsTable.findFirst({
        where: (payment) => eq(payment.id, paymentId) && eq(payment.userId, ctx.userId),
      });

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Если платеж все еще в статусе "pending", меняем его на "failed"
      if (payment.status === "pending") {
        await changeBlockchainPaymentStatus(paymentId, "failed");
      }

      return { success: true, status: payment.status };
    }),
  buyDmFarm: procedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const currentLevel = user.dmFarmLevel;
    const nextLevel = currentLevel + 1;

    const farmLevel = getFarmLevelByLevel(nextLevel);

    if (!farmLevel) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Farm level not found" });
    }

    const priceInStars = farmLevel.priceInStars;

    const newBalance = user.starBalance - priceInStars;

    if (newBalance < 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough stars" });
    }

    await db
      .update(usersTable)
      .set({
        starBalance: newBalance,
        dmFarmLevel: nextLevel,
      })
      .where(eq(usersTable.id, userId));

    return {
      success: true,
    };
  }),
  getLastTxs: procedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const txs = await db.query.blockchainPaymentsTable.findMany({
      where: (blockchainPayments) => eq(blockchainPayments.userId, userId),
      orderBy: (blockchainPayments) => desc(blockchainPayments.createdAt),
      limit: 10,
    });
    return txs;
  }),
  buyFarmForFRU: procedure
    .input(
      z.object({
        farmId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const farm = FARMS_CONFIG.find((f) => f.id === input.farmId);

      if (!farm) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Farm not found" });
      }

      if (!farm.enabled) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Farm is not enabled" });
      }

      const priceInFRU = farm.priceInFRU;

      const newBalance = user.tokenBalance - priceInFRU;

      if (newBalance < 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough FRU" });
      }

      await db
        .update(usersTable)
        .set({
          balances: {
            tokenBalance: newBalance,
          },
        })
        .where(eq(usersTable.id, userId));

      await incrementUserFarm(userId, input.farmId);
      return { success: true };
    }),
};
