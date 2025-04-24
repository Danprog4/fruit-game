import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useWindowSize } from "usehooks-ts";
import { AllianceGroupMini } from "~/components/icons/AllianceGropMini";
import { ChampIcon } from "~/components/icons/ChampIcon";
import Friends from "~/components/icons/Friends";
import { Apple } from "~/components/icons/fruits/Apple";
import { Lemon } from "~/components/icons/fruits/Lemon";
import { Pear } from "~/components/icons/fruits/Pear";
import { StrawberryMain } from "~/components/icons/fruits/StrawberryMain";
import Ferm from "~/components/icons/navbar/Ferm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { TasksIcon } from "~/components/icons/Tasks";
import { Token } from "~/components/icons/Token";
import { Circle } from "~/components/images/Circle";
import { Fermer } from "~/components/images/Fermer";
import { Lights } from "~/components/images/Lights";
import { Platform } from "~/components/images/Platfrom";
import { useTRPC } from "~/trpc/init/react";
import { InfiniteMovingCards } from "../components/InfiniteMovingCards";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const { height } = useWindowSize();

  const getScale = () => {
    const baseHeight = 800;
    const scaleFactor = Math.max(0.6, Math.min(1.2, height / baseHeight));
    return scaleFactor;
  };

  return (
    <div className="fixed h-screen w-full overflow-hidden text-white">
      <div className="z-10 flex flex-col items-center justify-center gap-2 pt-12">
        <div className="flex items-center gap-2">
          <Token width={38} height={38} viewBox="0 0 30 30" />
          <span className="font-manrope z-10 text-3xl font-extrabold">
            {user?.tokenBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? 0}
          </span>
        </div>
        <div className="relative z-[2000] w-full overflow-hidden">
          <InfiniteMovingCards
            direction="right"
            speed="normal"
            pauseOnHover={false}
            className="py-2"
            items={[
              {
                content: (
                  <div className="z-10 flex h-[42px] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F] px-[22px]">
                    <span className="font-manrope text-xs leading-none font-medium">
                      Скидка 10% на пополнение баланса до 22.03
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <div className="flex h-[42px] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F] px-[22px]">
                    <span className="font-manrope text-xs leading-none font-medium">
                      Двойные бонусы за приглашение друзей
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <div className="flex h-[42px] shrink-0 items-center justify-center rounded-full bg-[#F7FFEB0F] px-[22px]">
                    <span className="font-manrope text-xs leading-none font-medium">
                      Новые награды в заданиях
                    </span>
                  </div>
                ),
              },
            ]}
          />
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
            onClick={() => navigate({ to: "/tasks" })}
          >
            <div className="flex flex-col items-center gap-1">
              <TasksIcon />
              <div className="font-manrope text-xs font-medium">Задания</div>
            </div>
          </div>
          <div
            className="absolute right-4 bottom-30 z-10 flex"
            onClick={() => navigate({ to: "/champ" })}
          >
            <div className="flex flex-col items-center">
              <ChampIcon />
              <div className="font-manrope text-xs font-medium">Лиги</div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="background-circle"
        className="absolute bottom-[27vh] left-1/2 -translate-x-1/2 transform"
        style={{ transform: `scale(${getScale()})` }}
      >
        <div className="">
          <Circle />
          <div className="absolute top-1/2 left-13 z-10 -translate-x-16 -translate-y-8">
            <div className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white">
              <Apple />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-16 -translate-x-16 translate-y-8">
            <div className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white">
              <Lemon />
            </div>
          </div>
          <div className="absolute top-1/2 right-13 translate-x-16 -translate-y-8">
            <div className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white pl-1">
              <Pear />
            </div>
          </div>
          <div className="absolute right-16 bottom-1/3 translate-x-16 translate-y-8">
            <div className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white">
              <StrawberryMain />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 bottom-0 left-0 z-[-10] flex w-full items-center justify-center">
        <Lights />
      </div>

      <div
        id="farmer"
        className="absolute bottom-[3vh] left-1/2 -translate-x-1/2 transform"
        style={{ transform: `scale(${getScale()})` }}
      >
        <div className="relative">
          <Platform />
          <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2">
            <Fermer />
          </div>
        </div>
      </div>

      <div className="font-manrope fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
        <div className="flex w-[105px] flex-col items-center justify-center gap-1">
          <div
            onClick={() => navigate({ to: "/ferm" })}
            className="flex w-[105px] flex-col items-center justify-center gap-1"
          >
            <Ferm />
            <div className="font-manrope text-xs font-medium">Ферма</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448]">
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
