import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";

// Add TypeScript declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openInvoice: (invoiceUrl: string) => void;
        onEvent: (eventName: string, callback: (data: any) => void) => void;
      };
    };
  }
}

export const useUpgradeForStars = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Function to be called when payment is successful
  let onPaymentSuccess: (() => void) | null = null;

  // Мутация для обновления статуса после оплаты
  const upgradeForStars = useMutation(
    trpc.tgTx.upgradeForStars.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        toast.success("Ферма успешно прокачана");
      },
      onError: () => {
        toast.error("Ошибка при обновлении статуса");
      },
    }),
  );

  // Мутация для создания инвойса
  const createInvoice = useMutation(
    trpc.tgTx.createInvoice.mutationOptions({
      onError: (error) => {
        toast.error(
          `Ошибка при создании инвойса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        );
      },
    }),
  );

  useEffect(() => {
    if (!createInvoice.data) return;

    try {
      if (window.Telegram?.WebApp) {
        console.log("openInvoice()", createInvoice.data.invoiceUrl);
        window.Telegram.WebApp.openInvoice(createInvoice.data.invoiceUrl);
      }
    } catch (error) {
      console.error("Error opening invoice:", error);
      toast.error("Ошибка при открытии инвойса");
    }
  }, [createInvoice.data]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("invoiceClosed", (payment: { status: string }) => {
        if (payment.status === "paid") {
          toast.success("Платеж успешно выполнен", { id: "payment-successful" });
          queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });

          // Call the callback if it exists
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        } else if (payment.status === "cancelled" || payment.status === "failed") {
          toast.error("Платеж не удался, попробуйте снова", { id: "payment-failed" });
        }
      });
    }
  }, [queryClient]);

  // Функция для покупки звезды
  const handleUpgradeForStars = useCallback(
    (callback?: () => void) => {
      // Save the callback to be called when payment is successful
      onPaymentSuccess = callback || null;
      createInvoice.mutate();
    },
    [createInvoice],
  );

  return {
    upgradeForStars: {
      mutate: handleUpgradeForStars,
      isPending: upgradeForStars.isPending || createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
