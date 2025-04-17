import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/init/react";

export const UserPhoto = () => {
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  return (
    <img
      src={user?.photoUrl || undefined}
      alt="user"
      className="h-[54px] w-[54px] rounded-full"
    />
  );
};
