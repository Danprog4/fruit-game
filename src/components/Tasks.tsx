import { useTasks } from "~/hooks/useTasks";

import { useQueryClient } from "@tanstack/react-query";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { CircleCheck as CheckIcon, Loader2 as Spinner } from "lucide-react";
import { FrontendTask, TaskStatus } from "~/lib/db/schema";
import { useTRPC } from "~/trpc/init/react";

export const TasksList = () => {
  const trpc = useTRPC();
  const { tasks } = useTasks();
  const queryClient = useQueryClient();
  const { startTask } = useTasks();

  const onGo = (task: FrontendTask) => {
    if (task.status === "completed") {
      return;
    }

    if (!task.taskData) {
      console.log("no task data", task);
      return;
    }

    const channelName =
      task.taskData?.type === "telegram" ? task.taskData.data.channelName : null;

    console.log("channelName", channelName);

    startTask
      .mutateAsync({ taskId: task.id })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: trpc.tasks.getTasks.queryKey() }),
      );

    if (channelName) {
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
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const old = queryClient.getQueryData(trpc.tasks.getTasks.queryKey());

    try {
      startVerification({ taskId: id });
      queryClient.setQueryData(trpc.tasks.getTasks.queryKey(), (oldTasks) => {
        if (!oldTasks) return oldTasks;

        return oldTasks.map((t) =>
          t.id === id ? { ...t, status: "checking" as TaskStatus } : t,
        );
      });
    } catch {
      queryClient.setQueryData(trpc.tasks.getTasks.queryKey(), old);
    }
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
  return (
    <button className="flex h-9 w-14 items-center justify-center rounded-xl border border-white/10 p-2 text-white opacity-80">
      <CheckIcon className="size-4" />
    </button>
  );
};

const TaskStatusBlock = ({ id, status }: { id: number; status: TaskStatus }) => {
  if (status === "started") {
    return <CheckButton id={id} />;
  }

  if (status === "checking") {
    return (
      <button className="flex h-9 w-14 items-center justify-end rounded-xl p-2 text-white opacity-80">
        <Spinner className="size-4" />
      </button>
    );
  }

  if (status === "failed") {
    return <CheckButton id={id} />;
  }

  if (status === "completed") {
    return <CompletedTask />;
  }

  return null;
};
