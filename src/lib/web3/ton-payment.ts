import { fetchTransactionsUpToLt } from "./fetch-transactions";
import { handlePayment } from "./handle-payment";
import { processTonTransaction } from "./tx-processor";

let lastTxLt = BigInt(0);

const getLastTxRecord = async () => {
  return lastTxLt;
};

const setLastTxRecord = async (lt: bigint) => {
  lastTxLt = lt;
};

let processing = false;

export const startTonProcessor = async () => {
  if (processing) {
    return;
  }

  processing = true;

  const lastTxLt = await getLastTxRecord();

  const transactions = await fetchTransactionsUpToLt(lastTxLt);

  console.log(`[ton payments] fetched ${transactions.length} transactions`);

  if (transactions.length === 0) {
    processing = false;
    return;
  }

  for (const tx of transactions) {
    await processTonTransaction(tx, handlePayment);
  }

  const firstTxLt = transactions[0].lt;

  await setLastTxRecord(firstTxLt);

  processing = false;
};
