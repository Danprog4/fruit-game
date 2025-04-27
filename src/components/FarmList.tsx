import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FARMS_CONFIG } from "farms.config";
import { useTRPC } from "~/trpc/init/react";

export const FarmList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const buyFarm = useMutation(
    trpc.farms.buyFarm.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        console.log("success");
      },
      onError: () => {
        console.log("error");
      },
    }),
  );
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const userFarms = user?.farms as Record<string, number> | undefined;

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
          <div
            onClick={() => buyFarm.mutate({ farmId: farm.id })}
            className={`font-manrope flex h-[36px] w-[92px] items-center justify-center rounded-full text-nowrap ${farm.enabled ? "bg-[#76AD10]" : "bg-[#4A4A4A]"} px-4 text-xs font-medium text-white`}
          >
            {farm.enabled ? `${farm.priceInFRU.toLocaleString()} FRU` : "Недоступно"}
          </div>
        </div>
      ))}
    </div>
  );
};
