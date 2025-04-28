import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { FARMS_CONFIG } from "farms.config";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import calculateExchangeAmount from "~/lib/utils/converter/calculateExchangeAmount";
import { updateBalances } from "~/lib/utils/updateBalances";
import { procedure, publicProcedure } from "./init";
export const router = {
  getHello: publicProcedure.query(() => {
    return {
      hello: "world",
    };
  }),
  getBrother: procedure.query(({ ctx }) => {
    return {
      brother: `macan ${ctx.userId}`,
    };
  }),
  getFriends: procedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const friends = await db.query.usersTable.findMany({
      where: (users) => eq(users.referrerId, userId),
    });

    return friends;
  }),
  getUser: procedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
    });
    return user;
  }),

  getUsers: procedure.query(async ({ ctx }) => {
    const users = await db.query.usersTable.findMany();
    return users;
  }),
  invalidateBalances: procedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    await updateBalances(userId);
    return user.balances;
  }),
  exchange: procedure
    .input(
      z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string(),
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

      const { fromToken, toToken, amount } = input;

      // Calculate exchange amount
      const exchangeAmount = calculateExchangeAmount(amount, fromToken, toToken);

      // Get current balances
      const balances = { ...(user.balances as Record<string, number>) };

      // Find farm IDs for the tokens
      const fromFarmId = FARMS_CONFIG.find((farm) => farm.tokenName === fromToken)?.id;
      const toFarmId = FARMS_CONFIG.find((farm) => farm.tokenName === toToken)?.id;

      // Check if user has enough balance
      if (fromToken === "FRU") {
        // For FRU, check tokenBalance
        if (Number(user.tokenBalance) < parseFloat(amount)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient FRU balance",
          });
        }
      } else {
        // For other tokens, check balances using farm ID
        if (
          !fromFarmId ||
          !balances[fromFarmId] ||
          balances[fromFarmId] < parseFloat(amount)
        ) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
      }

      // Update balances
      if (fromToken === "FRU") {
        // For FRU, update tokenBalance
        const newTokenBalance = Number(user.tokenBalance) - parseFloat(amount);
        if (toFarmId) {
          balances[toFarmId] = (balances[toFarmId] || 0) + parseFloat(exchangeAmount);
        }
        await db
          .update(usersTable)
          .set({
            tokenBalance: Math.floor(newTokenBalance),
            balances,
          })
          .where(eq(usersTable.id, userId));
      } else if (toToken === "FRU") {
        // When converting to FRU
        balances[fromFarmId!] -= parseFloat(amount);
        const newTokenBalance = Number(user.tokenBalance) + parseFloat(exchangeAmount);
        await db
          .update(usersTable)
          .set({
            tokenBalance: Math.floor(newTokenBalance),
            balances,
          })
          .where(eq(usersTable.id, userId));
      } else {
        // For other token exchanges
        balances[fromFarmId!] -= parseFloat(amount);
        balances[toFarmId!] = (balances[toFarmId!] || 0) + parseFloat(exchangeAmount);
        await db
          .update(usersTable)
          .set({
            balances,
          })
          .where(eq(usersTable.id, userId));
      }

      return {
        success: true,
        fromBalance:
          fromToken === "FRU"
            ? Number(user.tokenBalance) - parseFloat(amount)
            : balances[fromFarmId!],
        toBalance:
          toToken === "FRU"
            ? Number(user.tokenBalance) + parseFloat(exchangeAmount)
            : balances[toFarmId!],
        exchangeAmount,
        tokenBalance:
          toToken === "FRU"
            ? Number(user.tokenBalance) + parseFloat(exchangeAmount)
            : Number(user.tokenBalance),
      };
    }),
} satisfies TRPCRouterRecord;

export type Router = typeof router;
