import { alliancesRouter } from "../alliances";
import { authRouter } from "../auth";
import { router } from "../main";
import { createTRPCRouter } from "./index";

export const trpcRouter = createTRPCRouter({
  main: router,
  auth: authRouter,
  alliances: alliancesRouter,
});

export type TRPCRouter = typeof trpcRouter;
