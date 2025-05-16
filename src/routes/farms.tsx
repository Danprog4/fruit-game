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
import { useT } from "~/i18n";
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
  const diamondBalance = user?.starBalance?.toString() || "0";

  const buyDmFarm = useMutation(
    trpc.farms.buyDmFarm.mutationOptions({
      onSuccess: () => {
        toast.success(t("You have successfully upgraded the farm"));
        queryClient.invalidateQueries({
          queryKey: trpc.main.getUser.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(
          t("Unfortunately, you do not have enough diamonds to upgrade the farm"),
        );
      },
    }),
  );

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
  const t = useT();

  return (
    <div className="flex w-full flex-col px-4 pt-12 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />

      <div className="font-manrope mb-[48px] flex items-center justify-center text-3xl font-extrabold text-white">
        💎 {diamondBalance}
      </div>
      <div className="absolute top-[100px] left-1/2 flex h-[54px] w-[54px] -translate-x-1/2 items-center justify-center rounded-full border border-[#76AD10] bg-black text-3xl">
        💎
      </div>
      <div className="mb-[15px] flex h-[145px] w-[full] flex-col items-center justify-center gap-3 rounded-4xl border border-[#575757] bg-[#2A2A2A] pt-8">
        <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
          <div>{t("Diamond farm")}</div>
          <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
            {t("Income")}:{" "}
            {nextFarmLevel?.incomePerHour
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
            💎/{t("hour")}
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
              <>
                💎{" "}
                {nextFarmLevel?.priceInStars
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
              </>
            )}
          </button>
          <button
            onClick={() => upgradeForStars.mutate()}
            disabled={upgradeForStars.isPending}
            className="full flex min-w-[90px] items-center justify-center gap-1 rounded-full bg-[#76AD10] px-3 py-2"
          >
            <TelegramStar />{" "}
            {nextFarmLevel?.priceInTgStars
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
          </button>
        </div>
      </div>

      <div className="font-manrope mb-[20px] text-base font-semibold">
        {t("Buy farms and get tokens")}
      </div>
      <FarmList />
      <div className="font-manrope px fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448]">
            <Farm />
            <div className="font-manrope text-xs font-medium">{t("Farm")}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="flex w-[105px] flex-col items-center justify-center gap-1"
            onClick={() => navigate({ to: "/" })}
          >
            <Main />
            <div className="font-manrope text-xs font-medium">{t("Main")}</div>
          </div>
        </div>
        <div
          className="flex w-[105px] flex-col items-center justify-center gap-1"
          onClick={() => navigate({ to: "/wallet" })}
        >
          <Wallet />
          <div className="font-manrope text-xs font-medium">{t("Wallet")}</div>
        </div>
      </div>
    </div>
  );
}
