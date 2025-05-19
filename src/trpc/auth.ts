import { getEvent, setCookie } from "@tanstack/react-start/server";
import { parse, validate } from "@telegram-apps/init-data-node";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import dayjs from "dayjs";
import { eq, isNotNull } from "drizzle-orm";
import { SignJWT } from "jose";
import { z } from "zod";
import { CHAMP_CONFIG } from "~/lib/champ.config";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
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
            // for testing
            tokenBalance: 1000000,
            starBalance: 1000000,
            name,
            photoUrl: telegramUser.photo_url || null,
            language: telegramUser.language_code,
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

      const season = await db.query.allianceSessionTable.findFirst({});

      if (!season) {
        return existingUser;
      }

      if (!existingUser.walletAddress) {
        return existingUser;
      }

      const dateNow = dayjs();

      if (dateNow.isBefore(season.seasonEnd)) {
        return existingUser;
      }

      const users = await db.query.usersTable.findMany({
        where: (users) => isNotNull(users.allianceId),
      });

      const alliances = await db.query.alliancesTable.findMany({});

      const topAlliances = alliances
        ?.map((alliance) => {
          const allianceMembers =
            users?.filter((user) => user.allianceId === alliance.id) || [];
          let totalFruits = 0;
          allianceMembers.forEach((member) => {
            totalFruits += (member.balances as any)[season.seasonCurr] || 0;
          });

          return {
            ...alliance,
            totalFruits,
          };
        })
        .sort((a, b) => b.totalFruits - a.totalFruits)
        .slice(0, 5);

      const topAlliancesMembers = topAlliances.map((alliance) =>
        users?.filter((user) => user.allianceId === alliance.id),
      );

      const isMember = topAlliancesMembers.some((member) =>
        member.some((user) => user.id === existingUser.id),
      );

      if (!isMember) {
        return existingUser;
      }

      const userMember = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, existingUser.id),
      });
      if (!userMember) {
        return existingUser;
      }

      const countOfMembers = topAlliancesMembers.length;

      const position =
        topAlliances.findIndex((alliance) => alliance.ownerId === userMember.id) + 1;

      const rewardAmount =
        ((CHAMP_CONFIG[position as keyof typeof CHAMP_CONFIG] || 0) * 0.5) /
        countOfMembers;

      if (userMember.isRewarded) {
        return existingUser;
      }

      await db
        .update(usersTable)
        .set({
          isRewarded: true,
          tokenBalance: userMember.tokenBalance + rewardAmount,
        })
        .where(eq(usersTable.id, existingUser.id));

      return existingUser;
    }),
} satisfies TRPCRouterRecord;
