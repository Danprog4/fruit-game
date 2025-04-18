import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AllianceList } from "~/components/AlianceList";
import { AllianceMini } from "~/components/icons/AlianceMini";
import { Alliance } from "~/components/icons/Alliance";
import Friends from "~/components/icons/Friends";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const createAlliance = useMutation(trpc.alliances.createAlliance.mutationOptions());
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen overflow-y-auto pr-4 pb-20 pl-4 text-white">
      <div
        className="absolute top-4 right-4 flex"
        onClick={() => navigate({ to: "/friends" })}
      >
        <div className="flex flex-col items-center gap-2">
          <Friends />
          <div className="font-manrope text-xs font-medium">Друзья</div>
        </div>
      </div>
      <div className="mt-[97px] flex flex-col items-center justify-center gap-2">
        <Alliance />
        <div className="font-manrope text-2xl leading-none font-semibold">
          Список альянсов
        </div>
        <div className="relative w-full max-w-md">
          <div className="relative mt-[21px] mb-[43px] w-full">
            <div className="absolute top-1/2 left-[15px] flex -translate-y-1/2 items-center">
              <AllianceMini />
            </div>
            <input
              type="text"
              placeholder="Поиск альянса..."
              className="h-[42px] w-full rounded-full bg-[#F7FFEB0F] pr-[35px] pl-[50px] text-xs text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none"
              size={500}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
              <button className="text-white hover:text-white">
                <div className="flex h-[29px] w-[82px] items-center justify-center rounded-full bg-[#76AD10]">
                  <div className="font-manrope text-xs font-medium">Искать</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <AllianceList searchQuery={searchQuery} />

      <button
        onClick={() => navigate({ to: "/create-alliance" })}
        className="font-manrope fixed right-4 bottom-[21px] left-4 flex h-[39px] w-auto items-center justify-center rounded-full bg-[#76AD10] px-6 text-xs font-medium text-white"
      >
        Создать свой альянс
      </button>
    </div>
  );
}
