import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Alliance } from "~/components/icons/Alliance";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/")({
  component: Alliance,
});

function Home() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.main.getHello.queryOptions());
  const { data: brother } = useQuery(trpc.main.getBrother.queryOptions());
  const { data: friends } = useQuery(trpc.main.getFriends.queryOptions());

  return <div></div>;
}
