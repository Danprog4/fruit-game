import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { TaskStatus, userTasksTable } from "~/lib/db/schema";
import { checkMembership } from "~/lib/tasks/check-task";
import { startTonProcessor } from "~/lib/web3/ton-payment";

export const APIRoute = createAPIFileRoute("/api/txs")({
  GET: async () => {
    await startTonProcessor();

    const checkingTasks = await db
      .select()
      .from(userTasksTable)
      .where(eq(userTasksTable.status, "checking" as TaskStatus));

    // Process each checking task
    for (const task of checkingTasks) {
      await checkMembership({
        userId: task.userId,
        taskId: task.taskId,
      });
    }

    return json({ success: true });
  },
});
