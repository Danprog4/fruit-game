import { Lemon } from "./icons/fruits/Lemon";
import { Strawberry } from "./icons/fruits/Strawberry";
export const FermList = () => {
  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex h-[76px] w-full items-center rounded-full border border-[#575757] bg-[#2A2A2A] px-3">
        <div className="mr-3 flex h-[54px] w-[54px] items-center justify-center gap-[6px] rounded-full border border-[#76AD10] bg-[#2A2A2A]">
          <Strawberry width={"40"} height={"40"} />
        </div>
        <div className="mr-[50px] flex w-[116px] flex-col items-start justify-center gap-2">
          <div className="font-manrope text-xs font-medium">Клубничная ферма</div>
        </div>
        <div className="font-manrope flex h-[36px] items-center justify-center rounded-full bg-[#76AD10] px-4 text-xs font-medium text-white">
          Купить
        </div>
      </div>
      <div className="flex h-[76px] w-full items-center rounded-full border border-[#575757] bg-[#2A2A2A] px-3">
        <div className="mr-3 flex h-[54px] w-[54px] items-center justify-center gap-[6px] rounded-full border border-[#76AD10] bg-[#2A2A2A]">
          <div className="rotate-[37deg] transform">
            <Lemon width={"30"} height={"30"} />
          </div>
        </div>
        <div className="mr-[50px] flex w-[116px] flex-col items-start justify-center gap-2">
          <div className="font-manrope text-xs font-medium">Лимонная ферма</div>
        </div>
        <div className="font-manrope flex h-[36px] items-center justify-center rounded-full bg-[#76AD10] px-4 text-xs font-medium text-white">
          Купить
        </div>
      </div>
    </div>
  );
};
