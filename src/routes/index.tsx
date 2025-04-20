import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AllianceGroupMini } from "~/components/icons/AllianceGropMini";
import Friends from "~/components/icons/Friends";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { Token } from "~/components/icons/Token";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());

  return (
    <div className="fixed h-screen w-full overflow-hidden pt-[97px] text-white">
      <div className="mb-[15px] flex items-center justify-center gap-2">
        <Token width={40} height={40} viewBox="0 0 30 30" />
        <span className="font-manrope text-3xl font-extrabold">
          {user?.tokenBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
        </span>
      </div>
      <div className="relative z-[1000] w-full overflow-hidden">
        <div
          className="scrollbar-hide flex overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="z-10 mr-4 flex h-[42px] min-w-[110%] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F]">
            <span className="font-manrope text-xs leading-none font-medium">
              Ваша информация
            </span>
          </div>
          <div className="mr-4 flex h-[42px] min-w-[110%] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F]">
            <span className="font-manrope text-xs leading-none font-medium">
              Ваша информация
            </span>
          </div>
          <div className="flex h-[42px] min-w-[110%] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F]">
            <span className="font-manrope text-xs leading-none font-medium">
              Ваша информация
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div
            className="absolute bottom-50 left-4 z-10 flex"
            onClick={() => navigate({ to: "/friends" })}
          >
            <div className="flex flex-col items-center gap-1">
              <Friends />
              <div className="font-manrope text-xs font-medium">Друзья</div>
            </div>
          </div>
          <div
            className="absolute bottom-30 left-4 z-10 flex"
            onClick={() => navigate({ to: "/alliances" })}
          >
            <div className="flex flex-col items-center gap-1">
              <AllianceGroupMini width={45} height={45} viewBox="0 0 35 20" />
              <div className="font-manrope text-xs font-medium">Альянс</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div
            className="absolute right-4 bottom-50 z-10 flex"
            onClick={() => navigate({ to: "/friends" })}
          >
            <div className="flex flex-col items-center gap-2">
              <Friends />
              <div className="font-manrope text-xs font-medium">Друзья</div>
            </div>
          </div>
          <div
            className="absolute right-4 bottom-30 z-10 flex"
            onClick={() => navigate({ to: "/friends" })}
          >
            <div className="flex flex-col items-center gap-2">
              <Friends />
              <div className="font-manrope text-xs font-medium">Друзья</div>
            </div>
          </div>
        </div>
      </div>
      {/* <img
        src="/img/full.svg"
        alt=""
        className="absolute top-5 h-screen w-screen object-cover"
      /> */}

      <div className="font-manrope fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-8 text-sm font-medium text-white">
        <div className="flex flex-col items-center justify-center gap-2">
          <Farm />
          <div className="font-manrope text-xs font-medium">Ферма</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <Main />
          <div className="font-manrope text-xs font-medium">Главная</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <Wallet />
          <div className="font-manrope text-xs font-medium">Кошелек</div>
        </div>
      </div>
    </div>
  );
}
