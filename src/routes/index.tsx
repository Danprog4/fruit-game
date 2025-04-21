import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AllianceGroupMini } from "~/components/icons/AllianceGropMini";
import Friends from "~/components/icons/Friends";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { Token } from "~/components/icons/Token";
import { Circle } from "~/components/images/Circle";
import { Fermer } from "~/components/images/Fermer";
import { Lights } from "~/components/images/Lights";
import { Platform } from "~/components/images/Platfrom";
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

      <div className="absolute bottom-[30vh] left-1/2 -translate-x-1/2 transform">
        <div className="relative">
          <Circle />
          {/* White circles on orbit of circle - 2 on left, 2 on right */}
          <div className="absolute top-1/2 left-13 -translate-x-16 -translate-y-8">
            <div className="h-[31px] w-[31px] rounded-full bg-white"></div>
          </div>
          <div className="absolute bottom-1/3 left-16 -translate-x-16 translate-y-8">
            <div className="h-[31px] w-[31px] rounded-full bg-white"></div>
          </div>
          <div className="absolute top-1/2 right-13 translate-x-16 -translate-y-8">
            <div className="h-[31px] w-[31px] rounded-full bg-white"></div>
          </div>
          <div className="absolute right-16 bottom-1/3 translate-x-16 translate-y-8">
            <div className="h-[31px] w-[31px] rounded-full bg-white"></div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 w-full">
        <Lights />
      </div>

      <div className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 transform">
        <div className="relative">
          <Platform />
          <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2">
            <Fermer />
          </div>
        </div>
      </div>

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
