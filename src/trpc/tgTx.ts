import { handleCreateInvoice } from "~/create-invoice";
import { createTRPCRouter, procedure } from "./init";

export const tgTxRouter = createTRPCRouter({
  createInvoice: procedure.mutation(async ({ ctx }) => {
    return await handleCreateInvoice(ctx.userId);
  }),
});
