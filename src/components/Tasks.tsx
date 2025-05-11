import { useTasks } from "~/hooks/useTasks";

import { openTelegramLink } from "@telegram-apps/sdk-react";
import { CircleCheck as CheckIcon, Loader2 as Spinner } from "lucide-react";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (tasks?.length) {
      console.log("Initial task statuses:", initialStatuses);
    }
  }, [tasks]);

  const updateStatus = useCallback(
    (taskId: number, status: TaskStatus) => {
      console.log(`Updating task ${taskId} status to: ${status}`);
      setStatuses((prev) => {
        const newStatuses = {
          ...prev,
          [taskId]: status,
        };
        console.log("Updated statuses:", newStatuses);
        return newStatuses;
      });
    },
    [setStatuses],
  );

  const onGo = (task: FrontendTask) => {
    console.log(`Task ${task.id} clicked, current status: ${statuses[task.id]}`);

    if (statuses[task.id] === "completed") {
      console.log(`Task ${task.id} is already completed, ignoring click`);
      return;
    }

    if (!task.taskData) {
      console.log(`Task ${task.id} has no task data, ignoring click`);
      return;
    }

    const channelName =
      task.taskData?.type === "telegram" ? task.taskData.data.channelName : null;

    if (channelName) {
      console.log(`Opening Telegram channel: ${channelName}`);
      openTelegramLink(`https://t.me/${channelName}`);
    }

    console.log(`Setting task ${task.id} status to "started"`);
    updateStatus(task.id, "started");
  };

  const value = useMemo(() => ({ statuses, updateStatus }), [statuses, updateStatus]);

  useEffect(() => {
    console.log("Current task statuses:", statuses);
  }, [statuses]);

  return (
    <TaskStatusContext.Provider value={value}>
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
    </TaskStatusContext.Provider>
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
    console.log(`Check button clicked for task ${id}`);
    try {
      console.log(`Setting task ${id} status to "checking"`);
      updateStatus(id, "checking");
      console.log(`Starting verification for task ${id}`);
      startVerification({ taskId: id });
    } catch (error) {
      console.error(`Verification failed for task ${id}:`, error);
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

  if (status === "failed") {
    console.log(`Task ${id} failed, showing check button again`);
    return <CheckButton id={id} />;
  }

  if (status === "completed") {
    console.log(`Task ${id} is completed, showing completed UI`);
    return <CompletedTask />;
  }

  console.log(`Task ${id} has unknown status: ${status}`);
  return null;
};
