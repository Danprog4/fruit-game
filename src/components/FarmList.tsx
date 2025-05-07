import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useState } from "react";

import { toast } from "sonner";
import { Drawer } from "vaul";
import { Farm, FARMS_CONFIG } from "~/lib/farms.config";
import { usePrepareJettonTx } from "~/lib/web3/usePrepareTx";
import { useTRPC } from "~/trpc/init/react";

export const FarmList = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const trpc = useTRPC();
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { getJettonTx } = usePrepareJettonTx();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const checkAndUpdatePaymentStatus = useMutation(
    trpc.farms.checkAndUpdatePaymentStatus.mutationOptions(),
  );
  const cancelPayment = useMutation(trpc.farms.cancelPayment.mutationOptions());

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

        try {
          await tonConnectUI.sendTransaction(jettonTx);
          setSelectedFarm(null);
          toast.success(
            <div>
              Транзакция отправлена!{" "}
              <a
                onClick={() => {
                  navigate({ to: "/wallet" });
                }}
                className="cursor-pointer underline"
              >
                Перейти в кошелек
              </a>
            </div>,
          );

          // Добавляем обработчик для отслеживания статуса транзакции
          const paymentId = memo.split("#")[1];
          if (paymentId) {
            // Через заданное время проверяем, завершилась ли транзакция
            setTimeout(
              async () => {
                try {
                  await checkAndUpdatePaymentStatus.mutateAsync({ paymentId });
                } catch (error) {
                  console.error("Failed to check payment status:", error);
                }
              },
              3 * 60 * 1000,
            ); // Проверяем через 3 минуты
          }
        } catch (error) {
          console.error("Transaction failed or was cancelled:", error);
          // Если пользователь отменил транзакцию, обновляем статус
          const paymentId = memo.split("#")[1];
          if (paymentId) {
            await cancelPayment.mutateAsync({ paymentId });
            toast.error("Транзакция была отменена");
          }
        }
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("Упс, что-то пошло не так. ");
      },
    }),
  );

  const buyFarmForFRU = useMutation(
    trpc.farms.buyFarmForFRU.mutationOptions({
      onSuccess: () => {
        toast.success("Вы успешно купили ферму");
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        setSelectedFarm(null);
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("К сожалению, у вас недостаточно баланса");
      },
    }),
  );

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const userFarms = user?.farms as Record<string, number> | undefined;

  const handleBuyFarm = (farm: Farm) => {
    if (!address) {
      toast.error(
        <div>
          Подключите ваш TON-кошелек
          <div
            onClick={() => {
              navigate({ to: "/wallet" });
            }}
            className="cursor-pointer underline"
          >
            Подключить
          </div>
        </div>,
      );
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
                ? `${(farm.miningRate * userFarms[farm.id]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/час`
                : "Купите первую ферму!"}{" "}
            </div>
          </div>
          <Drawer.Root open={selectedFarm?.id === farm.id}>
            <button
              type="button"
              onClick={() =>
                farm.enabled
                  ? setSelectedFarm(farm)
                  : toast.error("К сожалению, ферма пока недоступна")
              }
              className={`font-manrope flex h-[36px] w-[92px] items-center justify-center rounded-full text-nowrap disabled:opacity-50 ${farm.enabled ? "bg-[#76AD10]" : "bg-[#4A4A4A]"} px-4 text-xs font-medium text-white`}
              disabled={buyFarm.isPending && buyFarm.variables?.farmId === farm.id}
            >
              {buyFarm.isPending && buyFarm.variables?.farmId === farm.id ? (
                <span className="text-xs text-white">Ожидайте...</span>
              ) : farm.enabled ? (
                `${farm.priceInFRU.toLocaleString()} FRU`
              ) : (
                "Недоступно"
              )}
            </button>
            <Drawer.Portal>
              <Drawer.Overlay
                className="fixed inset-0 bg-black/40"
                onClick={() => setSelectedFarm(null)}
              />
              <Drawer.Content className="fixed right-0 bottom-0 left-0 flex max-h-[82vh] flex-col rounded-t-[10px] bg-[#2A2A2A]">
                <div className="mx-auto w-full max-w-md overflow-auto rounded-t-[10px] p-4 text-white">
                  <Drawer.Handle onClick={() => setSelectedFarm(null)} />
                  <Drawer.Title className="mt-4 text-xl font-medium">
                    {farm.name} ферма
                  </Drawer.Title>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-2xl">{farm.icon}</div>
                    <div className="text-[#8F8F8F]">
                      Доходность:{" "}
                      {userFarms && userFarms[farm.id]
                        ? `${(farm.miningRate * userFarms[farm.id]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} + ${farm.miningRate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/час`
                        : `${farm.miningRate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${farm.tokenName}/час`}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-[#343D24] p-4">
                    <div className="mb-2 text-sm">
                      Купите ферму и начните получать {farm.tokenName} каждый час
                    </div>
                    <div className="mb-4 text-xs text-[#8F8F8F]">
                      Собранные фрукты можно будет обменять на FRU и вывести на ваш
                      TON-кошелек
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleBuyFarm(farm)}
                        disabled={
                          buyFarm.isPending && buyFarm.variables?.farmId === farm.id
                        }
                        className="flex h-[44px] w-full items-center justify-center rounded-full bg-[#76AD10] font-medium text-white disabled:opacity-50"
                      >
                        {buyFarm.isPending && buyFarm.variables?.farmId === farm.id ? (
                          <span>Ожидайте...</span>
                        ) : (
                          `Купить за ${farm.priceInFRU} FRU (TON)`
                        )}
                      </button>

                      <button
                        onClick={() => buyFarmForFRU.mutate({ farmId: farm.id })}
                        disabled={buyFarmForFRU.isPending}
                        className="flex h-[44px] w-full items-center justify-center rounded-full bg-[#4A4A4A] font-medium text-white disabled:opacity-50"
                      >
                        {buyFarmForFRU?.isPending ? (
                          <span>Ожидайте...</span>
                        ) : (
                          `Купить за ${farm.priceInFRU} FRU (баланс)`
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
