import { useMutation } from "@tanstack/react-query";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { usePrepareJettonTx } from "~/lib/web3/usePrepareTx";
import { useTRPC } from "~/trpc/init/react";

export const usePayment = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { getJettonTx } = usePrepareJettonTx();
  const trpc = useTRPC();

  const checkAndUpdatePaymentStatus = useMutation(
    trpc.farms.checkAndUpdatePaymentStatus.mutationOptions(),
  );
  const cancelPayment = useMutation(trpc.farms.cancelPayment.mutationOptions());

  const sendPayment = async ({ amount, memo }: { amount: number; memo: string }) => {
    try {
      const jettonTx = await getJettonTx(amount, memo);
      if (!jettonTx) {
        throw new Error("Jetton transaction not found");
      }
      await tonConnectUI.sendTransaction(jettonTx);
      const paymentId = memo.split("#")[1];
      if (paymentId) {
        setTimeout(
          async () => {
            try {
              await checkAndUpdatePaymentStatus.mutateAsync({ paymentId });
            } catch (error) {
              console.error("Failed to check payment status:", error);
            }
          },
          3 * 60 * 1000,
        );
      }
      return { success: true };
    } catch (error) {
      console.error("Transaction failed or was cancelled:", error);
      const paymentId = memo.split("#")[1];
      if (paymentId) {
        await cancelPayment.mutateAsync({ paymentId });
      }
      throw error;
    }
  };

  return useMutation({ mutationFn: sendPayment });
};
