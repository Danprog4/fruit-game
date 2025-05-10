import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/init/react";
import { useCheckWalletConnected } from "./useCheckWalletConnected";
import { usePayment } from "./usePayment";

interface CreateParams {
  name: string;
  telegramChannelUrl: string;
  imageBase64: string;
}

export const useAllianceCreate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const paymentMutation = usePayment();

  const createAlliance = useMutation(
    trpc.alliances.createAllianceForFRU.mutationOptions(),
  );
  const createAllianceForTON = useMutation(
    trpc.alliances.createAllianceForTON.mutationOptions(),
  );

  const { checkWalletConnected } = useCheckWalletConnected();

  const createWithTON = useMutation({
    mutationFn: async ({ name, telegramChannelUrl, imageBase64 }: CreateParams) => {
      if (!checkWalletConnected()) return;
      const memo = await createAllianceForTON.mutateAsync({
        name,
        telegramChannelUrl,
        imageBase64,
      });

      if (!memo) {
        throw new Error("Memo not found");
      }

      await paymentMutation.mutateAsync({ amount: 40000, memo });
      return memo;
    },
    onSuccess: () => {
      toast.success(
        <div>
          Транзакция отправлена!{" "}
          <a
            onClick={() => {
              navigate({ to: "/wallet" });
            }}
            className="cursor-pointer underline"
          >
            Перейти в кошелек
          </a>
        </div>,
      );
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Не удалось создать альянс");
    },
  });

  const createWithFRU = useMutation({
    mutationFn: async ({ name, telegramChannelUrl, imageBase64 }: CreateParams) => {
      await createAlliance.mutateAsync({ name, telegramChannelUrl, imageBase64 });
    },
    onSuccess: () => {
      toast.success("Альянс создан");
      queryClient.invalidateQueries({ queryKey: trpc.alliances.getAlliances.queryKey() });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("У вас недостаточно средств");
    },
  });

  return {
    createWithTON,
    createWithFRU,
  };
};
