import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { AllianceMembList } from "~/components/AllianceMembList";
import { BackButton } from "~/components/BackButton";
import { NameInput } from "~/components/DynamicInput";
import { AllianceMini } from "~/components/icons/AlianceMini";
import { AllianceGroupMini } from "~/components/icons/AllianceGropMini";
import { ClockIcon } from "~/components/icons/ClockIcon";
import { PencilIcon } from "~/components/icons/pencilIcon";
import { Input } from "~/components/Input";
import { useT } from "~/i18n";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { enAllianceMember, ruAllianceMember } from "~/lib/intl";
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
  const t = useT();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const updateAlliance = useMutation({
    ...trpc.alliances.updateAlliance.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.alliances.getAlliances.queryKey() });
    },
  });
  const { data: users, isLoading: isUsersLoading } = useQuery(
    trpc.main.getUsers.queryOptions(),
  );

  const { data: season, isLoading: isSeasonLoading } = useQuery(
    trpc.alliances.getSeason.queryOptions(),
  );

  console.log(season, "season");

  const { data: user, isLoading: isUserLoading } = useQuery(
    trpc.main.getUser.queryOptions(),
  );
  const { data: alliances, isLoading: isAlliancesLoading } = useQuery(
    trpc.alliances.getAlliances.queryOptions(),
  );
  const deleteAlliance = useMutation({
    ...trpc.alliances.deleteAlliance.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.alliances.getAlliances.queryKey() });
      toast.success("Альянс расформирован");
      navigate({ to: "/alliances" });
    },
  });

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

  const isRu = useMemo(() => {
    return user?.language === "ru";
  }, [user?.language]);

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

  const handleDisbandAlliance = async () => {
    await deleteAlliance.mutateAsync({
      allianceId: userAlliance?.id!,
    });
  };

  const timeRemaining =
    (season && season?.seasonEnd.getTime() - Date.now()) || 30 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const seasonCurr = season?.seasonCurr || "strawberry";

  const allianceMembers = users?.filter((user) => user.allianceId === Number(id)) || [];

  const isMember = allianceMembers.some((member) => member.id === user?.id);

  let countOfFruits = 0;
  allianceMembers.forEach((member) => {
    countOfFruits += (member.balances as any)[seasonCurr] || 0;
  });

  const fruitIcon = FARMS_CONFIG.find((farm) => farm.id === seasonCurr)?.icon;
  const fruitRussianName = FARMS_CONFIG.find(
    (farm) => farm.id === seasonCurr,
  )?.allianceName;

  return (
    <div className="relative h-screen overflow-y-auto pr-4 pb-20 pl-[29px] text-white">
      <BackButton onClick={() => navigate({ to: "/alliances" })} />
      {isOwner && (
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <div className="absolute top-20 right-[16px] flex -translate-y-1/2 items-center justify-center gap-2 rounded-full bg-red-600 p-3">
              <div className="font-manrope text-xs leading-none font-medium">
                {t("Disband")}
              </div>
            </div>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
            <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 z-[1000] h-fit overflow-y-auto rounded-t-[20px] bg-[#2A2A2A] shadow-lg outline-none">
              <div className="flex flex-col p-6">
                <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#575757]" />
                <div className="font-manrope mb-4 text-center text-2xl font-bold text-white">
                  {t("Disband alliance")}
                </div>
                <div className="font-manrope mb-8 text-center text-base text-white opacity-90">
                  {t(
                    "Are you sure you want to disband your alliance? This action cannot be undone.",
                  )}
                </div>
                <div className="flex w-full gap-4">
                  <button className="font-manrope h-[52px] w-full rounded-full border border-[#575757] text-base font-medium text-white transition-all hover:bg-[#3A3A3A]">
                    {t("Cancel")}
                  </button>
                  <button
                    className="font-manrope flex h-[52px] w-full items-center justify-center rounded-full bg-red-600 text-base font-medium text-white transition-all hover:bg-[#B01F31]"
                    onClick={handleDisbandAlliance}
                  >
                    {t("Disband")}
                  </button>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
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
              {pluralizeRuIntl(
                userAlliance?.members || 0,
                isRu ? ruAllianceMember : enAllianceMember,
              )}
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
              placeholder={t("Channel link")}
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
              {t("Channel info")}
            </div>
          </div>

          <div className="mb-[15px] flex items-center justify-between">
            <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium">
              <div className="text-lg">{fruitIcon}</div>
              {t("Production")}:{" "}
              <span className="text-[#85BF1A]">{fruitRussianName}</span>
            </div>
            <div className="font-manrope flex items-center gap-[7px] text-xs leading-none font-medium">
              <ClockIcon />
              <div>
                {t("Remaining")} {daysRemaining} {t("d.")} {hoursRemaining} {t("h.")}.
              </div>
            </div>
          </div>
          <div className="flex h-[32px] w-full items-center justify-center rounded-full bg-[#F7FFEB0F]">
            <div className="font-manrope text-xs font-bold">
              {countOfFruits.toLocaleString()} {t("Collected")}
            </div>
          </div>
        </div>
      )}

      {isOwner && (
        <Input
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={t("Search members...")}
          icon={<AllianceMini />}
        />
      )}
      <div
        className="my-4 flex items-center justify-center rounded-full bg-[#76AD10] p-3"
        onClick={() => navigate({ to: "/allianceTree/$id", params: { id: String(id) } })}
      >
        <div className="font-manrope text-xs font-medium">{t("Alliance tree")}</div>
      </div>
      <div className="mt-[24px] mb-[24px] flex items-center gap-[10px]">
        <img
          src={getImageUrl(userAlliance?.avatarId || "")}
          alt={userAlliance?.name}
          className="h-[26px] w-[26px] rounded-full object-cover"
        />
        <div className="font-manrope text-base font-semibold">
          {isOwner ? t("Alliance members") : t("Fruits collected by the alliance")}
        </div>
      </div>
      <AllianceMembList
        allianceId={id}
        searchQuery={searchQuery}
        isOwner={isOwner}
        ownerId={ownerId!}
        createdAt={userAlliance?.createdAt || new Date()}
        owner={owner}
      />
    </div>
  );
}
