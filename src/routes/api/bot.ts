import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.on("message:successful_payment", async (ctx) => {
  console.log("message:successful_payment", ctx);
  const payment = ctx.update.message.successful_payment;

  console.log("message:successful_payment", JSON.stringify(payment, null, 2));

  const payload = JSON.parse(payment.invoice_payload) as { userId: number };

  console.log("payload", payload);
});

bot.command("start", async (ctx) => {
  await ctx.reply("Hello");
});

bot.on("pre_checkout_query", async (ctx) => {
  console.log("pre_checkout_query", ctx);
  return ctx.answerPreCheckoutQuery(true);
});

const handleUpdate = webhookCallback(bot, "std/http");

export const APIRoute = createAPIFileRoute("/api/bot")({
  GET: async ({ request }) => {
    return handleUpdate(request);
  },
  POST: async ({ request }) => {
    return handleUpdate(request);
  },
});
