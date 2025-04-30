import { createAPIFileRoute } from "@tanstack/react-start/api";
import { startTonProcessor } from "~/lib/web3/ton-payment";

export const APIRoute = createAPIFileRoute("/api/txs")({
  GET: async () => {
    await startTonProcessor();
    return new Response("OK!");
  },
});
