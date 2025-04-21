import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AllianceMembList } from "~/components/AllianceMembList";
import { BackButton } from "~/components/BackButton";
import { NameInput } from "~/components/DynamicInput";
import { AllianceMini } from "~/components/icons/AlianceMini";
import { AllianceGroupMini } from "~/components/icons/AllianceGropMini";
import { ClockIcon } from "~/components/icons/ClockIcon";
import { Strawberry } from "~/components/icons/fruits/Strawberry";
import { PencilIcon } from "~/components/icons/pencilIcon";
import { Input } from "~/components/Input";
import { ruPeople } from "~/lib/intl";
import { convertHeicToPng } from "~/lib/utils/convertHeicToPng";
import { convertToBase64 } from "~/lib/utils/convertToBase64";
import { getImageUrl } from "~/lib/utils/images";
import { pluralizeRuIntl } from "~/lib/utils/plural";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/alliance/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const updateAlliance = useMutation({
    ...trpc.alliances.updateAlliance.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["alliances", "getAlliances"]] });
    },
  });
  const { data: users, isLoading: isUsersLoading } = useQuery(
    trpc.main.getUsers.queryOptions(),
  );

  const addCapacity = useMutation({
    ...trpc.alliances.addCapacity.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["alliances", "getAlliances"]] });
    },
  });

  const removeCapacity = useMutation({
    ...trpc.alliances.removeCapacity.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["alliances", "getAlliances"]] });
    },
  });

  const { data: user, isLoading: isUserLoading } = useQuery(
    trpc.main.getUser.queryOptions(),
  );
  const { data: alliances, isLoading: isAlliancesLoading } = useQuery(
    trpc.alliances.getAlliances.queryOptions(),
  );

  // Initialize channelUrl with the alliance's URL when data is loaded
  useEffect(() => {
    if (alliances) {
      const alliance = alliances.find((a) => a.id === Number(id));
      if (alliance?.telegramChannelUrl) {
        setChannelUrl(alliance.telegramChannelUrl);
      }
    }
  }, [alliances, id]);

  if (isUserLoading || isAlliancesLoading) {
    return <div>Loading...</div>;
  }

  const userAlliance = alliances?.find((alliance) => alliance.id === Number(id));
  const isOwner = userAlliance?.ownerId === user?.id;
  const ownerId = userAlliance?.ownerId;
  const owner = users?.find((user) => user.id === Number(userAlliance?.ownerId));

  const isHeicFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith(".heic");
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile) {
      return;
    }

    try {
      let fileToProcess = selectedFile;

      // If file is HEIC, convert to PNG first
      if (isHeicFile(selectedFile)) {
        fileToProcess = await convertHeicToPng(selectedFile);
      }

      const base64 = await convertToBase64(fileToProcess);

      await updateAlliance.mutateAsync({
        id: userAlliance?.id.toString() || "",
        imageBase64: base64,
      });
    } catch (error) {
      console.error("Error creating alliance:", error);
    }
  };

  const handleNameChange = async (name: string) => {
    await updateAlliance.mutateAsync({
      id: userAlliance?.id.toString() || "",
      name,
    });
  };

  const handleTelegramUrlChange = async (url: string) => {
    await updateAlliance.mutateAsync({
      id: userAlliance?.id.toString() || "",
      telegramChannelUrl: url,
    });
  };

  const handleAddCapacity = async () => {
    if (!userAlliance) return;

    const newCapacity = (userAlliance.capacity || 0) + 1;
    await addCapacity.mutateAsync({
      allianceId: userAlliance.id.toString(),
      capacity: newCapacity,
    });
  };

  const handleRemoveCapacity = async () => {
    if (!userAlliance || (userAlliance.capacity || 0) <= 0) return;

    const newCapacity = (userAlliance.capacity || 0) - 1;
    await removeCapacity.mutateAsync({
      allianceId: userAlliance.id.toString(),
      capacity: newCapacity,
    });
  };

  console.log(userAlliance);

  return (
    <div className="relative h-screen overflow-y-auto pr-4 pb-20 pl-[29px] text-white">
      <BackButton onClick={() => navigate({ to: "/alliances" })} />
      <div className="mt-[97px] flex items-center gap-4">
        {isOwner ? (
          <label htmlFor="alliance-photo-upload" className="z-10 cursor-pointer">
            {userAlliance?.avatarId && (
              <div className="relative">
                <img
                  src={getImageUrl(userAlliance.avatarId)}
                  alt={userAlliance.name}
                  className="z-10 h-[109px] w-[109px] rounded-full object-cover"
                />
                <div className="absolute right-0 bottom-0 flex h-[24px] w-[24px] items-center justify-center rounded-md bg-white">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 1V11M1 6H11"
                      stroke="#85BF1A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
            <input
              id="alliance-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        ) : (
          userAlliance?.avatarId && (
            <img
              src={getImageUrl(userAlliance.avatarId)}
              alt={userAlliance.name}
              className="z-10 h-[109px] w-[109px] rounded-full object-cover"
            />
          )
        )}

        <div className="absolute flex h-[76px] w-[88vw] items-center justify-between rounded-full bg-[#343D24] pr-[18px] pl-[134px]">
          <div className="flex flex-col gap-2">
            {isOwner ? (
              <NameInput
                userAlliance={userAlliance}
                isOwner={isOwner}
                handleSave={handleNameChange}
              />
            ) : (
              <div className="font-manrope flex cursor-pointer items-center gap-2 text-xs font-medium">
                {userAlliance?.name}
              </div>
            )}
            <div className="font-manrope text-xs font-medium text-[#93A179]">
              {pluralizeRuIntl(userAlliance?.members || 0, {
                one: "участник",
                few: "участника",
                many: "участников",
              })}
            </div>
          </div>
          <AllianceGroupMini />
        </div>
      </div>

      {isOwner ? (
        <div className="relative mt-4 mb-[14px] flex w-full items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ссылка на ваш канал"
              className="h-[42px] w-full rounded-full bg-[#F7FFEB0F] pr-[50px] pl-[14px] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none"
              size={500}
              value={channelUrl}
              onChange={(e) => {
                setChannelUrl(e.target.value);
              }}
              onBlur={() => {
                if (channelUrl !== userAlliance?.telegramChannelUrl) {
                  handleTelegramUrlChange(channelUrl);
                }
              }}
            />
            <div className="absolute top-1/2 right-[15px] flex -translate-y-1/2 items-center">
              <PencilIcon />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mt-4 mb-[17px] flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#222221]">
            <div className="font-manrope text-[] text-sm font-medium opacity-50">
              Здесь будет информация о канале
            </div>
          </div>
          <div className="mb-[15px] flex items-center justify-between">
            <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium">
              <Strawberry />
              Добыча: <span className="text-[#85BF1A]">клубники</span>
            </div>
            <div className="font-manrope flex items-center gap-[7px] text-xs leading-none font-medium">
              <ClockIcon />
              <div> Осталось 0 д. 0 ч.</div>
            </div>
          </div>
          <div className="flex h-[32px] w-full items-center justify-center rounded-full bg-[#F7FFEB0F]">
            <div className="font-manrope text-xs font-bold">0%</div>
          </div>
        </div>
      )}
      {isOwner && (
        <Input
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Поиск участника"
          icon={<AllianceMini />}
        />
      )}
      <div className="mt-[24px] mb-[24px] flex items-center gap-[10px]">
        <img
          src={getImageUrl(userAlliance?.avatarId || "")}
          alt={userAlliance?.name}
          className="h-[26px] w-[26px] rounded-full object-cover"
        />
        <div className="font-manrope text-base font-semibold">
          {isOwner ? "Участники альянса" : "Добытые альянсом фрукты"}
        </div>
      </div>
      <AllianceMembList
        allianceId={id}
        searchQuery={searchQuery}
        isOwner={isOwner}
        ownerId={ownerId!}
        createdAt={userAlliance?.createdAt!}
        owner={owner}
      />
      {isOwner && (
        <div className="fixed bottom-[21px] left-1/2 flex h-[59px] w-[88vw] -translate-x-1/2 items-center justify-between rounded-full bg-[#222221] pr-[10px] pl-[14px]">
          <AllianceMini />
          <div className="flex flex-col gap-[3px]">
            <div className="font-manrope text-xs leading-none font-medium">
              {pluralizeRuIntl(userAlliance?.capacity || 0, ruPeople)}
            </div>
            <div className="font-manrope text-xs leading-none font-medium text-[#8F8F8F]">
              Вместимость альянса
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <button
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#76AD10] text-lg font-medium text-white"
              onClick={handleAddCapacity}
              disabled={addCapacity.isPending}
            >
              +
            </button>
            <div className="font-manrope min-w-[30px] text-center text-xs leading-none font-medium">
              {userAlliance?.capacity || 0}
            </div>
            <button
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#76AD10] text-lg font-medium text-white"
              onClick={handleRemoveCapacity}
              disabled={removeCapacity.isPending || (userAlliance?.capacity || 0) <= 0}
            >
              -
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
