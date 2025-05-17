import {
  conversations,
  createConversation,
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fromNano, toNano } from "@ton/core";
import { eq, inArray, isNotNull } from "drizzle-orm";
import { Bot, webhookCallback, type Context } from "grammy";
import { isAdmin } from "~/lib/admin";
import { WITHDRAWAL_FEE } from "~/lib/constants";
import { db } from "~/lib/db";
import {
  adminBotTable,
  adminWithdrawalsTable,
  allianceSessionTable,
  usersTable,
  withdrawalsTable,
} from "~/lib/db/schema";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { transferJetton } from "~/lib/web3/send-withdraw";

import { Redis } from "@upstash/redis";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { CHAMP_CONFIG } from "~/lib/champ.config";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const token = process.env.ADMIN_BOT_TOKEN;
if (!token) throw new Error("ADMIN_BOT_TOKEN is unset");

const bot = new Bot<ConversationFlavor<Context>>(token);
bot.use(conversations());

const availableFruits = FARMS_CONFIG.map((farm) => farm.id).join(", ");

bot.command("start", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  await ctx.reply("Hello, admin");
});

bot.command("rewards", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const count = await db.query.userTasksTable.findMany({
    where: (userTasks) => eq(userTasks.status, "completed"),
  });

  await ctx.reply(`Count of rewards: ${count.length}`);
});

bot.command("reffs", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const referrers = await db.query.usersTable.findMany({
    where: (users) => isNotNull(users.referrerId),
  });

  const referrerCounts: Record<string, number> = {};

  for (const user of referrers) {
    if (user.referrerId) {
      referrerCounts[user.referrerId] = (referrerCounts[user.referrerId] || 0) + 1;
    }
  }

  const topReferrers = Object.entries(referrerCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10);

  const topReferrerIds = topReferrers.map(([id]) => Number(id));

  const top10ReferrerUsers = await db.query.usersTable.findMany({
    where: (users) => inArray(users.id, topReferrerIds),
  });

  // Create a map of user id to user object for easier lookup
  const userMap = top10ReferrerUsers.reduce(
    (map, user) => {
      map[user.id] = user;
      return map;
    },
    {} as Record<number, (typeof top10ReferrerUsers)[0]>,
  );

  // Format the response with proper sorting
  const responseText = topReferrers
    .map(([id, count]) => {
      const user = userMap[Number(id)];
      return user ? `${user.name}: ${count} referrals` : null;
    })
    .filter(Boolean)
    .join("\n");

  await ctx.reply(`Top 10 users with most referrals:\n${responseText}`);
});

bot.command("farms", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const users = await db.query.usersTable.findMany({
    where: (users) => isNotNull(users.farms),
  });

  const usersFarmCounts = users.map((user) => ({
    userId: user.id,
    name: user.name,
    farmCount: Object.values(user.farms).length,
  }));

  if (usersFarmCounts.length === 0) {
    await ctx.reply("No users with farms");
    return;
  }

  const topFarmUsers = usersFarmCounts
    .sort((a, b) => Number(b.farmCount) - Number(a.farmCount))
    .slice(0, 10);

  const responseText = topFarmUsers
    .map((user) => `${user.name}: ${user.farmCount} farms`)
    .join("\n");

  await ctx.reply(`Top 10 users with most farms:\n${responseText}`);
});

