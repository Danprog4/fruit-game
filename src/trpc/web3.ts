import { TRPCRouterRecord } from "@trpc/server";
import { startTonProcessor } from "~/lib/web3/ton-payment";
import { publicProcedure } from "./init";

export const web3Router = {
  txs: publicProcedure.query(async () => {
    await startTonProcessor();
  }),
} satisfies TRPCRouterRecord;
