import { alliancesRouter } from "../alliances";
import { authRouter } from "../auth";
import { farmRouter } from "../farm";
import { router } from "../main";
import { tgTxRouter } from "../tgTx";
import { web3Router } from "../web3";
import { createTRPCRouter } from "./index";

export const trpcRouter = createTRPCRouter({
  main: router,
  auth: authRouter,
  alliances: alliancesRouter,
  farms: farmRouter,
  web3: web3Router,
  tgTx: tgTxRouter,
});

export type TRPCRouter = typeof trpcRouter;
