import {
  getIsProcessing,
  getLastTxRecord,
  setIsProcessing,
  setLastTxRecord,
} from "./db-repo";
import { fetchTransactionsUpToLt } from "./fetch-transactions";
import { handlePayment } from "./handle-payment";
import { processTonTransaction } from "./tx-processor";

export const startTonProcessor = async () => {
  if (await getIsProcessing()) {
    return;
  }

  await setIsProcessing(true);

  const lastTxLt = await getLastTxRecord();

  const transactions = await fetchTransactionsUpToLt(lastTxLt);

  console.log(`[ton payments] fetched ${transactions.length} transactions`);

  if (transactions.length === 0) {
    await setIsProcessing(false);
    return;
  }

  for (const tx of transactions) {
    await processTonTransaction(tx, handlePayment);
  }

  const firstTxLt = transactions[0].lt;

  await setLastTxRecord(firstTxLt);
  await setIsProcessing(false);
};
