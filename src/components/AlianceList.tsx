import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Drawer } from "vaul";
import { ruPeople } from "~/lib/intl";
import { getImageUrl } from "~/lib/utils/images";
import { pluralizeRuIntl } from "~/lib/utils/plural";
import { useTRPC } from "~/trpc/init/react";
import { AllianceMini } from "./icons/AlianceMini";

export const AllianceList = ({ searchQuery = "" }) => {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const joinAlliance = useMutation({
    ...trpc.alliances.joinAlliance.mutationOptions(),
    onSuccess: (_, variables) => {
      navigate({ to: "/alliance/$id", params: { id: String(variables.allianceId) } });
    },
  });

  const filteredAlliances = alliances?.filter((alliance) =>
    alliance.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-[15px]">
        {filteredAlliances?.map((alliance) => (
          <Drawer.Root key={alliance.id}>
            <div
              className="flex h-[76px] cursor-pointer items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
              onClick={() =>
                navigate({ to: "/alliance/$id", params: { id: String(alliance.id) } })
              }
            >
              <div className="flex items-center gap-4">
                {alliance.avatarId ? (
                  <img
                    src={getImageUrl(alliance.avatarId)}
                    alt={alliance.name}
                    className="h-12 w-12 rounded-full object-cover"
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
              {alliance.ownerId !== user?.id && user?.allianceId !== alliance.id && (
                <Drawer.Trigger asChild>
                  <button
                    className="font-manrope h-[36px] rounded-full bg-[#76AD10] px-4 text-xs font-medium text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Вступить
                  </button>
                </Drawer.Trigger>
              )}
            </div>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="fixed right-0 bottom-0 left-0 h-fit max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-[#2A2A2A] outline-none">
                <div className="flex flex-col p-6">
                  <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#575757]" />

                  <div className="flex flex-col items-center gap-4">
                    {alliance.avatarId ? (
                      <img
                        src={getImageUrl(alliance.avatarId)}
                        alt={alliance.name}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3A3A3A]">
                        <AllianceMini />
                      </div>
                    )}

                    <div className="font-manrope text-2xl font-bold text-white">
                      {alliance.name}
                    </div>

                    <div className="font-manrope w-full rounded-xl bg-[#3A3A3A] p-4 text-sm">
                      <div className="mb-2 text-[#8F8F8F]">Участники:</div>
                      <div className="text-white">
                        {pluralizeRuIntl(alliance.members || 1, ruPeople)}
                      </div>
                    </div>

                    {alliance.telegramChannelUrl && (
                      <div className="font-manrope w-full rounded-xl bg-[#3A3A3A] p-4 text-sm">
                        <div className="mb-2 text-[#8F8F8F]">Канал альянса:</div>
                        <a
                          href={alliance.telegramChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A2D448] underline"
                        >
                          {alliance.telegramChannelUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  {alliance.ownerId !== user?.id && user?.allianceId !== alliance.id && (
                    <button
                      className="font-manrope mt-8 h-[52px] w-full rounded-full bg-[#76AD10] text-base font-medium text-white"
                      onClick={() => joinAlliance.mutate({ allianceId: alliance.id })}
                    >
                      {joinAlliance.isPending ? "Вступаем..." : "Вступить в альянс"}
                    </button>
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ))}
      </div>
    </div>
  );
};
