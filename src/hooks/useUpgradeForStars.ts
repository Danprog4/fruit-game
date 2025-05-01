import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";

// Add TypeScript declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openInvoice: (invoiceUrl: string, callback?: (status: string) => void) => void;
        onEvent: (eventName: string, callback: (data: any) => void) => void;
      };
    };
  }
}

export const useUpgradeForStars = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
      onSuccess: (data) => {
        try {
          if (window.Telegram?.WebApp) {
            // Открываем инвойс без колбэка, будем использовать onEvent
            window.Telegram.WebApp.openInvoice(data.invoiceUrl);
          } else {
            window.open(data.invoiceUrl, "_blank");
            toast.info("Инвойс открыт в новом окне");
          }
        } catch (error) {
          console.error("Error opening invoice:", error);
          toast.error("Ошибка при открытии инвойса");
        }
      },
      onError: (error) => {
        toast.error(
          `Ошибка при создании инвойса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        );
      },
    }),
  );

  // Настраиваем обработчик события закрытия инвойса
  useEffect(() => {
    const handleInvoiceClosed = (payment: { status: string }) => {
      if (payment.status === "paid") {
        // Вызываем обновление статуса после успешной оплаты
        upgradeForStars.mutate();
        toast.success("Оплата прошла успешно");
      } else if (payment.status === "cancelled" || payment.status === "failed") {
        toast.error("Платеж не был завершен");
      }
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("invoiceClosed", handleInvoiceClosed);
    }

    // Очистка обработчика при размонтировании компонента
    return () => {
      if (window.Telegram?.WebApp) {
        // Здесь должен быть метод для удаления обработчика, если он есть в API
        // window.Telegram.WebApp.offEvent("invoiceClosed", handleInvoiceClosed);
      }
    };
  }, [upgradeForStars]);

  // Функция для покупки звезды
  const handleUpgradeForStars = useCallback(() => {
    createInvoice.mutate();
  }, [createInvoice]);

  return {
    upgradeForStars: {
      mutate: handleUpgradeForStars,
      isPending: upgradeForStars.isPending || createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
