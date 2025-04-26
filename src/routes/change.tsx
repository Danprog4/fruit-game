import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "~/components/BackButton";
import { Swap } from "~/components/icons/Swap";
import { Token } from "~/components/icons/Token";
import { Graphic } from "~/components/images/Graphic";
export const Route = createFileRoute("/change")({
  component: RouteComponent,
});

function RouteComponent() {
  const [swapped, setSwapped] = useState(false);

  const handleSwap = () => {
    setSwapped(!swapped);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-[110px] text-white">
      <BackButton onClick={() => window.history.back()} />
      <div className="font-manrope mx-auto mb-[33px] text-center text-2xl font-semibold">
        Обмен
      </div>
      <div className="mb-[21px] flex items-center justify-between">
        <div>
          <div className="font-manrope text-[10px] font-medium">
            1 TST = 0.361928 HYPER <span className="text-[#A2D448]"> +49.10%</span>
          </div>
        </div>
        <div className="font-manrope text-[10px] font-medium">0,407407</div>
      </div>
      <div className="relative mb-[21px] flex h-[173px] w-full items-end justify-end rounded-4xl bg-[#252A1B]">
        <Graphic />
        <div className="font-manrope absolute bottom-[30px] left-[48px] text-[10px] font-medium text-[#6A7B49]">
          0,20140
        </div>
        <div className="font-manrope absolute inset-x-0 bottom-[17px] mx-auto flex h-[21px] w-[35px] items-center justify-center rounded-xl bg-[#394128] text-center text-xs font-medium text-[#ABC181]">
          1W
        </div>
      </div>
      <div className="relative flex flex-col gap-6">
        <div className="relative h-[124px] w-full rounded-3xl bg-[#222221] p-4">
          <div className="mb-4 flex items-center justify-between text-[#8F8F8F]">
            <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
              {swapped ? "В" : "Из"}
            </div>
            <div className="flex h-[25px] w-[150px] items-center justify-center rounded-xl border border-[#3B3B3B]">
              <div className="font-manrope text-[10px] font-medium">
                Доступно 52,2160 FRU
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-1">
              <Token width={28} height={28} viewBox="0 0 34 34" />
              <div className="font-manrope text-[24px] font-medium">FRU</div>
            </div>

            <div className="font-manrope text-[18px] font-medium text-[#8F8F8F]">
              0.13 - 100000
            </div>
            <div className="font-manrope absolute right-4 bottom-4 text-[12px] font-medium text-[#85BF1A]">
              Макс.
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="absolute top-1/2 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#141414] shadow-lg"
        >
          <Swap />
        </button>

        <div className="h-[124px] w-full rounded-3xl bg-[#222221] p-4">
          <div className="mb-4 flex items-center justify-between text-[#8F8F8F]">
            <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
              {swapped ? "Из" : "В"}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-1">
              <Token width={28} height={28} viewBox="0 0 34 34" />
              <div className="font-manrope text-[24px] font-medium">FRU</div>
            </div>
            <div className="font-manrope text-[18px] font-medium text-[#8F8F8F]">
              0.13 - 100000
            </div>
          </div>
        </div>
      </div>
      <button className="font-manrope absolute right-4 bottom-[21px] left-4 flex h-[52px] w-auto max-w-md items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white">
        Предпросмотр
      </button>
    </div>
  );
}
