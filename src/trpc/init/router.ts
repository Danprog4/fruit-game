import { alliancesRouter } from "../alliances";
import { authRouter } from "../auth";
import { farmRouter } from "../farm";
import { router } from "../main";
import { createTRPCRouter } from "./index";

export const trpcRouter = createTRPCRouter({
  main: router,
  auth: authRouter,
  alliances: alliancesRouter,
  farms: farmRouter,
});

export type TRPCRouter = typeof trpcRouter;
