import { fromNano } from "@ton/core";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { getJettonBalance } from "~/lib/web3/get-jetton-balance";
import { startTonProcessor } from "~/lib/web3/ton-payment";
import { publicProcedure } from "./init";
export const web3Router = {
  txs: publicProcedure.query(async () => {
    await startTonProcessor();
  }),
  jettonBalance: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      if (!input.address)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Address is required" });
      console.log(input.address, "input.address");
      const balance = await getJettonBalance(
        process.env.JETTON_MASTER_ADDRESS!,
        input.address,
        process.env.TON_CENTER_API_KEY!,
      );
      console.log(balance, "balance");
      return fromNano(balance.toString());
    }),
} satisfies TRPCRouterRecord;
