import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AllianceLevelType,
  getNextAllianceLevelObject,
} from "~/lib/alliance-levels.config";
import { Alliance } from "~/lib/db/schema";
import { useTRPC } from "~/trpc/init/react";
import { useCheckWalletConnected } from "./useCheckWalletConnected";
import { usePayment } from "./usePayment";

interface UpgradeParams {
  allianceId: number;
  type: AllianceLevelType;
  alliance: Alliance;
}

export const useAllianceUpgrade = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const paymentMutation = usePayment();

  const createUpgradeAlliancePayment = useMutation(
    trpc.alliances.createUpgradeAlliancePayment.mutationOptions(),
  );
  const upgradeAlliance = useMutation(trpc.alliances.upgradeAlliance.mutationOptions());

  const { checkWalletConnected } = useCheckWalletConnected();

  const upgradeWithTON = useMutation({
    mutationFn: async ({ allianceId, type, alliance }: UpgradeParams) => {
      if (!checkWalletConnected()) return;
      const memo = await createUpgradeAlliancePayment.mutateAsync({
        allianceId,
        type,
      });

      if (!alliance) {
        throw new Error("Alliance not found");
      }

      const nextLevel = getNextAllianceLevelObject(type, alliance.levels[type] || 0);

      if (!nextLevel) {
        throw new Error("Alliance is at max level");
      }

      if (!nextLevel) throw new Error("Alliance is at max level");
      await paymentMutation.mutateAsync({ amount: nextLevel.price, memo });
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
      toast.error("Не удалось создать платеж для улучшения альянса");
    },
  });

  const upgradeWithFRU = useMutation({
    mutationFn: async ({ allianceId, type }: UpgradeParams) => {
      await upgradeAlliance.mutateAsync({ allianceId, type });
      queryClient.invalidateQueries({ queryKey: trpc.alliances.getAlliances.queryKey() });
    },
    onSuccess: () => {
      toast.success("Уровень прокачен");
      queryClient.invalidateQueries({ queryKey: trpc.alliances.getAlliances.queryKey() });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("У вас недостаточно средств");
    },
  });

  return {
    upgradeWithTON,
    upgradeWithFRU,
  };
};
