import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/friends")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());
  return (
    <div className="mt-[111px] h-screen w-full rounded-lg pr-4 pl-4">
      <div className="h-[76px] w-full rounded-full bg-[#343d24]"></div>
      {friends?.map((friend) => <div key={friend.id}>{friend.id}</div>)}
    </div>
  );
}
