import { Address, Transaction } from "@ton/ton";

export function trimDecimals(value: bigint, decimals: number) {
  if (isNaN(Number(value))) {
    throw new Error("Invalid number");
  }

  const parts = value.toString().split(".");

  if (parts.length === 2 && parts[1].length > decimals) {
    parts[1] = parts[1].slice(0, decimals); // Slice the decimal part
  }

  return parseFloat(parts.join("."));
}

export const processTonTransaction = async (
  tx: Transaction,
  onDeposit: ({
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
  }) => void,
) => {
  const hash = tx.raw.hash().toString("hex");

  console.log(hash, "hash");

  const uqToAddress = Address.parse(tx.inMessage?.info.dest?.toString() ?? "").toString({
    bounceable: false,
  });

  if (uqToAddress !== process.env.OUR_WALLET_ADDRESS) {
    console.log(
      `[ton payments] TO address is not our wallet address, return ${uqToAddress}`,
      { hash },
    );
    return;
  }

  const inMessage = tx.inMessage;

  if (!inMessage) {
    console.log(`[ton payments] No in message in tx, return`, { hash });
    return;
  }

  const slice = inMessage.body.beginParse();

  const op = slice.loadUint(32);
  if (op !== 0x7362d09c) {
    console.log(`[ton payments] Op is not 0x7362d09c, return`, { hash });
    return;
  }

  slice.loadUint(64);
  const amount = slice.loadCoins();
  const from = slice.loadAddress();
  const message = slice.loadMaybeStringRefTail();

  if (!from) {
    console.log(`[ton payments] No from address in tx, return`, { hash });
    return;
  }

  const uqFromAddress = Address.parse(from.toString()).toString({
    bounceable: false,
  });

  console.log(`[ton payments] from ${uqFromAddress}`, { hash });

  if (!message) {
    console.log(`[ton payments] No message in tx, return`, { hash });
    return;
  }

  const [name, telegramChannelUrl, imageUUID] = message.split("#");

  onDeposit({
    amount,
    message,
    walletAddress: uqFromAddress,
    name,
    telegramChannelUrl,
    imageUUID,
  });
};
