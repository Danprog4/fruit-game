import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { FarmList } from "~/components/FarmList";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { TelegramStar } from "~/components/icons/TelegramStar";
import { useUpgradeForStars } from "~/hooks/useUpgradeForStars";
import { getFarmLevelByLevel, getNextFarmLevel } from "~/lib/dm-farm.config";
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
  const farmLevel = getFarmLevelByLevel(dmFarmLevel ?? 1);
  const webApp = window.Telegram?.WebApp;
  const buyDmFarm = useMutation(
    trpc.farms.buyDmFarm.mutationOptions({
      onSuccess: () => {
        toast.success("Вы успешно прокачали ферму");
        queryClient.invalidateQueries({
          queryKey: trpc.main.getUser.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`К сожалению, у вас недостаточно алмазов для прокачки фермы`);
      },
    }),
  );

  console.log(webApp);
  console.log(user);
  if (farmLevel) {
    const incomePerHour = farmLevel.incomePerHour;
    const incomePerSecond = incomePerHour / 3600;
    const dmIncome = incomePerSecond * 1;
    console.log(dmIncome, "dmIncome");
    console.log(user?.starBalance, "starBalance");
    console.log(1, "elapsedSeconds");
    console.log(incomePerHour, "incomePerHour");
    console.log(incomePerSecond, "incomePerSecond");
  }

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
          <div>Алмазная ферма</div>
          <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
            Доходность: {nextFarmLevel?.incomePerHour} 💎/час
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 pb-4">
          <button
            className="full flex min-w-[90px] items-center justify-center rounded-full bg-[#76AD10] px-3 py-2"
            onClick={() => buyDmFarm.mutate()}
            disabled={buyDmFarm.isPending}
          >
            {buyDmFarm.isPending ? (
              <div className="animate-spin">
                <Loader2 />
              </div>
            ) : (
              <>💎 {nextFarmLevel?.priceInStars}</>
            )}
          </button>
          <button
            onClick={() => upgradeForStars.mutate()}
            disabled={upgradeForStars.isPending}
            className="full flex min-w-[90px] items-center justify-center gap-1 rounded-full bg-[#76AD10] px-3 py-2"
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
