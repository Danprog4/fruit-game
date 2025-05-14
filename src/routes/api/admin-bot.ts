import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fromNano, toNano } from "@ton/core";
import { eq } from "drizzle-orm";
import { Bot, webhookCallback } from "grammy";
import { isAdmin } from "~/lib/admin";
import { WITHDRAWAL_FEE } from "~/lib/constants";
import { db } from "~/lib/db";
import { adminBotTable, usersTable, withdrawalsTable } from "~/lib/db/schema";
import { transferJetton } from "~/lib/web3/send-withdraw";

const token = process.env.ADMIN_BOT_TOKEN;
if (!token) throw new Error("ADMIN_BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  await ctx.reply("Hello, admin");
});

bot.command("text", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  // Use a simple conversation approach
  try {
    // Ask for all three texts one after another
    const texts = [];

    for (let i = 1; i <= 3; i++) {
      await ctx.reply(`Enter the text you want to set as ${i} text`);

      // Wait for an admin response with 60-second timeout
      const text = await Promise.race([
        new Promise<string | null>((resolve) => {
          // Create a temporary handler that will be used just once
          const handler = bot.hears(/.*/, (msgCtx) => {
            // Only process if from the same admin user
            if (msgCtx.from?.id !== ctx.from?.id || !isAdmin(msgCtx)) {
              return;
            }

            const messageText = msgCtx.message?.text;
            if (!messageText) {
              msgCtx.reply(
                "Please send a valid text message. Try the /set-text command again.",
              );
              resolve(null);
              return;
            }

            resolve(messageText);

            // This handler will be automatically removed after first match
            return true;
          });
        }),
        new Promise<null>((resolve) =>
          setTimeout(() => {
            ctx.reply(
              "Timeout waiting for response. Please try the /set-text command again.",
            );
            resolve(null);
          }, 60000),
        ),
      ]);

      if (text === null) {
        return; // Exit if any text is invalid or timeout
      }

      texts.push(text);
    }

    // Update database with collected texts
    await db.delete(adminBotTable);
    await db.insert(adminBotTable).values({ text: texts });
    await ctx.reply("All texts have been successfully set!");
  } catch (error) {
    console.error("Error during text collection:", error);
    await ctx.reply("Failed to set texts. Please try again with /set-text command.");
  }
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

  const tx = await db.query.withdrawalsTable.findFirst({
    where: (withdrawals) => eq(withdrawals.id, id),
  });

  if (!tx) {
    console.error("Withdrawal not found", id);
    return;
  }

  if (tx.status === "completed" || tx.status === "failed") {
    console.error("Withdrawal is already completed or failed", id);
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
    `<b>${statusText}</b> <code>${id}</code>\n\n${user.name} <code>${userId}</code> ${Number(Number(formattedAmount) * (1 - WITHDRAWAL_FEE)).toFixed(2)} FRU`,
    { parse_mode: "HTML" },
  );

  if (!isApprove) return;

  try {
    await transferJetton(id, user.walletAddress, amountWithFeeNano);

    await db
      .update(withdrawalsTable)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(withdrawalsTable.id, id));
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
