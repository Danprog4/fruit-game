import { useQueryClient } from "@tanstack/react-query";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { CircleCheck as CheckIcon, Loader2 as Spinner } from "lucide-react";
import { useTasks, useTaskStatusPolling } from "~/hooks/useTasks";
import { FrontendTask, TaskStatus } from "~/lib/db/schema";
import { useTRPC } from "~/trpc/init/react";

export const TasksList = () => {
  const trpc = useTRPC();
  const { tasks } = useTasks();
  const queryClient = useQueryClient();

  // Add polling hook to monitor server updates
  useTaskStatusPolling();

  const onGo = (task: FrontendTask) => {
    if (task.status === "completed") {
      console.log(`Task ${task.id} is already completed, ignoring click`);
      return;
    }

    if (!task.taskData) {
      console.log(`Task ${task.id} has no task data, ignoring click`);
      return;
    }

    // Optimistically update status to "started"
    queryClient.setQueryData(trpc.tasks.getTasks.queryKey(), (oldTasks) => {
      if (!oldTasks) return oldTasks;
      return oldTasks.map((t) => (t.id === task.id ? { ...t, status: "started" } : t));
    });

    const channelName =
      task.taskData?.type === "telegram" ? task.taskData.data.channelName : null;
    if (channelName) {
      console.log(`Opening Telegram channel: ${channelName}`);
      openTelegramLink(`https://t.me/${channelName}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {tasks?.map((task) => (
          <button
            onClick={() => onGo(task)}
            key={task.id}
            className="flex h-20 items-center justify-between rounded-2xl px-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 border border-white/10">
                {task.imageUrl && (
                  <img className="size-full object-cover" src={task.imageUrl} />
                )}
              </div>

              <div className="flex flex-col gap-2 *:leading-none">
                <div>{task.name}</div>
                <div>{task.reward} FRU</div>
              </div>
            </div>

            {task.status === "notStarted" ? (
              <StartTaskButton onGo={() => onGo(task)} />
            ) : (
              <TaskStatusBlock id={task.id} status={task.status} />
            )}
          </button>
        ))}

        {tasks?.length === 0 && (
          <div className="text-muted-foreground flex h-16 items-center justify-center text-sm">
            No tasks available
          </div>
        )}
      </div>
    </div>
  );
};

const StartTaskButton = ({ onGo }: { onGo: () => void }) => {
  return (
    <button
      onClick={onGo}
      className="bg-primary text-primary-foreground h-fit rounded-xl px-4 py-2"
    >
      Start
    </button>
  );
};

const CheckButton = ({ id }: { id: number }) => {
  const { startVerification } = useTasks();
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const onClick = () => {
    console.log(`Check button clicked for task ${id}`);
    // Optimistically set status to "checking"
    queryClient.setQueryData(trpc.tasks.getTasks.queryKey(), (oldTasks) => {
      if (!oldTasks) return oldTasks;
      return oldTasks.map((t) => (t.id === id ? { ...t, status: "checking" } : t));
    });
    // Start server verification
    startVerification({ taskId: id }).catch((error) =>
      console.error(`Verification failed for task ${id}:`, error),
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className="bg-primary text-primary-foreground h-fit rounded-xl px-4 py-2"
      >
        Check
      </button>
    </div>
  );
};

const CompletedTask = () => {
  console.log("Rendering completed task UI");
  return (
    <button className="flex h-9 w-14 items-center justify-center rounded-xl border border-white/10 p-2 text-white opacity-80">
      <CheckIcon className="size-4" />
    </button>
  );
};

const TaskStatusBlock = ({ id, status }: { id: number; status: TaskStatus }) => {
  console.log(`Rendering status block for task ${id} with status: ${status}`);

  if (status === "started") {
    console.log(`Task ${id} is started, showing check button`);
    return <CheckButton id={id} />;
  }

  if (status === "checking") {
    console.log(`Task ${id} is checking, showing spinner`);
    return (
      <button className="flex h-9 w-14 items-center justify-end rounded-xl p-2 text-white opacity-80">
        <Spinner className="size-4" />
      </button>
    );
  }

  if (status === "completed") {
    console.log(`Task ${id} is completed, showing completed UI`);
    return <CompletedTask />;
  }

  // Note: "failed" is handled by polling setting it to "notStarted", so no case needed here
  return null;
};
