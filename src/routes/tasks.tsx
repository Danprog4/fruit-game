import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "~/components/BackButton";
import { Flag } from "~/components/icons/Flag";
import { TasksIcon } from "~/components/icons/Tasks";
import { Input } from "~/components/Input";
import { TasksList } from "~/components/Tasks";
import { useT } from "~/i18n";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: tasks } = useQuery(trpc.tasks.getTasks.queryOptions());
  const t = useT();
  return (
    <div className="flex w-full flex-col px-4 pt-12">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="ml-1">
          <TasksIcon width={90} height={80} />
        </div>
        <div className="font-manrope text-2xl font-semibold text-white">
          {t("Quests")}
        </div>
      </div>
      <Input
        placeholder={t("Search")}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        icon={<Flag />}
      />
      <div className="mb-[20px] flex items-center gap-[10px] pt-8">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10]">
          <TasksIcon width={26} height={26} />
        </div>
        <div className="font-manrope text-base font-semibold text-white">
          {t("Quests list")}
        </div>
      </div>
      {tasks?.length === 0 ? (
        <div className="flex h-[100px] w-full items-center justify-center rounded-xl bg-[#F7FFEB0F] text-center">
          <div className="font-manrope text-sm text-white opacity-50">
            {t("No quests yet")}
          </div>
        </div>
      ) : (
        <TasksList />
      )}
    </div>
  );
}
