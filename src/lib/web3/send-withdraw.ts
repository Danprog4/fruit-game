import { Address, beginCell, internal, toNano, type OpenedContract } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";

const client = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_CENTER_API_KEY,
});

const JETTON_MASTER_ADDRESS = process.env.JETTON_MASTER_ADDRESS as string;
const FORWARD_TON_AMOUNT = toNano("0.02");
const TRANSACTION_GAS_FEE = toNano("0.1");

export async function transferJetton(
  txId: string,
  recipientAddressString: string,
  amount: bigint,
) {
  const mnemonics = process.env.MNEMONICS?.split(" ");
  if (!mnemonics) {
    throw new Error("MNEMONICS environment variable is not set");
  }
  const keyPair = await mnemonicToPrivateKey(mnemonics);
  const senderWallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });
  const senderContract: OpenedContract<WalletContractV4> = client.open(senderWallet);
  const senderAddress = senderContract.address;
  console.log(`Sender Address: ${senderAddress.toString()}`);

  let senderJettonWalletAddress: Address;
  try {
    console.log(
      `Querying Jetton Master ${JETTON_MASTER_ADDRESS} for sender's Jetton Wallet...`,
    );
    const response = await client.runMethod(
      Address.parse(JETTON_MASTER_ADDRESS),
      "get_wallet_address",
      [
        {
          type: "slice",
          cell: beginCell().storeAddress(senderAddress).endCell(),
        },
      ],
    );
    senderJettonWalletAddress = response.stack.readAddress();
    console.log(`Sender's Jetton Wallet: ${senderJettonWalletAddress.toString()}`);
  } catch (error: unknown) {
    console.error(
      `Error getting Jetton Wallet address for ${senderAddress.toString()} from master ${JETTON_MASTER_ADDRESS}:`,
      error instanceof Error ? error.message : String(error),
    );
    throw new Error(
      "Failed to get sender's Jetton Wallet address. Ensure JETTON_MASTER_ADDRESS is correct and the sender has interacted with this Jetton before.",
    );
  }

  const recipientAddress = Address.parse(recipientAddressString);
  const jettonAmount = amount;

  const forwardPayload = beginCell().storeUint(0, 32).storeStringTail(txId).endCell();

  const messageBody = beginCell()
    .storeUint(0x0f8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(jettonAmount)
    .storeAddress(recipientAddress)
    .storeAddress(senderAddress)
    .storeMaybeRef(null)
    .storeCoins(FORWARD_TON_AMOUNT)
    .storeMaybeRef(forwardPayload)
    .endCell();

  const internalMessage = internal({
    to: senderJettonWalletAddress,
    value: TRANSACTION_GAS_FEE,
    bounce: true,
    body: messageBody,
  });

  const seqno = await senderContract.getSeqno();
  console.log(`Current Seqno: ${seqno}`);
  console.log(`Sending ${amount} Jettons to ${recipientAddress.toString()}...`);

  try {
    const result = await senderContract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [internalMessage],
    });
    console.log("Transaction sent successfully!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error sending transfer:", error);
    throw error;
  }
}
