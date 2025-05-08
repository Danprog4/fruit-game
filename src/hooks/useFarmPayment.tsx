import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { useTRPC } from "~/trpc/init/react";
import { useCheckWalletConnected } from "./useCheckWalletConnected";
import { usePayment } from "./usePayment";

export const useFarmPayment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const paymentMutation = usePayment();
  const buyFarm = useMutation(trpc.farms.buyFarm.mutationOptions());
  const { checkWalletConnected } = useCheckWalletConnected();

  const buyFarmForTONMutation = useMutation({
    mutationFn: async (farmId: string) => {
      if (!checkWalletConnected()) return;
      const memo = await buyFarm.mutateAsync({ farmId });
      const farm = FARMS_CONFIG.find((f) => f.id === farmId);
      if (!farm) throw new Error("Farm not found");
      await paymentMutation.mutateAsync({ amount: farm.priceInFRU, memo });
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
      toast.error("Упс, что-то пошло не так.");
    },
  });

  const buyFarmForFRUMutation = useMutation(
    trpc.farms.buyFarmForFRU.mutationOptions({
      onSuccess: () => {
        toast.success("Вы успешно купили ферму");
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("К сожалению, у вас недостаточно баланса");
      },
    }),
  );

  return {
    buyFarmForTON: buyFarmForTONMutation,
    buyFarmForFRU: buyFarmForFRUMutation,
  };
};
