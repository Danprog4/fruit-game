import { TRPCError } from "@trpc/server";
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
    const tasks = await db.select().from(tasksTable);

    const userTasks = await db
      .select()
      .from(userTasksTable)
      .where(eq(userTasksTable.userId, ctx.userId));

    const userTaskMap = new Map<number, TaskStatus>(
      userTasks.map((ut) => [ut.taskId, ut.status as TaskStatus]),
    );

    return tasks.map(
      (task) =>
        ({
          id: task.id,
          name: task.name,
          status: (userTaskMap.get(task.id) || "notStarted") satisfies TaskStatus,
          reward: task.reward,
          imageUrl: task.imageUrl || "",
          taskData: task.data as TaskData,
        }) satisfies FrontendTask,
    );
  }),

  getTasksStatuses: procedure
    .input(
      z.object({
        tasksIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
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

      // Check if we found all requested tasks
      if (userTasks.length !== input.tasksIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some tasks not found",
        });
      }

      // Map tasks to required format
      return userTasks.map((task) => ({
        taskId: task.taskId,
        status: task.status,
      }));
    }),

  startVerification: procedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, input.taskId))
        .then((rows) => rows[0]);

      if (!task) {
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

      console.log("existingTask", existingTask);

      if (existingTask.length === 0) {
        // create new task as checking in users table
        await db.insert(userTasksTable).values({
          userId: ctx.userId,
          taskId: input.taskId,
          status: "checking",
        });

        console.log("new task created");
      } else {
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
      }

      return {
        id: input.taskId,
        status: "checking" as TaskStatus,
      };
    }),

  startTask: procedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, input.taskId))
        .then((rows) => rows[0]);

      if (!task) {
        throw new Error("Task not found");
      }

      await db.insert(userTasksTable).values({
        userId: ctx.userId,
        taskId: input.taskId,
        status: "started",
      });
    }),
};
