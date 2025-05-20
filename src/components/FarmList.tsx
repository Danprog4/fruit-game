import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { useFarmPayment } from "~/hooks/useFarmPayment";
import { useT } from "~/i18n";
import { Farm, FARMS_CONFIG } from "~/lib/farms.config";
import { useTRPC } from "~/trpc/init/react";
import { Lock } from "./icons/Lock";
export const FarmList = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const trpc = useTRPC();
  const { buyFarmForTON, buyFarmForFRU } = useFarmPayment();

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const userFarms = user?.farms as Record<string, number> | undefined;

  const handleBuyFarmForTON = (farm: Farm) => {
    if (!farm.enabled) {
      toast.error(t("Unfortunately, the farm is not available"));
      return;
    }

    buyFarmForTON.mutate(farm.id);
  };

  const handleBuyFarmForFRU = (farm: Farm) => {
    buyFarmForFRU.mutate({ farmId: farm.id });
  };

  const t = useT();

  const isEn = user?.language === "ru" ? false : true;

  return (
    <div className="flex h-auto w-full flex-col gap-[14px] overflow-y-auto pb-32">
      {FARMS_CONFIG.map((farm) => (
        <div
          key={farm.id}
          className={`relative flex h-[76px] w-full items-center rounded-full border border-[#575757] bg-[#2A2A2A] px-3 pr-[20px] ${!farm.enabled ? "" : ""}`}
        >
          {!farm.enabled && (
            <div className="absolute top-0 right-0 left-0 z-10 flex h-[76px] w-full items-center justify-center rounded-full bg-black/40">
              <div className="font-manrope flex items-center gap-2 text-xs font-medium text-white">
                <Lock />
                {t(
                  "Will open upon capitalization in",
                )} {farm.capEnabled.toLocaleString()} FRU
              </div>
            </div>
          )}
          <div className="relative mr-5 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#76AD10] bg-[#2A2A2A]">
            <div className="text-2xl">{farm.icon}</div>
            {userFarms && userFarms[farm.id] && (
              <div className="absolute -right-1 -bottom-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#76AD10] text-xs font-bold text-white">
                {userFarms[farm.id]}
              </div>
            )}
          </div>

          <div className="mr-auto flex w-[116px] flex-col items-start justify-center gap-2">
            {farm.enabled && (
              <div className="font-manrope text-xs font-medium">
                {isEn ? farm.name : farm.rusName} {t("farm")}
              </div>
            )}
            <div className="font-manrope text-xs font-medium text-nowrap text-[#8F8F8F]">
              {userFarms && userFarms[farm.id]
                ? `${(farm.miningRate * userFarms[farm.id]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/час`
                : t("Buy the first farm!")}{" "}
            </div>
          </div>
          <Drawer.Root open={selectedFarm?.id === farm.id}>
            {farm.enabled && (
              <button
                type="button"
                onClick={() =>
                  farm.enabled
                    ? setSelectedFarm(farm)
                    : toast.error(t("Unfortunately, the farm is not available"))
                }
                className={`font-manrope flex h-[36px] w-[92px] items-center justify-center rounded-full text-nowrap disabled:opacity-50 ${farm.enabled ? "bg-[#76AD10]" : "bg-[#4A4A4A]"} px-4 text-xs font-medium text-white`}
                disabled={buyFarmForTON.isPending && buyFarmForTON.variables === farm.id}
              >
                {buyFarmForTON.isPending && buyFarmForTON.variables === farm.id ? (
                  <span className="text-xs text-white">{t("Please wait...")}</span>
                ) : farm.enabled ? (
                  `${farm.priceInFRU.toLocaleString()} FRU`
                ) : (
                  t("Not available")
                )}
              </button>
            )}
            <Drawer.Portal>
              <Drawer.Overlay
                className="fixed inset-0 bg-black/40"
                onClick={() => setSelectedFarm(null)}
              />
              <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[1000] flex max-h-[82vh] flex-col rounded-t-4xl bg-[#2A2A2A]">
                <div className="mx-auto w-full max-w-md overflow-auto rounded-t-[10px] p-4 text-white">
                  <Drawer.Handle onClick={() => setSelectedFarm(null)} />
                  <Drawer.Title className="mt-4 flex items-center justify-center gap-2 text-lg font-medium">
                    <div className="text-2xl">{farm.icon}</div>
                    {farm.name} {t("farm")}
                  </Drawer.Title>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="text-[#8F8F8F]">
                      {t("Income")}:{" "}
                      {userFarms && userFarms[farm.id]
                        ? `${(farm.miningRate * userFarms[farm.id]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} + ${farm.miningRate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/час`
                        : `${farm.miningRate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/${t("hour")}`}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-[#343D24] p-4 text-center">
                    <div className="mb-2 text-sm">
                      {t("Buy the farm and start receiving")} {farm.tokenName}{" "}
                      {t("each hour")}
                    </div>
                    <div className="mb-4 text-xs text-[#8F8F8F]">
                      {t(
                        "Collected fruits can be exchanged for FRU and withdrawn to your",
                      )}
                      TON-wallet
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleBuyFarmForTON(farm)}
                        disabled={
                          buyFarmForTON.isPending && buyFarmForTON.variables === farm.id
                        }
                        className="flex h-[44px] w-full items-center justify-center rounded-full bg-[#76AD10] text-sm font-light text-white disabled:opacity-50"
                      >
                        {buyFarmForTON.isPending &&
                        buyFarmForTON.variables === farm.id ? (
                          <span>{t("Please wait...")}</span>
                        ) : (
                          `${t("Buy for")} ${farm.priceInFRU} FRU (TON)`
                        )}
                      </button>

                      <button
                        onClick={() => handleBuyFarmForFRU(farm)}
                        disabled={
                          buyFarmForFRU.isPending &&
                          buyFarmForFRU.variables?.farmId === farm.id
                        }
                        className="font-manrope flex h-[44px] w-full items-center justify-center rounded-full bg-[#4A4A4A] text-sm font-light text-white disabled:opacity-50"
                      >
                        {buyFarmForFRU.isPending &&
                        buyFarmForFRU.variables?.farmId === farm.id ? (
                          <span>{t("Please wait...")}</span>
                        ) : (
                          `${t("Buy for")} ${farm.priceInFRU} FRU (${t("Balance")})`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      ))}
    </div>
  );
};
