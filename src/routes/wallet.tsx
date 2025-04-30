import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { FARMS_CONFIG } from "farms.config";
import { useEffect, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { ArrowUp } from "~/components/icons/ArrowUp";
import { Dollar } from "~/components/icons/Dollar";
import { GreenDollar } from "~/components/icons/GreenDollar";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { Refresh } from "~/components/icons/Refresh";
import { Token } from "~/components/icons/Token";
import { Wallet as WalletIcon } from "~/components/icons/Wallet";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  const wallet = useTonWallet();
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWalletPage, setIsWalletPage] = useState(true);

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());

  const invalidateBalances = useMutation(
    trpc.main.invalidateBalances.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });

        console.log("Balances invalidated");
        console.log(user?.balances);
        console.log(user?.lastUpdatedBalanceAt);

        // Stop the refresh animation after a short delay
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      },
      onError: (error) => {
        console.error("Error invalidating balances:", error);
        setIsRefreshing(false);
      },
    }),
  );

  useEffect(() => {
    invalidateBalances.mutate();
  }, []);

  const refreshBalances = () => {
    setIsRefreshing(true);
    invalidateBalances.mutate();
  };

  useEffect(() => {
    if (tonConnectUI) {
      console.log("Setting TonConnect UI language to Russian");
      setOptions({ language: "ru" });
    }
  }, [tonConnectUI, setOptions]);

  // Get user balances from the user data
  const balances = user?.balances as Record<string, number> | undefined;

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-12 pb-28 text-white">
      <BackButton onClick={() => window.history.back()} />

      <div className="flex w-full items-center justify-between">
        <div className="w-full">
          <div className="relative mx-auto mb-4 flex h-[65px] w-[70vw] items-center justify-between rounded-full bg-[#7AB019] p-4">
            <div
              className="absolute z-0 h-[45px] rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448] transition-all duration-300"
              style={{
                width: "45%",
                left: isWalletPage ? "5%" : "50%",
              }}
            />
            <div
              className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 p-2 transition-all duration-300`}
              onClick={() => setIsWalletPage(true)}
            >
              <Wallet />
              <div>Кошелек</div>
            </div>
            <div
              className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 p-2 transition-all duration-300`}
              onClick={() => setIsWalletPage(false)}
            >
              <Farm />
              <div>Ферма</div>
            </div>
          </div>
          {isWalletPage && (
            <>
              <div className="flex h-[76px] w-full items-center justify-start gap-[20px] rounded-full bg-[#343D24] p-[14px]">
                <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]">
                  <WalletIcon />
                  <div className="absolute inset-0 opacity-0">
                    <TonConnectButton className="h-[54px] w-[54px]" />
                  </div>
                  {!wallet && (
                    <div className="absolute right-[1px] -bottom-[1px] flex h-4 w-4 items-center justify-center rounded-sm bg-white shadow-sm">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 1V7M1 4H7"
                          stroke="#85BF1A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="font-manrope text-base font-semibold">
                    {wallet ? "Подключено" : "Подключить кошелек"}
                  </div>
                  <div className="font-manrope text-xs font-medium text-[#93A179]">
                    {wallet ? wallet.account.address.slice(0, 12) + "..." : "TON Connect"}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="mt-[15px] mb-[37px] flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#75A818] bg-[#343D24] p-[14px]">
            <div className="flex items-center gap-[20px]">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
                <Token width={30} height={34} viewBox="0 0 30 30" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="font-manrope text-base font-semibold">FRU</div>
                <div className="font-manrope text-xs font-medium text-[#93A179]">
                  {user?.tokenBalance?.toLocaleString() || "0"} FRU
                </div>
              </div>
            </div>
            <div className="font-manrope pr-4 text-lg font-semibold">8.30$</div>
          </div>
          {/* <div className="mx-auto mb-[32px] w-[80%] border-3 border-b border-[#75A818]"></div> */}
          {!isWalletPage && (
            <div className="mb-[35px] flex items-center justify-center gap-[23px]">
              <div className="flex h-[76px] w-full items-center justify-start rounded-full bg-[#2A2A2A] pl-[13px]">
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => navigate({ to: "/exchange" })}
                    className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#404040]"
                  >
                    <Dollar />
                  </div>
                  <div>Обмен</div>
                </div>
              </div>
              <div className="flex h-[76px] w-full items-center justify-start rounded-full bg-[#2A2A2A] pl-[13px]">
                <div className="flex items-center justify-start gap-4">
                  <div
                    onClick={() => navigate({ to: "/withdrawal" })}
                    className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#404040]"
                  >
                    <ArrowUp />
                  </div>
                  <div>Вывод</div>
                </div>
              </div>
            </div>
          )}

          {!isWalletPage && (
            <div className="mb-[15px] flex items-center justify-center gap-[14px]">
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10]">
                <GreenDollar />
              </div>
              <div>Баланс фруктов</div>
              <div
                onClick={refreshBalances}
                className={`cursor-pointer ${isRefreshing ? "animate-spin" : ""}`}
                style={{ animationDuration: isRefreshing ? "0.5s" : "0s" }}
              >
                <Refresh />
              </div>
            </div>
          )}
        </div>
      </div>
      {!isWalletPage && (
        <div className="flex flex-col gap-[15px]">
          {balances && Object.keys(balances).length > 0 ? (
            FARMS_CONFIG.filter((farm) => balances[farm.id] !== undefined).map((farm) => (
              <div
                key={farm.id}
                className="flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#575757] bg-[#2A2A2A] p-[14px]"
              >
                <div className="flex items-center gap-[20px]">
                  <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
                    <div className="text-2xl">{farm.icon}</div>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="font-manrope text-base font-semibold">
                      {farm.id.charAt(0).toUpperCase() + farm.id.slice(1)}
                    </div>
                    <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                      {balances[farm.id]?.toFixed(2) || "0"} {farm.tokenName}
                    </div>
                  </div>
                </div>
                <div className="font-manrope pr-4 text-lg font-semibold">
                  {farm.rateFru
                    ? `${(balances[farm.id] / farm.rateFru / 1).toFixed(2)}$`
                    : "0$"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">Нет доступных фруктов</div>
          )}
        </div>
      )}
      <div className="font-manrope px fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="flex w-[105px] flex-col items-center justify-center gap-1"
            onClick={() => navigate({ to: "/farms" })}
          >
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
        <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448]">
          <Wallet />
          <div className="font-manrope text-xs font-medium">Кошелек</div>
        </div>
      </div>
    </div>
  );
}
