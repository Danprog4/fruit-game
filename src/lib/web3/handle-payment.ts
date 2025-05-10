import { eq } from "drizzle-orm";

import { upgradeAlliance } from "../alliances/db-repo";
import { db } from "../db";
import { alliancesTable, usersTable } from "../db/schema";
import { incrementUserFarm } from "../farm/db-repo";
import { FARMS_CONFIG } from "../farms.config";
import {
  ALL_TX_TYPES,
  ALLIANCE_TX_TYPE_MAPPING,
  ALLIANCE_TX_TYPES,
  AllianceTxType,
} from "../tx-type.config";
import { changeBlockchainPaymentStatus, getOrCreateBlockchainPayment } from "./db-repo";
// memo of tx is this format:
// ${txType} #nanoid
// example: "Straberry Farm #BfRR3Ki3BJP2ODHLM_zGA"

export const handlePayment = async ({
  amount,
  message,
  walletAddress,
  name,
  telegramChannelUrl,
  imageUUID,
}: {
  amount: bigint;
  message: string;
  walletAddress: string;
  name: string;
  telegramChannelUrl: string;
  imageUUID: string;
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

  const farm = FARMS_CONFIG.find((f) => f.txType === txType);

  if (farm) {
    await incrementUserFarm(user.id, farm.id);
  }

  const isAlliancePayment = ALLIANCE_TX_TYPES.includes(txType as AllianceTxType);
  const allianceUpgradeType = ALLIANCE_TX_TYPE_MAPPING[txType as AllianceTxType];

  console.log({
    isAlliancePayment,
    allianceId: user.allianceId,
    allianceUpgradeType,
    txType,
  });
  if (isAlliancePayment && user.allianceId) {
    console.log("UPGRADING ALLIANCE");
    await upgradeAlliance(user.allianceId, allianceUpgradeType);
  }

  const isAllianceCreation = txType === "alliance";

  console.log(isAllianceCreation, "isAllianceCreation");

  if (isAllianceCreation) {
    console.log("CREATING ALLIANCE", { userId: user.id, txType });
    try {
      console.log("Alliance creation data:", {
        name,
        telegramChannelUrl,
        imageUUID,
        userId: user.id,
      });

      const [alliance] = await db
        .insert(alliancesTable)
        .values({
          name,
          telegramChannelUrl,
          avatarId: imageUUID,
          ownerId: user.id,
          levels: {
            capacity: 0,
            coefficient: 0,
            profitability: 0,
          },
        })
        .returning();

      console.log("Alliance created successfully:", {
        allianceId: alliance.id,
        allianceName: alliance.name,
      });

      console.log("Updating user with alliance ID:", {
        userId: user.id,
        allianceId: alliance.id,
      });

      await db
        .update(usersTable)
        .set({
          allianceId: alliance.id,
        })
        .where(eq(usersTable.id, user.id));

      console.log("User updated successfully with alliance ID");
      return alliance;
    } catch (error) {
      console.error("ERROR CREATING ALLIANCE:", error);
      console.log("Alliance creation failed with data:", {
        name,
        telegramChannelUrl,
        imageUUID,
        userId: user.id,
      });
      throw error; // Re-throw to allow upstream error handling
    }
  }
};
