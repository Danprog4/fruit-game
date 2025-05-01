import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { handleCreateInvoice } from "~/create-invoice";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { createTRPCRouter, procedure } from "./init";

export const tgTxRouter = createTRPCRouter({
  createInvoice: procedure.mutation(async ({ ctx }) => {
    return await handleCreateInvoice(ctx.userId);
  }),
  upgradeForStars: procedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    const stars = user.starBalance;
    await db
      .update(usersTable)
      .set({ starBalance: stars + 100 })
      .where(eq(usersTable.id, userId));
    return { success: true, data: user };
  }),
});
