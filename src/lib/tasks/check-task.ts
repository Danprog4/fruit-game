import axios from "axios";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { tasksTable } from "../db/schema";
import { makeTaskCompleted, makeTaskFailed } from "./db-repo";

export async function checkMembership({
  userId,
  taskId,
}: {
  userId: number;
  taskId: number;
}) {
  console.log("checkMembershipJob", { userId, taskId });

  const task = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId))
    .then((rows) => rows[0]);

  console.log("Task data:", JSON.stringify(task, null, 2));

  const chatId = task.data?.type === "telegram" ? task.data.data.chatId : null;

  if (!chatId) {
    console.error("No chatId or channelName found", taskId);
    console.log("Task data structure:", JSON.stringify(task.data, null, 2));
    return;
  }

  console.log("Attempting to check membership for chatId:", chatId);

  try {
    const isMember = await checkTelegramMembership({
      userId,
      chatId,
    });

    console.log("isMember result:", isMember);

    if (isMember) {
      console.log("User is a member, completing task", { userId, taskId });
      await makeTaskCompleted(userId, taskId);
      console.log("makeTaskCompleted", userId, taskId);
    } else {
      console.log("User is not a member, marking task as failed", { userId, taskId });
      await makeTaskFailed(userId, taskId);
    }
  } catch (e) {
    console.log("Error checking membership:", (e as Error).message);
    console.log("Error details:", e);
    await makeTaskFailed(userId, taskId);
  }
}

async function checkTelegramMembership(args: {
  userId: number;
  chatId: string;
}): Promise<boolean> {
  const { userId, chatId } = args;
  console.log("Making Telegram API request with params:", {
    chat_id: chatId.toString().startsWith("-") ? chatId : "@" + chatId,
    user_id: userId,
  });

  try {
    const response = await axios.get<{ result: { status: string } }>(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: chatId.toString().startsWith("-") ? chatId : "@" + chatId,
          user_id: userId,
        },
      },
    );

    console.log("Telegram API response:", JSON.stringify(response.data, null, 2));
    console.log("Membership status:", response.data.result.status);

    return (
      response.data.result.status === "member" ||
      response.data.result.status === "administrator" ||
      response.data.result.status === "creator"
    );
  } catch (error) {
    console.log("Telegram API request failed:", (error as Error).message);
    console.log("Error response data:", (error as any).response?.data);
    throw error;
  }
}
