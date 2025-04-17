import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/init/react";
import { Token } from "./icons/Token";
import { UserPhoto } from "./icons/UserPhoto";

export const List = () => {
  const trpc = useTRPC();
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-[15px]">
        {friends?.map((friend) => (
          <div
            className="] flex h-[76px] items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
            key={friend.id}
          >
            <div className="flex items-center gap-4">
              <UserPhoto />
              <div className="flex flex-col items-start justify-center gap-[8px]">
                <div className="font-manrope text-xs leading-none font-medium">
                  {friend.name}
                </div>
                <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                  Уровень
                  <div className="flex h-[16px] w-[23px] items-center justify-center rounded-full bg-[#B0F72C] text-black">
                    14
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              <Token width={26} height={26} viewBox="0 0 30 30" />
              <div className="font-manrope text-[17px] font-[800]"> 40 000</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
