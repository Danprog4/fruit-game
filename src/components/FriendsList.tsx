import { useQuery } from "@tanstack/react-query";
import { useT } from "~/i18n";
import { getFriendLevel } from "~/lib/friends.config";
import { useTRPC } from "~/trpc/init/react";
import { UserPhoto } from "./icons/UserPhoto";

export const FriendsList = () => {
  const trpc = useTRPC();
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const t = useT();

  const getAllFriendFarms = (friendId: number) => {
    const friend = friends?.find((friend) => friend.id === friendId);
    const farmEntries = Object.entries(friend?.farms || {});
    return farmEntries.reduce((acc, [_, count]) => acc + count, 0);
  };

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-[15px]">
        {friends?.map((friend) => (
          <div
            className="] flex h-[76px] items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
            key={friend.id}
          >
            <div className="flex items-center gap-4">
              <UserPhoto friendPhotoUrl={friend.photoUrl || ""} />
              <div className="flex flex-col items-start justify-center gap-[8px]">
                <div className="font-manrope text-xs leading-none font-medium">
                  {friend.name}
                </div>
                <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                  {t("Level")}
                  <div className="flex h-[16px] w-[23px] items-center justify-center rounded-full bg-[#B0F72C] text-black">
                    {getFriendLevel(getAllFriendFarms(friend.id))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-xl">
              💎
              <div className="font-manrope text-[17px] font-[800]"> 100 </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
