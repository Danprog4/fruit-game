import { useTasks } from "~/hooks/useTasks";

import { openTelegramLink } from "@telegram-apps/sdk-react";
import { CircleCheck as CheckIcon, Loader2 as Spinner } from "lucide-react";
import { createContext, use, useCallback, useMemo, useState } from "react";
import { FrontendTask, TaskStatus } from "~/lib/db/schema";

type TaskStatusContextType = {
  statuses: Record<number, TaskStatus>;
  updateStatus: (taskId: number, status: TaskStatus) => void;
};

const TaskStatusContext = createContext<TaskStatusContextType | undefined>(undefined);

const useTaskStatus = () => {
  const context = use(TaskStatusContext);
  if (!context) {
    throw new Error("useTaskStatus must be used within a TaskStatusProvider");
  }
  return context;
};

export const TasksList = () => {
  const { tasks } = useTasks();

  const initialStatuses =
    tasks?.reduce<Record<number, TaskStatus>>((acc, task) => {
      acc[task.id] = task.status;
      return acc;
    }, {}) || {};

  const [statuses, setStatuses] = useState<Record<number, TaskStatus>>(initialStatuses);

  const updateStatus = useCallback(
    (taskId: number, status: TaskStatus) => {
      setStatuses((prev) => ({
        ...prev,
        [taskId]: status,
      }));
    },
    [setStatuses],
  );

  const onGo = (task: FrontendTask) => {
    if (statuses[task.id] === "completed") {
      return;
    }

    if (!task.taskData) {
      return;
    }

    const channelName =
      task.taskData?.type === "telegram" ? task.taskData.data.channelName : null;

    if (channelName) {
      openTelegramLink(`https://t.me/${channelName}`);
    }

    updateStatus(task.id, "started");
  };

  const value = useMemo(() => ({ statuses, updateStatus }), [statuses, updateStatus]);

  return (
    <TaskStatusContext value={value}>
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

              {statuses[task.id] === "notStarted" ? (
                <StartTaskButton onGo={() => onGo(task)} />
              ) : (
                <TaskStatusBlock id={task.id} status={statuses[task.id]} />
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
    </TaskStatusContext>
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
  const { updateStatus } = useTaskStatus();

  const onClick = () => {
    try {
      startVerification({ taskId: id });
      updateStatus(id, "checking");
    } catch {
      // If verification fails, we don't need to do anything
      // as the status wasn't updated in the context
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
