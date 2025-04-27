import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { FarmList } from "~/components/FarmList";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { Star } from "~/components/icons/Star";

export const Route = createFileRoute("/farms")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex w-full flex-col px-4 pt-[109px] text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />

      <div className="font-manrope mb-[31px] flex items-center justify-center text-2xl font-semibold text-white">
        Ферма
      </div>
      <div className="mb-[28px] flex h-[76px] w-full items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] px-3 pr-[20px]">
        <div className="flex items-center justify-center gap-5">
          <div className="flex h-[54px] w-[54px] items-center justify-center gap-[6px] rounded-full border border-[#76AD10] bg-[#2A2A2A]">
            <Star />
          </div>
          <div className="flex flex-col items-start justify-center gap-2">
            <div className="font-manrope text-xs font-medium">Звездная ферма</div>
            <div className="flex items-center gap-1">
              <Star width={16} height={16} />
              <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                40 000
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => toast.error("К сожалению, прокачка пока недоступна")}
          className="font-manrope flex h-[36px] w-[92px] cursor-pointer items-center justify-center rounded-full bg-[#4A4A4A] px-4 text-xs font-medium text-white"
        >
          Прокачать
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
