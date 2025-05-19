import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/init/react";

export const useJettonBalance = (address: string) => {
  const trpc = useTRPC();
  const { data: balance } = useQuery(
    trpc.web3.jettonBalance.queryOptions({
      address,
    }),
  );

  return balance;
};
