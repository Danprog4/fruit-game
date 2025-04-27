import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AllianceList } from "~/components/AlianceList";
import { BackButton } from "~/components/BackButton";
import { ChampIcon } from "~/components/icons/ChampIcon";
import { TasksIcon } from "~/components/icons/Tasks";
import { Token } from "~/components/icons/Token";

export const Route = createFileRoute("/champ")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-[86px] pb-20 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="ml-1">
          <ChampIcon width={90} height={80} />
        </div>
        <div className="font-manrope mb-4 text-2xl font-semibold text-white">
          Чемпионат
        </div>
        <div className="flex items-center gap-3">
          <div className="font-manrope text-base leading-none font-semibold">
            Призовой фонд
          </div>
          <div className="flex h-[37px] w-[128px] items-center justify-center gap-[6px] rounded-full border border-[#76AD10] bg-[#2A2A2A]">
            <Token width={24} height={24} viewBox="0 0 30 30" />
            <div className="font-manrope text-sm font-semibold">1.000.000</div>
          </div>
        </div>
      </div>
      <div className="mt-6 mb-[27px] flex flex-col justify-center gap-4">
        <div className="flex justify-center gap-4">
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">1 место</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 300.000
            </div>
          </div>
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">2 место</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 250.000
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">3 место</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 150.000
            </div>
          </div>
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">4-5 место</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 50.000
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] flex items-center gap-2">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10] pb-1">
          <TasksIcon width={24} height={24} />
        </div>
        <div className="font-manrope text-base font-semibold">Топ 10 альясов</div>
      </div>
      <AllianceList limit={10} />
    </div>
  );
}
