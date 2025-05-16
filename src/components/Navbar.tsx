import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useT } from "~/i18n";
import Farm from "./icons/navbar/Farm";
import Main from "./icons/navbar/Main";
import Wallet from "./icons/navbar/Wallet";

export const Navbar = () => {
  const navigate = useNavigate();
  const t = useT();
  const routerState = useRouterState();
  const currentRoute = routerState.location.pathname;

  // Calculate the position of the active indicator based on the current route
  const getActivePosition = () => {
    if (currentRoute === "/farms") return "left-[5%]";
    if (currentRoute === "/") return "left-[calc(50%-52.5px)]"; // Center position
    if (currentRoute === "/wallet") return "left-[calc(95%-105px)]"; // Right position
    return "left-[0%]"; // Default position
  };

  return (
    <div className="font-manrope fixed right-4 bottom-[21px] left-4 z-[1000] flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
      {/* Active indicator that slides */}
      <div
        className={`absolute h-[63px] w-[105px] rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448] transition-all duration-300 ease-in-out ${getActivePosition()}`}
      />

      <div className="flex flex-col items-center justify-center gap-1">
        <div
          className="relative z-10 flex w-[105px] flex-col items-center justify-center gap-1"
          onClick={() => navigate({ to: "/farms" })}
        >
          <Farm />
          <div className="font-manrope text-xs font-medium">{t("Farm")}</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <div
          className="relative z-10 flex w-[105px] flex-col items-center justify-center gap-1"
          onClick={() => navigate({ to: "/" })}
        >
          <Main />
          <div className="font-manrope text-xs font-medium">{t("Main")}</div>
        </div>
      </div>
      <div
        className="relative z-10 flex w-[105px] flex-col items-center justify-center gap-1"
        onClick={() => navigate({ to: "/wallet" })}
      >
        <Wallet />
        <div className="font-manrope text-xs font-medium">{t("Wallet")}</div>
      </div>
    </div>
  );
};
