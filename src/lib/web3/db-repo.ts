import { eq } from "drizzle-orm";
import { db } from "../db";
import { NewBlockchainPayment, blockchainPaymentsTable, usersTable } from "../db/schema";

export const getUserByWalletAddress = async (walletAddress: string) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, walletAddress));
  return user[0];
};

export const createBlockchainPayment = async (payment: NewBlockchainPayment) => {
  const [row] = await db.insert(blockchainPaymentsTable).values(payment).returning();
  return row;
};

export const getBlockchainPaymentById = async (id: string) => {
  const payment = await db
    .select()
    .from(blockchainPaymentsTable)
    .where(eq(blockchainPaymentsTable.id, id))
    .limit(1);
  return payment[0];
};

export const isBlockchainPaymentCompleted = async (id: string) => {
  const payment = await getBlockchainPaymentById(id);
  return payment?.status === "completed";
};

export const changeBlockchainPaymentStatus = async (
  id: string,
  status: "pending" | "completed" | "failed",
) => {
  return db
    .update(blockchainPaymentsTable)
    .set({ status })
    .where(eq(blockchainPaymentsTable.id, id))
    .returning();
};

// Helpers for dev only
export const deleteAllTonPayments = async () => {
  await db.delete(blockchainPaymentsTable);
};

// --- REDIS TO STORE LAST PROCESSED TX lt bigint ---

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const setLastTxRecord = async (lt: bigint) => {
  await redis.set("lastTxLt", lt.toString());
};

export const getLastTxRecord = async (): Promise<bigint> => {
  const lastTxLt = await redis.get<string>("lastTxLt");
  return lastTxLt ? BigInt(lastTxLt) : 0n;
};

export const getIsProcessing = async (): Promise<boolean> => {
  const isProcessing = await redis.get<string>("isProcessing");
  return isProcessing === "true";
};

export const setIsProcessing = async (isProcessing: boolean) => {
  await redis.set("isProcessing", isProcessing.toString());
};

export const getOrCreateBlockchainPayment = async ({
  id,
  amount,
  walletAddress,
  txType,
}: {
  id: string;
  amount: bigint;
  walletAddress: string;
  txType: string;
}) => {
  let blockchainPayment = await getBlockchainPaymentById(id);

  if (!blockchainPayment) {
    console.log(
      "[ton payments] No payment tx found, try to find user by wallet and create payment",
    );

    const user = await getUserByWalletAddress(walletAddress);

    if (!user) {
      console.log("[ton payments] User not found for source address", {
        id,
        walletAddress,
      });

      return;
    }

    blockchainPayment = await createBlockchainPayment({
      id,
      userId: user.id,
      fruAmount: amount,
      txType: txType,
      status: "pending",
    });
  }

  return blockchainPayment;
};
