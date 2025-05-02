import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";

// Add TypeScript declaration for Telegram WebApp
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

  const upgradeForStars = useMutation(
    trpc.tgTx.upgradeForStars.mutationOptions({
      onSuccess: () => {
        toast.success("Оплата прошла успешно");
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
      },
      onError: () => {
        toast.error("Ошибка при оплате");
      },
    }),
  );

  const createInvoice = useMutation(
    trpc.tgTx.createInvoice.mutationOptions({
      onSuccess: (data) => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openInvoice(data.invoiceUrl, (status) => {
            if (status === "paid") {
              upgradeForStars.mutate();
              toast.success("Оплата прошла успешно");
            } else {
              toast.error("Платеж не был завершен");
            }
          });
        } else {
          window.open(data.invoiceUrl, "_blank");
          toast.info("Инвойс открыт в новом окне");
        }
      },
      onError: () => {
        toast.error("Ошибка при создании инвойса");
      },
    }),
  );

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("invoiceClosed", (payment) => {
        if (payment.status === "paid") {
          upgradeForStars.mutate();
          toast.success("Оплата прошла успешно");
        } else if (payment.status === "cancelled" || payment.status === "failed") {
          toast.error("Платеж не был завершен");
        }
      });
    }
  }, []);

  return {
    upgradeForStars: {
      mutate: () => {
        // If we're in Telegram, create an invoice first
        if (window.Telegram?.WebApp) {
          createInvoice.mutate();
        } else {
          // Otherwise directly call the upgrade mutation
          toast.error("Вы не можете оплатить звезду в браузере");
        }
      },
      isPending: upgradeForStars.isPending || createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
