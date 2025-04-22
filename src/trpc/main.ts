import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
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
} satisfies TRPCRouterRecord;

export type Router = typeof router;
