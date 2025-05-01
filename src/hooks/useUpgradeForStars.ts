import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
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
            // Просто открываем инвойс без колбэка
            // Обработка результата происходит в компоненте через onEvent
            window.Telegram.WebApp.openInvoice(data.invoiceUrl);
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
