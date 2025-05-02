import { getEvent, setCookie } from "@tanstack/react-start/server";
import { parse, validate } from "@telegram-apps/init-data-node";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { updateBalances } from "~/lib/utils/updateBalances";
import { updateDmBalance } from "~/lib/utils/updateDmBalance";
import { publicProcedure } from "./init";

export const authRouter = {
  login: publicProcedure
    .input(
      z.object({
        initData: z.string(),
        startParam: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        validate(input.initData, process.env.BOT_TOKEN!, {
          expiresIn: 0,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid init data",
        });
      }
      const parsedData = parse(input.initData);

      const telegramUser = parsedData.user;
      const referrerId = input.startParam?.split("_")[1];
      console.log(referrerId, "startParam");

      if (!telegramUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid init data",
        });
      }

      const token = await new SignJWT({ userId: telegramUser.id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y")
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

      const event = getEvent();

      setCookie(event, "auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });

      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, telegramUser.id),
      });
      const name =
        telegramUser.first_name +
        (telegramUser.last_name ? ` ${telegramUser.last_name}` : "");

      if (!existingUser) {
        const newUser = await db
          .insert(usersTable)
          .values({
            id: telegramUser.id,
            referrerId: referrerId ? Number(referrerId) : null,
            tokenBalance: 0,
            name,
            photoUrl: telegramUser.photo_url || null,
          })
          .returning();

        console.log(newUser, "newUser");

        if (referrerId) {
          const referrer = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, Number(referrerId)),
          });

          if (referrer) {
            // Give 10 stars to referrer
            await db
              .update(usersTable)
              .set({
                starBalance: (referrer.starBalance || 0) + 10,
              })
              .where(eq(usersTable.id, Number(referrerId)));
          }
        }

        return newUser[0];
      }

      await updateBalances(existingUser.id);
      await updateDmBalance(existingUser.id);

      // If user has a referrer, give 5% of all balances to the referrer
      if (existingUser.referrerId) {
        const referrer = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, existingUser.referrerId),
        });

        if (referrer) {
          // Calculate 5% of user's token balance
          const referralBonus = Math.floor(existingUser.tokenBalance * 0.05);

          // Calculate 5% of each fruit in balances
          const userBalances = existingUser.balances as Record<string, number>;
          const referrerBalances = referrer.balances as Record<string, number>;

          const updatedReferrerBalances = { ...referrerBalances };

          // Add 5% of each fruit balance to referrer
          for (const [fruit, amount] of Object.entries(userBalances)) {
            const bonus = Math.floor(amount * 0.05);
            if (bonus > 0) {
              updatedReferrerBalances[fruit] =
                (updatedReferrerBalances[fruit] || 0) + bonus;
            }
          }

          // Update referrer with bonuses
          await db
            .update(usersTable)
            .set({
              tokenBalance: referrer.tokenBalance + referralBonus,
              balances: updatedReferrerBalances,
            })
            .where(eq(usersTable.id, existingUser.referrerId));
        }
      }

      return existingUser;
    }),
} satisfies TRPCRouterRecord;
