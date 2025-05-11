import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "~/components/BackButton";
import { Flag } from "~/components/icons/Flag";
import { TasksIcon } from "~/components/icons/Tasks";
import { Input } from "~/components/Input";
import { TasksList } from "~/components/Tasks";

export const Route = createFileRoute("/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  return (
    <div className="flex w-full flex-col px-4 pt-12">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="ml-1">
          <TasksIcon width={90} height={80} />
        </div>
        <div className="font-manrope text-2xl font-semibold text-white">Квесты</div>
      </div>
      <Input
        placeholder="Искать"
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        icon={<Flag />}
      />
      <div className="mb-[20px] flex items-center gap-[10px] pt-8">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10]">
          <TasksIcon width={26} height={26} />
        </div>
        <div className="font-manrope text-base font-semibold text-white">
          Список квестов
        </div>
      </div>
      <div className="flex h-[100px] w-full items-center justify-center rounded-xl bg-[#F7FFEB0F] text-center">
        <div className="font-manrope text-sm text-white opacity-50">
          К сожалению, квестов пока нет
        </div>
      </div>

      <TasksList />
    </div>
  );
}
