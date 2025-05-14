import { Address, toNano } from "@ton/core";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { Bot } from "grammy";
import { nanoid } from "nanoid";
import { z } from "zod";
import { WITHDRAW_CHAT_ID, WITHDRAWAL_FEE } from "~/lib/constants";
import { db } from "~/lib/db";
import { adminBotTable, usersTable, withdrawalsTable } from "~/lib/db/schema";
import { FARMS_CONFIG } from "~/lib/farms.config";
import calculateExchangeAmount from "~/lib/utils/converter/calculateExchangeAmount";
import { updateBalances } from "~/lib/utils/updateBalances";
import { procedure, publicProcedure } from "./init";

export const router = {
  getHello: publicProcedure.query(() => {
    return {
      hello: "world",
    };
  }),
  getText: procedure.query(async () => {
    const text = await db.query.adminBotTable.findMany();
    return text;
  }),
  setText: procedure
    .input(
      z.object({
        text: z.string().array(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(adminBotTable).values({ text: input.text });
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

  connectWallet: procedure
    .input(
      z.object({
        walletAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(usersTable)
        .set({
          walletAddress: Address.parse(input.walletAddress).toString({
            bounceable: false,
          }),
        })
        .where(eq(usersTable.id, ctx.userId));
    }),

  disconnectWallet: procedure.mutation(async ({ ctx }) => {
    await db
      .update(usersTable)
      .set({
        walletAddress: null,
      })
      .where(eq(usersTable.id, ctx.userId));
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
      const amountNum = parseFloat(amount);
      // Calculate exchange amount
      const exchangeAmount = calculateExchangeAmount(amount, fromToken, toToken);
      const exchangeAmountNum = parseFloat(exchangeAmount);

      // Get current balances
      const balances = { ...(user.balances as Record<string, number>) };

      // Find farm IDs for the tokens
      const fromFarmId = FARMS_CONFIG.find((farm) => farm.tokenName === fromToken)?.id;
      const toFarmId = FARMS_CONFIG.find((farm) => farm.tokenName === toToken)?.id;

      // Helper function to compare numbers with precision
      const compareWithPrecision = (a: number, b: number, precision = 3) => {
        const roundedA =
          Math.round(a * Math.pow(10, precision)) / Math.pow(10, precision);
        const roundedB =
          Math.round(b * Math.pow(10, precision)) / Math.pow(10, precision);
        const result = roundedA >= roundedB;

        console.log("Precision comparison:", {
          originalA: a,
          originalB: b,
          roundedA,
          roundedB,
          result,
        });

        return result;
      };

      // Check if user has enough balance
      if (fromToken === "FRU") {
        // For FRU, check tokenBalance
        const tokenBalanceNum = Number(user.tokenBalance);
        console.log("FRU Balance Check:", {
          tokenBalance: tokenBalanceNum,
          amount: amountNum,
          difference: tokenBalanceNum - amountNum,
          isEqual: compareWithPrecision(tokenBalanceNum, amountNum),
        });

        if (!compareWithPrecision(tokenBalanceNum, amountNum)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient FRU balance. You have ${tokenBalanceNum} but need ${amountNum}`,
          });
        }
      } else {
        // For other tokens, check balances using farm ID
        const currentBalance = balances[fromFarmId!] || 0;
        console.log("Token Balance Check:", {
          token: fromToken,
          currentBalance,
          amount: amountNum,
          difference: currentBalance - amountNum,
          isEqual: compareWithPrecision(currentBalance, amountNum),
        });

        if (!fromFarmId || !compareWithPrecision(currentBalance, amountNum)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient ${fromToken} balance. You have ${currentBalance} but need ${amountNum}`,
          });
        }
      }

      // Update balances
      if (fromToken === "FRU") {
        // For FRU, update tokenBalance
        const newTokenBalance = Number(user.tokenBalance) - amountNum;
        if (toFarmId) {
          balances[toFarmId] = (balances[toFarmId] || 0) + exchangeAmountNum;
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
        balances[fromFarmId!] -= amountNum;
        const newTokenBalance = Number(user.tokenBalance) + exchangeAmountNum;
        await db
          .update(usersTable)
          .set({
            tokenBalance: Math.floor(newTokenBalance),
            balances,
          })
          .where(eq(usersTable.id, userId));
      } else {
        // For other token exchanges
        balances[fromFarmId!] -= amountNum;
        balances[toFarmId!] = (balances[toFarmId!] || 0) + exchangeAmountNum;
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
            ? Number(user.tokenBalance) - amountNum
            : balances[fromFarmId!],
        toBalance:
          toToken === "FRU"
            ? Number(user.tokenBalance) + exchangeAmountNum
            : balances[toFarmId!],
        exchangeAmount,
        tokenBalance:
          toToken === "FRU"
            ? Number(user.tokenBalance) + exchangeAmountNum
            : Number(user.tokenBalance),
      };
    }),

  requestWithdraw: procedure
    .input(
      z.object({
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const adminBot = new Bot(process.env.ADMIN_BOT_TOKEN as string);

      const userId = ctx.userId;
      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.walletAddress) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Wallet is not connected",
        });
      }

      const { amount } = input;

      if (user.tokenBalance < amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // 10 FRU -> 10_000_000_000 (nano)

      const nanoFru = toNano(amount);

      const withdrawId = nanoid();

      await db.insert(withdrawalsTable).values({
        id: withdrawId,
        userId,
        amount: nanoFru,
        status: "waiting_for_approve",
      });

      await db
        .update(usersTable)
        .set({
          tokenBalance: user.tokenBalance - amount,
        })
        .where(eq(usersTable.id, userId));

      // send message to the bot (approve/ reject)

      const address = Address.parse(user.walletAddress).toString({
        urlSafe: true,
        bounceable: true,
      });

      const userFriends = await db.query.usersTable.findMany({
        where: (users) => eq(users.referrerId, userId),
      });

      const userFarmsSum = Object.values(user.farms).reduce((acc, curr) => acc + curr, 0);

      await adminBot.api.sendMessage(
        WITHDRAW_CHAT_ID,
        `Withdraw <b>${(amount * (1 - WITHDRAWAL_FEE)).toFixed(2)}</b> FRU
<b>${user.name}</b> <code>${userId} ${address}</code>
Balance: ${user.tokenBalance.toFixed(2)} FRU
Friends: ${userFriends.length.toFixed(0)}
Farms: ${userFarmsSum.toFixed(0)}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Reject ❌",
                  callback_data: `reject:${withdrawId}:${userId}:${nanoFru}`,
                },
                {
                  text: "Ok ✅",
                  callback_data: `approve:${withdrawId}:${userId}:${nanoFru}`,
                },
              ],
            ],
          },
        },
      );
    }),
  getLastWithdrawals: procedure.query(async ({ ctx }) => {
    const withdrawals = await db.query.withdrawalsTable.findMany({
      orderBy: (withdrawals) => desc(withdrawals.createdAt),
      limit: 10,
    });
    return withdrawals;
  }),
} satisfies TRPCRouterRecord;

export type Router = typeof router;
