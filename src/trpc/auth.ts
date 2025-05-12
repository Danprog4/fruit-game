import { getEvent, setCookie } from "@tanstack/react-start/server";
import { parse, validate } from "@telegram-apps/init-data-node";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { updateBalances } from "~/lib/utils/updateBalances";
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
            await db
              .update(usersTable)
              .set({
                starBalance: (referrer.starBalance || 0) + 100,
              })
              .where(eq(usersTable.id, Number(referrerId)));
          }
        }

        return newUser[0];
      }

      await updateBalances(existingUser.id);

      const allReferrals = await db.query.usersTable.findMany({
        where: eq(usersTable.referrerId, existingUser.id),
      });

      if (allReferrals.length > 0) {
        const existingUserBalances =
          (existingUser.balances as Record<string, number>) || {};
        const updatedExistingUserBalances = { ...existingUserBalances };

        // Get elapsed time since user's last balance update
        const nowMs = Date.now();
        const lastDate = existingUser.lastUpdatedBalanceAt as unknown as Date | null;
        const lastUpdatedMs = lastDate?.getTime() ?? nowMs;
        const elapsedSeconds = (nowMs - lastUpdatedMs) / 1000;

        for (const referral of allReferrals) {
          const referralFarms = (referral.farms as Record<string, number>) || {};

          Object.entries(referralFarms).forEach(([farmId, amount]) => {
            const farm = FARMS_CONFIG.find((f) => f.id === farmId);
            if (farm) {
              // Calculate referral bonus based on the user's elapsed time
              const ratePerSecond = farm.miningRate / 3600;
              const bonus = amount * ratePerSecond * elapsedSeconds * 0.05;
              updatedExistingUserBalances[farmId] =
                (updatedExistingUserBalances[farmId] || 0) + bonus;
            }
          });
        }

        await db
          .update(usersTable)
          .set({
            balances: updatedExistingUserBalances,
            lastUpdatedBalanceAt: new Date(nowMs),
          })
          .where(eq(usersTable.id, existingUser.id));

        const updatedUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, existingUser.id),
        });

        return updatedUser || existingUser;
      }

      return existingUser;
    }),
} satisfies TRPCRouterRecord;
