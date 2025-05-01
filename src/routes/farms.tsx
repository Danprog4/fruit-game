import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { FarmList } from "~/components/FarmList";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { TelegramStar } from "~/components/icons/TelegramStar";
import { useUpgradeForStars } from "~/hooks/useUpgradeForStars";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/farms")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { upgradeForStars } = useUpgradeForStars();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("invoiceClosed", (payment) => {
        if (payment.status === "paid") {
          queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        } else if (payment.status === "cancelled" || payment.status === "failed") {
          toast.error("Платеж не удался, попробуйте снова", { id: "payment-failed" });
        }
      });
    }
  }, [queryClient, trpc.main.getUser]);
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
            💎 Доходность: 0
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 pb-4">
          <button className="full flex items-center justify-center rounded-full bg-[#76AD10] px-3 py-2">
            💎 100 алмазов
          </button>
          <button
            onClick={() => upgradeForStars.mutate()}
            disabled={upgradeForStars.isPending}
            className="full flex items-center justify-center gap-1 rounded-full bg-[#76AD10] px-3 py-2"
          >
            <TelegramStar /> 1 звезда
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
