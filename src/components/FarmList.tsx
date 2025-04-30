import { useMutation, useQuery } from "@tanstack/react-query";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { toast } from "sonner";
import { Farm, FARMS_CONFIG } from "~/lib/farms.config";
import { usePrepareJettonTx } from "~/lib/web3/usePrepareTx";
import { useTRPC } from "~/trpc/init/react";

export const FarmList = () => {
  const trpc = useTRPC();

  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { getJettonTx } = usePrepareJettonTx();

  const buyFarm = useMutation(
    trpc.farms.buyFarm.mutationOptions({
      onSuccess: async (memo, variables) => {
        const farm = FARMS_CONFIG.find((f) => f.id === variables.farmId);

        if (!farm) {
          throw new Error("Farm not found");
        }

        const jettonTx = await getJettonTx(farm.priceInFRU, memo);

        if (!jettonTx) {
          throw new Error("Jetton transaction not found");
        }

        await tonConnectUI.sendTransaction(jettonTx);

        toast.success(`Транзакция отправлена, ждите бро`);
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("К сожалению, у вас недостаточно FRU для покупки фермы");
      },
    }),
  );

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const userFarms = user?.farms as Record<string, number> | undefined;

  const handleBuyFarm = (farm: Farm) => {
    if (!address) {
      toast.error("Подключите ваш TON-кошелек");
      return;
    }

    if (!farm.enabled) {
      toast.error("К сожалению, ферма пока недоступна");
      return;
    }

    buyFarm.mutate({ farmId: farm.id });
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {FARMS_CONFIG.map((farm) => (
        <div
          key={farm.id}
          className={`flex h-[76px] w-full items-center rounded-full border border-[#575757] bg-[#2A2A2A] px-3 pr-[20px] ${!farm.enabled ? "" : ""}`}
        >
          <div className="relative mr-5 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#76AD10] bg-[#2A2A2A]">
            <div className="text-2xl">{farm.icon}</div>
            {userFarms && userFarms[farm.id] && (
              <div className="absolute -right-1 -bottom-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#76AD10] text-xs font-bold text-white">
                {userFarms[farm.id]}
              </div>
            )}
          </div>
          <div className="mr-auto flex w-[116px] flex-col items-start justify-center gap-2">
            <div className="font-manrope text-xs font-medium">{farm.name} ферма</div>
            <div className="font-manrope text-xs font-medium text-nowrap text-[#8F8F8F]">
              {userFarms && userFarms[farm.id]
                ? `${(farm.miningRate * userFarms[farm.id]).toFixed(2)} ${farm.tokenName}/час`
                : "Купите первую ферму!"}{" "}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleBuyFarm(farm)}
            disabled={buyFarm.isPending && buyFarm.variables?.farmId === farm.id}
            className={`font-manrope flex h-[36px] w-[92px] items-center justify-center rounded-full text-nowrap disabled:opacity-50 ${farm.enabled ? "bg-[#76AD10]" : "bg-[#4A4A4A]"} px-4 text-xs font-medium text-white`}
          >
            {farm.enabled ? `${farm.priceInFRU.toLocaleString()} FRU` : "Недоступно"}
          </button>
        </div>
      ))}
    </div>
  );
};
