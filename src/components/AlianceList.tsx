import { useQuery } from "@tanstack/react-query";
import { ruPeople } from "~/lib/intl";
import { getImageUrl } from "~/lib/utils/images";
import { pluralizeRuIntl } from "~/lib/utils/plural";
import { useTRPC } from "~/trpc/init/react";
import { AllianceMini } from "./icons/AlianceMini";

export const AllianceList = ({ searchQuery = "" }) => {
  const trpc = useTRPC();
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());

  const filteredAlliances = alliances?.filter((alliance) =>
    alliance.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-[15px]">
        {filteredAlliances?.map((alliance) => (
          <div
            className="flex h-[76px] items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
            key={alliance.id}
          >
            <div className="flex items-center gap-4">
              {alliance.avatarId ? (
                <img
                  src={getImageUrl(alliance.avatarId)}
                  alt={alliance.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A3A3A]">
                  <AllianceMini />
                </div>
              )}
              <div className="flex flex-col items-start justify-center gap-[8px]">
                <div className="font-manrope text-xs leading-none font-medium">
                  {alliance.name}
                </div>
                <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                  <div>{pluralizeRuIntl(alliance.members || 1, ruPeople)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
