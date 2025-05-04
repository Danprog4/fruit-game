import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fromNano, toNano } from "@ton/core";
import { eq } from "drizzle-orm";
import { Bot, webhookCallback } from "grammy";
import { isAdmin } from "~/lib/admin";
import { WITHDRAWAL_FEE } from "~/lib/constants";
import { db } from "~/lib/db";
import { usersTable, withdrawalsTable } from "~/lib/db/schema";
import { transferJetton } from "~/lib/web3/send-withdraw";

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
  const amountNumber = BigInt(amount);
  const formattedAmount = fromNano(amountNumber);
  const amountWithFee = Number(formattedAmount) * (1 - WITHDRAWAL_FEE);
  const amountWithFeeNano = toNano(amountWithFee);

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
  if (action !== "approve" && action !== "reject") {
    console.error("Unknown action", action);
    return;
  }

  const isApprove = action === "approve";
  const status = isApprove ? "approved" : "failed";
  const statusText = isApprove ? "APPROVED ✅" : "REJECTED ❌";

  // status actually is rejected here
  if (status === "failed") {
    await db
      .update(usersTable)
      .set({ tokenBalance: user.tokenBalance + Number(fromNano(amountNumber)) })
      .where(eq(usersTable.id, Number(userId)));
  }

  await db.update(withdrawalsTable).set({ status }).where(eq(withdrawalsTable.id, id));

  await bot.api.editMessageText(
    chatId,
    messageId,
    `<b>${statusText}</b> <code>${id}</code>\n\n@${user.name} <code>${userId}</code> ${formattedAmount} FRU - ${Number(fromNano(amountNumber)) * WITHDRAWAL_FEE} FRU (5%)`,
    { parse_mode: "HTML" },
  );

  if (!isApprove) return;

  try {
    await transferJetton(id, user.walletAddress, amountWithFeeNano);
  } catch (error) {
    await db
      .update(withdrawalsTable)
      .set({ status: "failed" })
      .where(eq(withdrawalsTable.id, id));

    console.error("Error sending withdraw", error);
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
