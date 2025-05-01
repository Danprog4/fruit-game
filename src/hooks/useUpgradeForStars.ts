import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";

// Add TypeScript declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openInvoice: (invoiceUrl: string, callback: (status: string) => void) => void;
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

  // Функция для покупки звезды
  const handleUpgradeForStars = useCallback(() => {
    if (window.Telegram?.WebApp) {
      createInvoice.mutate();
    } else {
      toast.error("Вы не можете оплатить звезду в браузере");
    }
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
