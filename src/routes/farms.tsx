import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BackButton } from "~/components/BackButton";
import { FarmList } from "~/components/FarmList";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { TelegramStar } from "~/components/icons/TelegramStar";
import { useUpgradeForStars } from "~/hooks/useUpgradeForStars";
import { getNextFarmLevel } from "~/lib/dm-farm.config";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/farms")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { upgradeForStars } = useUpgradeForStars();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const dmFarmLevel = user?.dmFarmLevel;
  const nextFarmLevel = getNextFarmLevel(dmFarmLevel ?? 1);

  const webApp = window.Telegram?.WebApp;

  console.log(webApp);

  return (
    <div className="flex w-full flex-col px-4 pt-12 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />

      <div className="font-manrope mb-[48px] flex items-center justify-center text-2xl font-semibold text-white">
        Ферма
      </div>
      <div className="absolute top-[100px] left-1/2 flex h-[54px] w-[54px] -translate-x-1/2 items-center justify-center rounded-full border border-[#76AD10] bg-black text-3xl">
        💎
      </div>
      <div className="mb-[15px] flex h-[145px] w-[full] flex-col items-center justify-center gap-3 rounded-4xl border border-[#575757] bg-[#2A2A2A] pt-8">
        <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
          <div>Лунная ферма</div>
          <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
            💎 Доходность: {nextFarmLevel?.incomePerHour}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 pb-4">
          <button className="full flex items-center justify-center rounded-full bg-[#76AD10] px-3 py-2">
            💎 {nextFarmLevel?.priceInStars}
          </button>
          <button
            onClick={() => upgradeForStars.mutate()}
            disabled={upgradeForStars.isPending}
            className="full flex items-center justify-center gap-1 rounded-full bg-[#76AD10] px-3 py-2"
          >
            <TelegramStar /> {nextFarmLevel?.priceInTgStars}
          </button>
        </div>
      </div>

      <div className="font-manrope mb-[20px] text-base font-semibold">
        Покупай фермы и получай токены
      </div>
      <FarmList />
      <div className="font-manrope px fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448]">
            <Farm />
            <div className="font-manrope text-xs font-medium">Ферма</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="flex w-[105px] flex-col items-center justify-center gap-1"
            onClick={() => navigate({ to: "/" })}
          >
            <Main />
            <div className="font-manrope text-xs font-medium">Главная</div>
          </div>
        </div>
        <div
          className="flex w-[105px] flex-col items-center justify-center gap-1"
          onClick={() => navigate({ to: "/wallet" })}
        >
          <Wallet />
          <div className="font-manrope text-xs font-medium">Кошелек</div>
        </div>
      </div>
    </div>
  );
}
