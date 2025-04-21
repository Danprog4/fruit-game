import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/init/react";
import { Token } from "./icons/Token";
import { UserPhoto } from "./icons/UserPhoto";

type AllianceMembListProps = {
  allianceId: string;
  searchQuery?: string;
  isOwner: boolean;
  ownerId: number;
  createdAt: Date;
  owner:
    | {
        id: number;
        referrerId: number | null;
        name: string | null;
        tokenBalance: number | null;
        photoUrl: string | null;
        allianceId: number | null;
        allianceJoinDate: Date | null;
      }
    | undefined;
};

export const AllianceMembList = ({
  allianceId,
  searchQuery = "",
  isOwner,
  ownerId,
  createdAt,
  owner,
}: AllianceMembListProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: users } = useQuery(trpc.main.getUsers.queryOptions());
  const { data: currentUser } = useQuery(trpc.main.getUser.queryOptions());

  const kickMember = useMutation({
    ...trpc.main.kickFromAlliance.mutationOptions(),
    onSuccess: () => {
      // Refetch users after kicking a member
      queryClient.invalidateQueries({ queryKey: [["main", "getUsers"]] });
    },
  });

  const allianceMembers =
    users?.filter((user) => user.allianceId === Number(allianceId)) || [];

  const filteredMembers = allianceMembers.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-[15px]">
        <div
          className="flex h-[76px] items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
          key={ownerId}
        >
          <div className="flex items-center gap-4">
            {owner?.photoUrl ? (
              <img
                src={owner.photoUrl}
                alt={owner.name || ""}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <UserPhoto friendPhotoUrl="" />
            )}
            <div className="flex flex-col items-start justify-center gap-[8px]">
              <div className="font-manrope text-xs leading-none font-medium">
                {owner?.name}
              </div>

              <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                Создал{" "}
                {createdAt.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Token width={26} height={26} viewBox="0 0 30 30" />
            <div className="font-manrope text-[17px] font-[800]"> 0</div>
          </div>
        </div>

        {filteredMembers.map((member) => (
          <div
            className="flex h-[76px] items-center justify-between rounded-full border border-[#575757] bg-[#2A2A2A] pr-[19px] pl-[11px]"
            key={member.id}
          >
            <div className="flex items-center gap-4">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name || ""}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <UserPhoto friendPhotoUrl="" />
              )}
              <div className="flex flex-col items-start justify-center gap-[8px]">
                <div className="font-manrope text-xs leading-none font-medium">
                  {member.name}
                </div>
                {isOwner ? (
                  <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                    <Token width={20} height={20} viewBox="0 0 30 30" />
                    40 000
                  </div>
                ) : (
                  <div className="font-manrope flex items-center gap-1 text-xs leading-none font-medium text-[#8F8F8F]">
                    В альянсе с{" "}
                    {member.allianceJoinDate?.toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </div>

            {isOwner && (
              <button
                className="font-manrope h-[36px] rounded-full bg-[#76AD10] px-4 text-xs font-medium text-white"
                onClick={() => kickMember.mutate({ userId: member.id })}
                disabled={kickMember.isPending}
              >
                {kickMember.isPending ? "..." : "Выгнать"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
