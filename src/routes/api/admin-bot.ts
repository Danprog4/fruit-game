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

// Структура для хранения состояния диалога
interface TextDialogState {
  step: number; // Текущий шаг сбора (1-3)
  texts: string[]; // Собранные тексты
  timeoutId: ReturnType<typeof setTimeout> | null; // ID таймера, чтобы его можно было отменить
}

// Map для отслеживания состояния диалогов по ID пользователя
const textDialogs = new Map<number, TextDialogState>();

bot.command("start", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  await ctx.reply("Hello, admin");
});

// Обработчик команды text
bot.command("text", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("Error identifying user");
    return;
  }

  // Если уже есть активный диалог - очищаем его
  if (textDialogs.has(userId)) {
    const oldDialog = textDialogs.get(userId);
    if (oldDialog?.timeoutId) {
      clearTimeout(oldDialog.timeoutId);
    }
  }

  // Инициализируем новый диалог
  textDialogs.set(userId, {
    step: 1,
    texts: [],
    timeoutId: setTimeout(() => {
      if (textDialogs.has(userId)) {
        ctx.reply("Timeout waiting for response. Please try the /text command again.");
        textDialogs.delete(userId);
      }
    }, 60000), // 1 минута на ответ
  });

  await ctx.reply(`Enter the text you want to set as 1 text`);
});

// Обработчик текстовых сообщений для диалога
bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId || !isAdmin(ctx)) return;

  // Проверяем, есть ли активный диалог
  const dialogState = textDialogs.get(userId);
  if (!dialogState) return;

  // Отменяем существующий таймер
  if (dialogState.timeoutId) {
    clearTimeout(dialogState.timeoutId);
  }

  // Добавляем текст
  dialogState.texts.push(ctx.message.text);
  dialogState.step++;

  // Если собрали все тексты
  if (dialogState.step > 3) {
    textDialogs.delete(userId);

    try {
      // Обновляем базу данных
      await db.delete(adminBotTable);
      await db.insert(adminBotTable).values({ text: dialogState.texts });
      await ctx.reply("All texts have been successfully set!");
    } catch (error) {
      console.error("Error updating texts:", error);
      await ctx.reply("Failed to set texts. Please try again with /text command.");
    }
    return;
  }

  // Иначе запрашиваем следующий текст
  await ctx.reply(`Enter the text you want to set as ${dialogState.step} text`);

  // Устанавливаем новый таймер
  dialogState.timeoutId = setTimeout(() => {
    if (textDialogs.has(userId)) {
      ctx.reply("Timeout waiting for response. Please try the /text command again.");
      textDialogs.delete(userId);
    }
  }, 60000);
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
