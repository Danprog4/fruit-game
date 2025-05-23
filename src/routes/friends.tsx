import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { shareURL } from "@telegram-apps/sdk";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { FriendsList } from "~/components/FriendsList";
import { Share } from "~/components/icons/Share";
import { Token } from "~/components/icons/Token";
import { User } from "~/components/icons/User";
import { useT } from "~/i18n";
import { enFriends, ruFriends } from "~/lib/intl";
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

  const t = useT();

  const isRu = useMemo(() => {
    return user?.language === "ru";
  }, [user?.language]);

  const link = useMemo((): string => {
    return `https://t.me/FruitUtopia_bot?startapp=ref_${user?.id || ""}`;
  }, [user?.id]);

  const text = t("Im inviting you to the game Fruit Utopia!");

  return (
    <div className="h-screen w-full rounded-lg pr-4 pl-4 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="pt-4">
        <ArrowLeft onClick={() => navigate({ to: "/" })} />
      </div>

      <div className="mt-12 mb-[27px] flex h-[80px] w-full items-center justify-between rounded-full bg-[#343d24] pr-4 pl-[28px]">
        <div className="flex flex-col gap-1">
          <div className="font-manrope text-base font-semibold">
            {t("Invite friends")}
          </div>
          <div className="font-manrope text-xs font-medium text-[rgb(147,161,121)]">
            {t("100 💎 for a friend and 5% of their farm income")}
          </div>
        </div>

        <button
          className="flex aspect-square h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]"
          onClick={() => {
            navigator.clipboard
              .writeText(link)
              .then(() => {
                toast.success(t("Link copied to clipboard"));
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
            {t("You have")}{" "}
            <span className="text-[#85BF1A]">
              {pluralizeRuIntl(friends?.length || 0, isRu ? ruFriends : enFriends)}
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
          <div className="font-manrope flex items-center justify-center text-xs leading-none font-medium">
            {t("Invite")}
          </div>
        </div>
      </div>
      <div className="mb-[16px] flex items-center gap-2">
        <Token width={24} height={24} viewBox="0 0 30 30" />
        <div className="font-manrope text-base leading-none font-semibold">
          {t("Friends list")}
        </div>
      </div>
      {friends && friends.length > 0 ? (
        <FriendsList />
      ) : (
        <div className="flex h-[100px] w-full items-center justify-center rounded-xl bg-[#F7FFEB0F] text-center">
          <div className="font-manrope text-sm opacity-50">
            {t("You have no friends")}
          </div>
        </div>
      )}
    </div>
  );
}
