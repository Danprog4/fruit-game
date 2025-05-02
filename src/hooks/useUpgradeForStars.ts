import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoice } from "@telegram-apps/sdk";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openInvoice: (invoiceUrl: string, callback: (status: string) => void) => void;
        onEvent: (eventName: string, callback: (data: any) => void) => void;
      };
    };
  }
}

export const useUpgradeForStars = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
        createInvoice.mutate();
      },
      isPending: createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
