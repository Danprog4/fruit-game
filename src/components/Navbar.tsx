import Farm from "./icons/navbar/Ferm";
import Main from "./icons/navbar/Main";
import Wallet from "./icons/navbar/Wallet";

export const Navbar = () => {
  return (
    <div className="font-manrope fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-8 text-sm font-medium text-white">
      <div className="flex flex-col items-center justify-center gap-1">
        <Farm />
        <div className="font-manrope text-xs font-medium">Ферма</div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-[#A2D448]">
          <Main />
          <div className="font-manrope text-xs font-medium">Главная</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <Wallet />
        <div className="font-manrope text-xs font-medium">Кошелек</div>
      </div>
    </div>
  );
};
