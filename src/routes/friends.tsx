import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { shareURL } from "@telegram-apps/sdk";
import { useMemo } from "react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { FriendsList } from "~/components/FriendsList";
import { Share } from "~/components/icons/Share";
import { Token } from "~/components/icons/Token";
import { User } from "~/components/icons/User";
import { ruFriends } from "~/lib/intl";
import { pluralizeRuIntl } from "~/lib/utils/plural";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/friends")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const text = "Приглашаю тебя в игру Fruit Utopia!";

  const link = useMemo((): string => {
    return `https://t.me/FruitUtopia_bot?startapp=ref_${user?.id || ""}`;
  }, [user?.id, text]);
  return (
    <div className="h-screen w-full rounded-lg pr-4 pl-4 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="mt-12 mb-[27px] flex h-[76px] w-full items-center justify-between rounded-full bg-[#343d24] pr-[11px] pl-[28px]">
        <div className="flex flex-col gap-[7px]">
          <div className="font-manrope text-base font-semibold">Пригласите друзей</div>
          <div className="font-manrope text-xs font-medium text-[rgb(147,161,121)]">
            100 💎 за друга и 5% от дохода его ферм
          </div>
        </div>

        <button
          className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]"
          onClick={() => {
            navigator.clipboard
              .writeText(link)
              .then(() => {
                toast.success("Ссылка скопирована в буфер обмена");
              })
              .catch((err) => {
                console.error("Failed to copy link: ", err);
              });
          }}
        >
          <Share />
        </button>
      </div>
      <div className="mb-[48px] flex h-[42px] w-[full] items-center justify-between rounded-full bg-[#F7FFEB0F] pr-[7px] pl-[10px]">
        <div className="flex items-center">
          <div className="pb-2">
            <User />
          </div>
          <div className="font-manrope mr-[39px] text-xs leading-none font-medium text-nowrap">
            У вас{" "}
            <span className="text-[#85BF1A]">
              {pluralizeRuIntl(friends?.length || 0, ruFriends)}
            </span>
          </div>
        </div>
        <div
          className="flex h-[29px] w-[110px] cursor-pointer items-center justify-center rounded-full bg-[#76AD10]"
          onClick={() => {
            if (shareURL.isAvailable()) {
              shareURL(link, text);
            }
          }}
        >
          <div className="font-manrope text-xs leading-none font-medium">Пригласить</div>
        </div>
      </div>
      <div className="mb-[16px] flex items-center gap-2">
        <Token width={24} height={24} viewBox="0 0 30 30" />
        <div className="font-manrope text-base leading-none font-semibold">
          Список друзей
        </div>
      </div>
      {friends && friends.length > 0 ? (
        <FriendsList />
      ) : (
        <div className="flex h-[100px] w-full items-center justify-center rounded-xl bg-[#F7FFEB0F] text-center">
          <div className="font-manrope text-sm opacity-50">У вас пока нет друзей</div>
        </div>
      )}
    </div>
  );
}
