import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useEffect } from "react";
import { BackButton } from "~/components/BackButton";
import { ArrowUp } from "~/components/icons/ArrowUp";
import { Dollar } from "~/components/icons/Dollar";
import { GreenDollar } from "~/components/icons/GreenDollar";
import { Token } from "~/components/icons/Token";
import { Wallet } from "~/components/icons/Wallet";

export const Route = createFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  const wallet = useTonWallet();
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const navigate = useNavigate();

  useEffect(() => {
    if (tonConnectUI) {
      console.log("Setting TonConnect UI language to Russian");
      setOptions({ language: "ru" });
    }
  }, [tonConnectUI, setOptions]);

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-[100px] pb-20 text-white">
      <BackButton onClick={() => window.history.back()} />
      <div className="flex w-full items-center justify-between">
        <div className="w-full">
          <div className="flex h-[76px] w-full items-center justify-start gap-[20px] rounded-full bg-[#343D24] p-[14px]">
            <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]">
              <Wallet />
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

          <div className="mt-[15px] mb-[37px] flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#75A818] bg-[#343D24] p-[14px]">
            <div className="flex items-center gap-[20px]">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
                <Token width={30} height={34} viewBox="0 0 30 30" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="font-manrope text-base font-semibold">FRU</div>
                <div className="font-manrope text-xs font-medium text-[#93A179]">
                  8.00000.00 SPR
                </div>
              </div>
            </div>
            <div className="font-manrope pr-4 text-lg font-semibold">8.30$</div>
          </div>
          <div className="mx-auto mb-[32px] w-[80%] border-3 border-b border-[#75A818]"></div>
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
          <div className="mb-[15px] flex items-center justify-center gap-[14px]">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10]">
              <GreenDollar />
            </div>
            <div>Баланс фруктов</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[15px]">
        <div className="flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#575757] bg-[#2A2A2A] p-[14px]">
          <div className="flex items-center gap-[20px]">
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
              <Token width={30} height={34} viewBox="0 0 30 30" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="font-manrope text-base font-semibold">FRU</div>
              <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                8.00000.00 SPR
              </div>
            </div>
          </div>
          <div className="font-manrope pr-4 text-lg font-semibold">8.30$</div>
        </div>
        <div className="flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#575757] bg-[#2A2A2A] p-[14px]">
          <div className="flex items-center gap-[20px]">
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
              <Token width={30} height={34} viewBox="0 0 30 30" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="font-manrope text-base font-semibold">FRU</div>
              <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                8.00000.00 SPR
              </div>
            </div>
          </div>
          <div className="font-manrope pr-4 text-lg font-semibold">8.30$</div>
        </div>
        <div className="flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#575757] bg-[#2A2A2A] p-[14px]">
          <div className="flex items-center gap-[20px]">
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
              <Token width={30} height={34} viewBox="0 0 30 30" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="font-manrope text-base font-semibold">FRU</div>
              <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                8.00000.00 SPR
              </div>
            </div>
          </div>
          <div className="font-manrope pr-4 text-lg font-semibold">8.30$</div>
        </div>
      </div>
    </div>
  );
}