bot.command("withdraw", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const season = await db.query.allianceSessionTable.findFirst({});

  if (!season) {
    await ctx.reply("No season");
    return;
  }

  const dateNow = dayjs();

  if (dateNow.isBefore(season.seasonEnd)) {
    await ctx.reply("Season is not over yet");
    return;
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

  const topOwners = topAlliances.map((alliance) => alliance.ownerId);

  const topOwnersUsers = await db.query.usersTable.findMany({
    where: (users) => inArray(users.id, topOwners),
  });

  const filteredTopOwnersUsers = topOwnersUsers.filter((user) => !user.isRewarded);

  const rewards = filteredTopOwnersUsers.map((user) => {
    const alliance = topAlliances.find((alliance) => alliance.ownerId === user.id);
    const position =
      topAlliances.findIndex((alliance) => alliance.ownerId === user.id) + 1;
    const rewardAmount = CHAMP_CONFIG[position as keyof typeof CHAMP_CONFIG] || 0;

    return {
      name: user.name,
      walletAddress: user.walletAddress,
      allianceName: alliance?.name,
      position,
      reward: rewardAmount,
    };
  });

  if (rewards.length === 0) {
    await ctx.reply("No available allainces that have not been rewarded yet");
    return;
  }

  for (const reward of rewards) {
    const withdrawId = nanoid();
    const fruAmount = reward.reward * 0.5;
    const nanoFru = toNano(fruAmount);
    const userId = topOwners[reward.position - 1];

    await db.insert(adminWithdrawalsTable).values({
      id: withdrawId,
      userId: userId,
      amount: BigInt(fruAmount),
      status: "waiting_for_approve",
      createdAt: new Date(),
    });

    await ctx.reply(
      `Alliance Reward for Season ${season.seasonCurr}
<b>${reward.position} place</b>
<b>${reward.name}</b> - Alliance: <b>${reward.allianceName}</b>
Reward: <b>${reward.reward.toFixed(2)}</b> FRU
<b>Wallet Address:</b> <code>${reward.walletAddress}</code>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Reject ❌",
                callback_data: `reject:${withdrawId}:${userId}:${nanoFru}:admin`,
              },
              {
                text: "Ok ✅",
                callback_data: `approve:${withdrawId}:${userId}:${nanoFru}:admin`,
              },
            ],
          ],
        },
      },
    );
  }
});

bot.command("tokens", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Hello, you're not an admin");
    return;
  }

  const users = await db.query.usersTable.findMany({
    where: (users) => isNotNull(users.tokenBalance),
  });

  const topUsers = users.sort((a, b) => b.tokenBalance - a.tokenBalance).slice(0, 10);

  await ctx.reply(
    `Top 10 users with most tokens:\n${topUsers.map((user) => `${user.name}: ${user.tokenBalance}`).join("\n")}`,
  );
});

async function setText(conversation: Conversation, ctx: Context) {
  // Initialize with an empty object
  await redis.set("text", JSON.stringify({}));

  await ctx.reply(
    "Set the text you want to set as 1 text in 2 languages. \nThe format is - Your text:Твой текст",
  );

  for (let i = 0; i < 3; i++) {
    const { message } = await conversation.waitFor("message:text");

    if (!message.text.includes(":")) {
      await ctx.reply(
        "Invalid format. The format is - Your text:Твой текст. \nTry again.",
      );
      return;
    }

    const [englishText, russianTranslation] = message.text.split(":");

    const raw = await redis.get("text");
    const currentTexts = raw ? (JSON.parse(raw as string) as Record<string, string>) : {};

    // Use the English text as the key for the translation
    await redis.set(
      "text",
      JSON.stringify({ ...currentTexts, [englishText]: russianTranslation }),
    );

    if (i === 2) {
      await db.delete(adminBotTable);

      const finalRaw = await redis.get("text");
      const finalTexts = finalRaw
        ? (JSON.parse(finalRaw as string) as Record<string, string>)
        : {};

      // Insert to database
      await db.insert(adminBotTable).values({
        text: finalTexts,
      });
    }

    if (i < 2) {
      await ctx.reply(`Set the text you want to set as ${i + 2} text in 2 languages`);
    }
  }

  await ctx.reply(`All texts have been successfully set!`);
}
bot.use(createConversation(setText, "setText"));

bot.command("text", async (ctx) => {
  await ctx.conversation.enter("setText");
});

async function setSeason(conversation: Conversation, ctx: Context) {
  await ctx.reply(`Enter the season fruit. Available fruits: ${availableFruits}`);
  const { message } = await conversation.waitFor("message:text");

  if (!availableFruits.includes(message.text.toLowerCase())) {
    await ctx.reply("Invalid fruit");
    return;
  }

  await db.update(allianceSessionTable).set({
    seasonCurr: message.text,
    seasonStart: dayjs().toDate(),
    seasonEnd: dayjs().add(1, "month").toDate(),
  });

  await ctx.reply(
    `Season fruit has been successfully set! The season will start now and end after month`,
  );
}
bot.use(createConversation(setSeason, "setSeason"));

bot.command("season", async (ctx) => {
  await ctx.conversation.enter("setSeason");
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const [action, id, userId, amount, source] = data.split(":");
  const isAdmin = source === "admin";
  const chatId = ctx.callbackQuery.message?.chat.id;
  const messageId = ctx.callbackQuery.message?.message_id;
  const amountNumber = BigInt(amount);
  const formattedAmount = fromNano(amountNumber);
  const amountWithFee = Number(formattedAmount) * (1 - WITHDRAWAL_FEE);
  const amountWithFeeNano = toNano(amountWithFee);

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

  if (!chatId || !messageId) {
    console.error("Invalid chatId or messageId", chatId, messageId);
    return;
  }

  if (isAdmin) {
    const tx = await db.query.adminWithdrawalsTable.findFirst({
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

    await db
      .update(adminWithdrawalsTable)
      .set({ status })
      .where(eq(adminWithdrawalsTable.id, id));

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
        .update(adminWithdrawalsTable)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(adminWithdrawalsTable.id, id));

      await db
        .update(usersTable)
        .set({ isRewarded: true })
        .where(eq(usersTable.id, Number(userId)));
    } catch (error) {
      await db
        .update(adminWithdrawalsTable)
        .set({ status: "failed" })
        .where(eq(adminWithdrawalsTable.id, id));

      console.error("Error sending withdraw", error);
    }

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
