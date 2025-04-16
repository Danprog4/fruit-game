import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.main.getHello.queryOptions());
  const { data: brother } = useQuery(trpc.main.getBrother.queryOptions());
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());

  return (
    <div className="p-10">
      <h3>Hello from backend with tRPC:</h3>
      <div>{brother?.brother}</div>
      {isLoading ? <div>Loading...</div> : <div>hello {data?.hello}</div>}
      <div>{friends?.map((friend) => <div key={friend.id}>{friend.id}</div>)}</div>
    </div>
  );
}
