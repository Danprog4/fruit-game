import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { incrementUserFarm } from "../farm/db-repo";
import { FARMS_CONFIG } from "../farms.config";
import { ALL_TX_TYPES } from "../tx-type.config";
import { changeBlockchainPaymentStatus, getOrCreateBlockchainPayment } from "./db-repo";

// memo of tx is this format:
// ${txType} #nanoid
// example: "Straberry Farm #BfRR3Ki3BJP2ODHLM_zGA"

export const handlePayment = async ({
  amount,
  message,
  walletAddress,
}: {
  amount: bigint;
  message: string;
  walletAddress: string;
}) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.walletAddress, walletAddress),
  });

  if (!user) {
    console.log("[handle_payment] User not found", { walletAddress });
    return;
  }

  const txType = ALL_TX_TYPES.find((type) => message.includes(type));
  const id = message.split("#")[1];

  if (!txType) {
    console.log("[handle_payment] Invalid transaction type in message", { message });
    return;
  }

  if (!id) {
    console.log("[handle_payment] Invalid transaction id in message", { message });
    return;
  }

  const blockchainPayment = await getOrCreateBlockchainPayment({
    id,
    amount,
    walletAddress,
    txType,
  });

  if (!blockchainPayment) {
    console.log("[handle_payment] Blockchain payment not found", { id });
    return;
  }

  if (blockchainPayment.status !== "pending") {
    console.log(`[TON_PROCESSOR] Ton payment status is not pending`, { id });
    return;
  }

  const awaitedAmountOfFru = blockchainPayment.fruAmount;

  if (awaitedAmountOfFru !== amount) {
    console.log("[handle_payment] Awaited amount of fru is not equal to the amount", {
      awaitedAmountOfFru,
      amount,
    });

    await changeBlockchainPaymentStatus(id, "failed");

    return;
  }

  await changeBlockchainPaymentStatus(id, "completed");

  const farmId = FARMS_CONFIG.find((f) => f.txType === txType)?.id;

  if (!farmId) {
    console.log("[handle_payment] Farm not found", { txType });
    return;
  }

  await incrementUserFarm(user.id, farmId);
};
