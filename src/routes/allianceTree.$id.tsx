import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 as Spinner } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { BackButton } from "~/components/BackButton";
import { Switch } from "~/components/ui/switch";
import { useAllianceUpgrade } from "~/hooks/useAllianceUpgrade";
import { useT } from "~/i18n";
import {
  ALLIANCE_LEVELS,
  AllianceLevelType,
  getCurrentAllianceLevelObject,
  getNextAllianceLevelPrice,
} from "~/lib/alliance-levels.config";
import { getImageByLevel } from "~/lib/tree.config";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/allianceTree/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { id } = Route.useParams();
  const t = useT();
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());
  const { data: users } = useQuery(trpc.main.getUsers.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const navigate = useNavigate();
  const [isTON, setIsTON] = useState(false);
  const { upgradeWithTON, upgradeWithFRU } = useAllianceUpgrade();

  const alliance = alliances?.find((alliance) => alliance.id === Number(id));

  if (!alliance) {
    return <div>Альянс не найден</div>;
  }

  const handleUpgradeForFRU = (type: AllianceLevelType) => {
    upgradeWithFRU.mutate({ allianceId: Number(id), type, alliance });
  };

  const handleUpgradeForTON = (type: AllianceLevelType) => {
    upgradeWithTON.mutate({ allianceId: Number(id), type, alliance });
  };

  const allianceMembers = users?.filter((user) => user.allianceId === Number(id));
  const isMember = allianceMembers?.find((member) => member.id === user?.id);
  const isOwner = alliance.ownerId === user?.id;

  const capacityLevel = getCurrentAllianceLevelObject(
    "capacity",
    alliance.levels.capacity || 0,
  );
  const coefficientLevel = getCurrentAllianceLevelObject(
    "coefficient",
    alliance.levels.coefficient || 0,
  );
  const profitabilityLevel = getCurrentAllianceLevelObject(
    "profitability",
    alliance.levels.profitability || 0,
  );

  const getProgressPercentage = (
    type: AllianceLevelType,
    currentLevel: number,
  ): number => {
    const maxLevel = ALLIANCE_LEVELS[type].length - 1;
    return (currentLevel / maxLevel) * 100;
  };

  const capacityProgress = getProgressPercentage(
    "capacity",
    alliance.levels.capacity || 0,
  );
  const coefficientProgress = getProgressPercentage(
    "coefficient",
    alliance.levels.coefficient || 0,
  );
  const profitabilityProgress = getProgressPercentage(
    "profitability",
    alliance.levels.profitability || 0,
  );

  const getStrokeDashoffset = (percentage: number): number => {
    return 301.6 - (301.6 * percentage) / 100;
  };

  const allianceStats = [
    {
      type: "capacity" as AllianceLevelType,
      title: t("Capacity"),
      level: capacityLevel,
      progress: capacityProgress,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
      valueDisplay: (
        <div className="flex items-center gap-1 text-sm text-nowrap text-gray-300">
          {capacityLevel?.level} <span className="text-[#76AD10]">LVL</span> |{" "}
          {capacityLevel?.value}
          <div className="text-xs"></div>
        </div>
      ),
      priceDisplay: (
        <div className="text-sm text-gray-300">
          {getNextAllianceLevelPrice("capacity", alliance.levels.capacity || 0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
          FRU
          <span className="text-xs"></span>
        </div>
      ),
    },
    {
      type: "coefficient" as AllianceLevelType,
      title: t("Coefficient"),
      level: coefficientLevel,
      progress: coefficientProgress,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
      valueDisplay: (
        <div className="text-sm text-gray-300">
          {coefficientLevel?.level} <span className="text-[#76AD10]">LVL</span> |{" "}
          {coefficientLevel?.value === 0 ? "1" : coefficientLevel?.value}X
          <span className="text-xs"></span>
        </div>
      ),
      priceDisplay: (
        <div className="text-sm text-gray-300">
          {getNextAllianceLevelPrice("coefficient", alliance.levels.coefficient || 0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
          FRU
          <span className="text-xs"></span>
        </div>
      ),
    },
    {
      type: "profitability" as AllianceLevelType,
      title: t("Profitability"),
      level: profitabilityLevel,
      progress: profitabilityProgress,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      ),
      valueDisplay: (
        <div className="text-sm text-gray-300">
          {profitabilityLevel?.level} <span className="text-[#76AD10]">LVL</span> |{" "}
          {profitabilityLevel?.value}%<span className="text-xs"></span>
        </div>
      ),
      priceDisplay: (
        <div className="text-sm text-gray-300">
          {getNextAllianceLevelPrice("profitability", alliance.levels.profitability || 0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
          FRU
          <span className="text-xs"></span>
        </div>
      ),
    },
  ];

  const allianceLevel = Object.keys(alliance.levels).reduce((acc, level) => {
    return acc + alliance.levels[level as keyof typeof alliance.levels];
  }, 1);

  const TreeImage = getImageByLevel(allianceLevel || 0);

  console.log(allianceLevel);

  return (
    <div className="flex h-screen flex-col items-center overflow-y-hidden bg-[#3b390e] text-white">
      <BackButton onClick={() => navigate({ to: "/alliance/$id", params: { id } })} />

      <div className="relative">
        <img src={TreeImage} alt="" className="object-cover" />
        <div className="absolute bottom-0 h-20 w-full bg-gradient-to-t from-[#3b390e] to-transparent"></div>
      </div>

      <div className="mb-4 text-2xl font-bold">{t("Alliance tree")}</div>
      <div className="flex w-full justify-between gap-4 p-4">
        {allianceStats.map((stat, index) => (
          <Drawer.Root key={index}>
            <div className="flex flex-col items-center">
              <Drawer.Trigger asChild>
                <button type="button" className="relative mb-2">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 bg-transparent">
                    <svg
                      viewBox="0 0 24 24"
                      width="40"
                      height="40"
                      fill="none"
                      stroke="currentColor"
                      className="text-white"
                    >
                      {stat.icon}
                    </svg>
                  </div>
                  <div className="absolute top-0 right-0 h-24 w-24">
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#76AD10"
                        strokeWidth="6"
                        strokeDasharray="301.6"
                        strokeDashoffset={getStrokeDashoffset(stat.progress)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                </button>
              </Drawer.Trigger>
              <div className="text-center font-medium">{stat.title}</div>
              {stat.valueDisplay}
            </div>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />

              <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[1000] h-fit max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-[#3b390e] outline-none">
                <div className="flex flex-col p-4">
                  <div className="mb-4 ml-auto flex items-center gap-2">
                    {isTON ? (
                      <div className="text-sm text-gray-300">
                        {t("Buy for")} FRU ({t("Balance")})
                      </div>
                    ) : (
                      <div className="text-sm text-gray-300">
                        {t("Buy for")} FRU (TON)
                      </div>
                    )}
                    <Switch
                      checked={isTON}
                      onCheckedChange={(checked: boolean) => setIsTON(checked)}
                    />
                  </div>
                  <div className="flex w-full justify-between gap-4">
                    {allianceStats.map((stat, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <button type="button" className="relative mb-2">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 bg-transparent">
                            <svg
                              viewBox="0 0 24 24"
                              width="40"
                              height="40"
                              fill="none"
                              stroke="currentColor"
                              className="text-white"
                            >
                              {stat.icon}
                            </svg>
                          </div>
                          <div className="absolute top-0 right-0 h-24 w-24">
                            <svg viewBox="0 0 100 100" width="100%" height="100%">
                              <circle
                                cx="50"
                                cy="50"
                                r="48"
                                fill="none"
                                stroke="#76AD10"
                                strokeWidth="6"
                                strokeDasharray="301.6"
                                strokeDashoffset={getStrokeDashoffset(stat.progress)}
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                          </div>
                        </button>

                        {isTON ? (
                          <button
                            type="button"
                            className="mt-2 flex h-12 min-w-[104px] items-center justify-center rounded-3xl bg-[#7AB019] px-3 py-1 text-sm transition-colors hover:bg-[#7AB019]"
                            onClick={() => handleUpgradeForTON(stat.type)}
                            disabled={upgradeWithTON.isPending}
                          >
                            {upgradeWithTON.isPending &&
                            stat.type === upgradeWithTON.variables.type ? (
                              <Spinner className="size-4 animate-spin" />
                            ) : (
                              t("Upgrade for TON")
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mt-2 flex h-12 min-w-[104px] items-center justify-center rounded-3xl bg-[#7AB019] px-3 py-1 text-sm transition-colors hover:bg-[#7AB019]"
                            onClick={() => handleUpgradeForFRU(stat.type)}
                            disabled={upgradeWithFRU.isPending}
                          >
                            {upgradeWithFRU.isPending &&
                            stat.type === upgradeWithFRU.variables.type ? (
                              <Spinner className="size-4 animate-spin" />
                            ) : (
                              t("Upgrade for FRU")
                            )}
                          </button>
                        )}

                        <div className="mt-2 text-center text-sm font-medium">
                          {stat.title}
                        </div>

                        <div className="text-nowrap">{stat.priceDisplay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ))}
      </div>
    </div>
  );
}
