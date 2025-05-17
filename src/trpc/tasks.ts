import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import {
  FrontendTask,
  TaskData,
  tasksTable,
  TaskStatus,
  userTasksTable,
} from "~/lib/db/schema";
import { procedure } from "./init";

export const tasksRouter = {
  getTasks: procedure.query<FrontendTask[]>(async ({ ctx }) => {
    console.log("getTasks called with userId:", ctx.userId);

    const tasks = await db.select().from(tasksTable);
    console.log("Retrieved tasks:", JSON.stringify(tasks, null, 2));

    const userTasks = await db
      .select()
      .from(userTasksTable)
      .where(eq(userTasksTable.userId, ctx.userId));
    console.log("Retrieved userTasks:", JSON.stringify(userTasks, null, 2));

    const userTaskMap = new Map<number, TaskStatus>(
      userTasks.map((ut) => [ut.taskId, ut.status as TaskStatus]),
    );
    console.log("Created userTaskMap:", Object.fromEntries(userTaskMap));

    const result = tasks.map((task) => {
      const status = userTaskMap.get(task.id) || "notStarted";
      console.log(`Mapping task ${task.id} with status: ${status}`);

      return {
        id: task.id,
        name: task.name,
        status: status satisfies TaskStatus,
        reward: task.reward,
        imageUrl: task.imageUrl || "",
        taskData: task.data as TaskData,
      } satisfies FrontendTask;
    });

    console.log("Returning tasks result:", JSON.stringify(result, null, 2));
    return result;
  }),

  getTasksStatuses: procedure
    .input(
      z.object({
        tasksIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("getTasksStatuses called with userId:", ctx.userId);
      console.log("Input taskIds:", input.tasksIds);

      if (input.tasksIds.length === 0) {
        console.log("No task IDs provided, returning empty array");
        return [];
      }

      // Get all tasks statuses for the given task IDs
      const userTasks = await db
        .select()
        .from(userTasksTable)
        .where(
          and(
            eq(userTasksTable.userId, ctx.userId),
            inArray(userTasksTable.taskId, input.tasksIds),
          ),
        );

      console.log("input.tasksIds", input.tasksIds);
      console.log("userTasks", JSON.stringify(userTasks, null, 2));

      // Map tasks to required format
      const result = userTasks.map((task) => ({
        taskId: task.taskId,
        status: task.status,
      }));

      console.log("Returning task statuses:", JSON.stringify(result, null, 2));
      return result;
    }),

  startVerification: procedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      console.log(
        "startVerification called with userId:",
        ctx.userId,
        "taskId:",
        input.taskId,
      );

      const task = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, input.taskId))
        .then((rows) => rows[0]);

      console.log("Found task:", JSON.stringify(task, null, 2));

      if (!task) {
        console.error("Task not found for id:", input.taskId);
        throw new Error("Task not found");
      }

      const existingTask = await db
        .select()
        .from(userTasksTable)
        .where(
          and(
            eq(userTasksTable.userId, ctx.userId),
            eq(userTasksTable.taskId, input.taskId),
          ),
        );

      console.log("existingTask", JSON.stringify(existingTask, null, 2));

      if (existingTask.length === 0) {
        console.log("No existing task found, creating new entry");
        // create new task as checking in users table
        await db.insert(userTasksTable).values({
          userId: ctx.userId,
          taskId: input.taskId,
          status: "checking",
        });

        console.log("new task created");
      } else {
        console.log("Existing task found, updating status to checking");
        await db
          .update(userTasksTable)
          .set({
            status: "checking",
          })
          .where(
            and(
              eq(userTasksTable.userId, ctx.userId),
              eq(userTasksTable.taskId, input.taskId),
            ),
          );
        console.log("Task updated to checking status");
      }

      const result = {
        id: input.taskId,
        status: "checking" as TaskStatus,
      };

      console.log("Returning result:", JSON.stringify(result, null, 2));
      return result;
    }),

  startTask: procedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      console.log("startTask called with userId:", ctx.userId, "taskId:", input.taskId);

      const task = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, input.taskId))
        .then((rows) => rows[0]);

      console.log("Found task:", JSON.stringify(task, null, 2));

      if (!task) {
        console.error("Task not found for id:", input.taskId);
        throw new Error("Task not found");
      }

      // Check if task already exists
      const existingTask = await db
        .select()
        .from(userTasksTable)
        .where(
          and(
            eq(userTasksTable.userId, ctx.userId),
            eq(userTasksTable.taskId, input.taskId),
          ),
        );

      console.log("Existing user task:", JSON.stringify(existingTask, null, 2));

      if (existingTask.length > 0) {
        console.log("Task already exists, updating status to started");
        await db
          .update(userTasksTable)
          .set({
            status: "started",
          })
          .where(
            and(
              eq(userTasksTable.userId, ctx.userId),
              eq(userTasksTable.taskId, input.taskId),
            ),
          );
        console.log("Task updated to started status");
      } else {
        console.log("Creating new task with started status");
        await db.insert(userTasksTable).values({
          userId: ctx.userId,
          taskId: input.taskId,
          status: "started",
        });
        console.log("New task created with started status");
      }

      console.log("startTask completed successfully");
    }),
};
