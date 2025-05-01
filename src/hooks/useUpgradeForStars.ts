import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // Убедимся, что Telegram SDK полностью загружен
  useEffect(() => {
    const checkTelegramReady = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        setIsTelegramReady(true);
      } else {
        // Если Telegram SDK еще не загружен, повторим проверку через небольшой интервал
        setTimeout(checkTelegramReady, 100);
      }
    };

    checkTelegramReady();
  }, []);

  // Мутация для обновления статуса после оплаты
  const upgradeForStars = useMutation(
    trpc.tgTx.upgradeForStars.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
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
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openInvoice(data.invoiceUrl, (status) => {
            if (status === "paid") {
              // Вызываем обновление статуса после успешной оплаты
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
      onError: (error) => {
        toast.error(
          `Ошибка при создании инвойса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        );
      },
    }),
  );

  // Общий обработчик событий invoiceClosed
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("invoiceClosed", (payment) => {
        if (payment.status === "paid") {
          queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        } else if (payment.status === "cancelled" || payment.status === "failed") {
          toast.error("Платеж не удался, попробуйте снова", { id: "payment-failed" });
        }
      });
    }
  }, [queryClient, trpc.main.getUser]);

  // Функция для покупки звезды
  const handleUpgradeForStars = useCallback(() => {
    // Проверяем, что Telegram SDK точно готов
    if (isTelegramReady) {
      createInvoice.mutate();
    } else {
      // Проверим еще раз наличие Telegram SDK перед выдачей ошибки
      if (window.Telegram?.WebApp) {
        createInvoice.mutate();
      } else {
        toast.error("Не удалось получить доступ к Telegram WebApp");
      }
    }
  }, [createInvoice, isTelegramReady]);

  return {
    upgradeForStars: {
      mutate: handleUpgradeForStars,
      isPending: upgradeForStars.isPending || createInvoice.isPending,
    },
    createInvoice,
    isCreatingInvoice: createInvoice.isPending,
  };
};
