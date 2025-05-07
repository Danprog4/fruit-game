import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoice } from "@telegram-apps/sdk";
import { toast } from "sonner";
import { getNextFarmLevel } from "~/lib/dm-farm.config";
import { useTRPC } from "~/trpc/init/react";

export const useUpgradeForStars = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const dmFarmLevel = user?.dmFarmLevel;
  const nextFarmPriceInTgStars = getNextFarmLevel(dmFarmLevel ?? 1)?.priceInTgStars;

  const createInvoice = useMutation(
    trpc.tgTx.createInvoice.mutationOptions({
      onSuccess: (data) => {
        if (invoice.open.isAvailable()) {
          const promise = invoice.open(data.invoiceUrl, "url").then((status) => {
            if (status === "paid") {
              toast.success("Оплата прошла успешно");
              queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
            } else if (status === "cancelled" || status === "failed") {
              toast.error("Платеж не был завершен");
            }
          });
        }
      },
      onError: () => {
        toast.error("Ошибка при создании инвойса");
      },
    }),
  );

  return {
    upgradeForStars: {
      mutate: () => {
        createInvoice.mutate({ amount: nextFarmPriceInTgStars ?? 0 });
      },
      isPending: createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
