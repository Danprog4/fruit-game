import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { alliancesTable, usersTable } from "~/lib/db/schema";
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
  joinAlliance: procedure
    .input(
      z.object({
        allianceId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const allianceId = input.allianceId;
      const user = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, userId),
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const alliance = await db.query.alliancesTable.findFirst({
        where: (alliances) => eq(alliances.id, Number(allianceId)),
      });
      if (!alliance) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alliance not found" });
      }
      await db
        .update(usersTable)
        .set({ allianceId: Number(allianceId), allianceJoinDate: new Date() })
        .where(eq(usersTable.id, userId));

      await db
        .update(alliancesTable)
        .set({ members: (alliance.members || 0) + 1 })
        .where(eq(alliancesTable.id, Number(allianceId)));
    }),
  getUsers: procedure.query(async ({ ctx }) => {
    const users = await db.query.usersTable.findMany();
    return users;
  }),
  kickFromAlliance: procedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId: targetUserId } = input;
      await db
        .update(usersTable)
        .set({ allianceId: null })
        .where(eq(usersTable.id, targetUserId));
    }),
} satisfies TRPCRouterRecord;

export type Router = typeof router;
