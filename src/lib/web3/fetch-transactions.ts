import { Address, JettonMaster, TonClient, Transaction } from "@ton/ton";

// Initialize TonClient with the provided API key
export const tonClient = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: "cfa6db13d70d8bafa1023e40659f63c9f50cfc1d483b04990592a987c4710f08",
});

const wallet = Address.parse(process.env.OUR_WALLET_ADDRESS as string);

const batchSize = 10;

const JETTONS_INFO = {
  FRU: {
    address: "EQA0zyGf1H8KFo8P6kA-cQ3hLWE9Mb_XCmqozcnIXG4ioSru",
    decimals: 9,
  },
} as const;

export const prepareFRU = async () => {
  const jettonMaster = new JettonMaster(Address.parse(JETTONS_INFO.FRU.address));

  const jettonWalletAddress = await jettonMaster.getWalletAddress(
    tonClient.provider(wallet),
    wallet,
  );

  return {
    jettonMaster,
    jettonWalletAddress,
  };
};

export const fetchTransactionsUpToLt = async (processedLt: bigint) => {
  const allTransactions: Transaction[] = [];
  let lastLt: string | undefined;
  let lastHash: string | undefined;
  let continueFetching = true;
  let currentBatch: Transaction[] = [];

  try {
    while (continueFetching) {
      // Get transactions using TonClient
      const fetchParams: any = {
        limit: batchSize,
        archival: true,
      };

      if (lastLt && lastHash) {
        fetchParams.lt = lastLt;
        fetchParams.hash = lastHash;
      }

      // Fetch transactions
      currentBatch = await tonClient.getTransactions(wallet, fetchParams);

      // If no transactions returned or empty array, break the loop
      if (!currentBatch || currentBatch.length === 0) {
        break;
      }

      // Process each transaction in the current batch
      for (const tx of currentBatch) {
        if (tx.lt <= processedLt) {
          continueFetching = false;
          break;
        }

        allTransactions.push(tx);

        lastLt = tx.lt.toString();
        lastHash = tx.raw.hash().toString("base64");
      }

      // If we got fewer transactions than requested, we've reached the end
      if (currentBatch.length < batchSize) {
        break;
      }
    }

    return allTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
