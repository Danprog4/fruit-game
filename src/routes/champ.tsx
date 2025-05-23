import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AlliancesList } from "~/components/AlliancesList";
import { BackButton } from "~/components/BackButton";
import { ChampIcon } from "~/components/icons/ChampIcon";
import { TasksIcon } from "~/components/icons/Tasks";
import { Token } from "~/components/icons/Token";
import { useT } from "~/i18n";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/champ")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: season } = useQuery(trpc.alliances.getSeason.queryOptions());

  const timeRemaining =
    (season && season?.seasonEnd.getTime() - Date.now()) || 30 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  const t = useT();

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-12 pb-20 text-white">
      <div className="absolute top-4 left-4">
        <ArrowLeft onClick={() => navigate({ to: "/" })} />
      </div>
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="ml-1">
          <ChampIcon width={90} height={80} />
        </div>
        <div className="font-manrope mb-4 text-2xl font-semibold text-white">
          {t("Championship")}
        </div>
        <div className="flex items-center gap-3">
          <div className="font-manrope text-base leading-none font-semibold">
            {t("Prize pool")}
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
            <div className="font-manrope text-xs font-medium">{t("1st place")}</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 300.000
            </div>
          </div>
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">{t("2nd place")}</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 250.000
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">{t("3rd place")}</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 150.000
            </div>
          </div>
          <div className="flex h-[42px] w-[167px] items-center justify-between rounded-full bg-[#F7FFEB0F] px-4">
            <div className="font-manrope text-xs font-medium">{t("4-5th place")}</div>
            <div className="font-manrope flex items-center gap-1 text-xs font-medium">
              <Token width={16} height={16} viewBox="0 0 30 30" /> 50.000
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10] pb-1">
            <TasksIcon width={24} height={24} />
          </div>
          <div className="font-manrope text-base font-semibold">
            {t("Top 10 alliances")}
          </div>
        </div>
        <div className="font-manrope text-xs font-medium">
          {t("Remaining")} {daysRemaining} {t("d.")} {hoursRemaining} {t("h.")}
        </div>
      </div>

      <AlliancesList limit={10} />
    </div>
  );
}
