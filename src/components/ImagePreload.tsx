import { useQuery } from "@tanstack/react-query";
import { treeConfig } from "~/lib/tree.config";
import { useTRPC } from "~/trpc/init/react";

export const ImagePreload = () => {
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const { data: alliances } = useQuery(trpc.alliances.getAlliances.queryOptions());
  const userAlliance = alliances?.find((a) => a.id === user?.allianceId);
  const userAllianceLevel = Object.values(userAlliance?.levels ?? {}).reduce(
    (acc, curr) => acc + curr,
    1,
  );
  const currentLevelImage = treeConfig[userAllianceLevel as keyof typeof treeConfig];

  return (
    <>
      {currentLevelImage && (
        <img
          className="pointer-events-none invisible absolute -translate-x-[2000px] -translate-y-[2000px]"
          key={currentLevelImage}
          src={currentLevelImage}
        />
      )}
    </>
  );
};
