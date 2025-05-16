import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlliancesList } from "~/components/AlliancesList";
import { BackButton } from "~/components/BackButton";
import { AllianceMini } from "~/components/icons/AlianceMini";
import { Alliance } from "~/components/icons/Alliance";
import { Input } from "~/components/Input";
import { useT } from "~/i18n";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/alliances")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());
  const [searchQuery, setSearchQuery] = useState("");
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const isOwner = alliances?.some((alliance) => alliance.ownerId === user?.id);
  const lastTxs = useQuery(trpc.farms.getLastTxs.queryOptions());
  const isPending = lastTxs.data?.some(
    (tx) => tx.status === "pending" && tx.txType === "alliance",
  );
  const t = useT();
  return (
    <div className="relative h-screen overflow-y-auto pr-4 pb-20 pl-4 text-white">
      <BackButton onClick={() => navigate({ to: "/" })} />
      <div className="mt-12 mb-[43px] flex flex-col items-center justify-center gap-2">
        <Alliance />
        <div className="font-manrope text-2xl leading-none font-semibold">
          {t("Alliance list")}
        </div>
        <Input
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={t("Search alliance...")}
          icon={<AllianceMini />}
        />
      </div>
      <AlliancesList searchQuery={searchQuery} isOwner={isOwner || false} />

      {!isOwner && !isPending && (
        <button
          onClick={() => navigate({ to: "/create-alliance" })}
          className="font-manrope fixed right-4 bottom-[21px] left-4 flex h-[52px] w-auto items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white"
        >
          {t("Create your alliance")}
        </button>
      )}
    </div>
  );
}
