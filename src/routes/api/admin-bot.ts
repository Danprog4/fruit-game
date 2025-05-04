import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fromNano } from "@ton/core";
import { eq } from "drizzle-orm";
import { Bot, webhookCallback } from "grammy";
import { isAdmin } from "~/lib/admin";
import { db } from "~/lib/db";
import { withdrawalsTable } from "~/lib/db/schema";

const token = process.env.ADMIN_BOT_TOKEN;
if (!token) throw new Error("ADMIN_BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  if (!ctx.from?.id || !isAdmin(ctx.from.id)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  await ctx.reply("Hello, admin");
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const [action, id, userId, amount] = data.split(":");

  const chatId = ctx.callbackQuery.message?.chat.id;
  const messageId = ctx.callbackQuery.message?.message_id;
  const amountNumber = Number(amount);
  const formattedAmount = fromNano(amountNumber);

  if (isNaN(amountNumber)) {
    console.error("Invalid amount (NaN)", amount);
    return;
  }

  if (!chatId || !messageId) {
    console.error("Invalid chatId or messageId", chatId, messageId);
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: (users) => eq(users.id, Number(userId)),
  });

  if (!user) {
    console.error("User not found", userId);
    return;
  }

  if (!user.walletAddress) {
    console.error("User has no wallet", userId);
    return;
  }

  if (action === "approve") {
    await bot.api.editMessageText(
      chatId,
      messageId,
      `<b>APPROVED ✅</b> <code>${id}</code>\n\n@${user.name}  <code>${userId}</code> ${formattedAmount} FRU`,
      { parse_mode: "HTML" },
    );

    await db
      .update(withdrawalsTable)
      .set({
        status: "approved",
      })
      .where(eq(withdrawalsTable.id, id));
  } else if (action === "reject") {
    await db
      .update(withdrawalsTable)
      .set({
        status: "failed",
      })
      .where(eq(withdrawalsTable.id, id));

    await bot.api.editMessageText(
      chatId,
      messageId,
      `<b>REJECTED ❌</b> <code>${id}</code>\n\n@${user.name} <code>${userId}</code> ${formattedAmount} FRU`,
      { parse_mode: "HTML" },
    );
  }
});

const update = webhookCallback(bot, "std/http");

const handleUpdate = async (request: Request) => {
  return await update(request);
};

export const APIRoute = createAPIFileRoute("/api/admin-bot")({
  GET: async ({ request }) => handleUpdate(request),
  POST: async ({ request }) => handleUpdate(request),
});
