import { Address, beginCell, JettonMaster, toNano, TonClient } from "@ton/ton";
import { SendTransactionRequest, useTonWallet } from "@tonconnect/ui-react";
import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

const client = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
});

const JETTON_MASTER_ADDRESS = import.meta.env.VITE_JETTON_ADDRESS;
const OUR_ADDRESS = import.meta.env.VITE_OUR_ADDRESS;

console.log("JETTON_MASTER_ADDRESS:", JETTON_MASTER_ADDRESS);
console.log("OUR_ADDRESS:", OUR_ADDRESS);

export const usePrepareJettonTx = () => {
  const wallet = useTonWallet();
  const walletAddress = wallet?.account.address;
  const [cachedJettonWalletAddress, setCachedJettonWalletAddress] = useLocalStorage<
    string | null
  >("cachedJettonWalletAddress", null);

  const getJettonWalletAddress = async () => {
    if (!walletAddress) return;
    if (cachedJettonWalletAddress) return cachedJettonWalletAddress;

    const jettonMasterContract = client.open(
      JettonMaster.create(Address.parse(JETTON_MASTER_ADDRESS)),
    );
    const jettonWalletAddress = await jettonMasterContract.getWalletAddress(
      Address.parseRaw(walletAddress),
    );
    setCachedJettonWalletAddress(jettonWalletAddress.toString());
    return jettonWalletAddress.toString();
  };

  const getJettonTx = useCallback(
    async (amount: number, memo: string) => {
      if (!walletAddress) return;
      const jettonWalletAddress = await getJettonWalletAddress();
      if (!jettonWalletAddress) return;

      const destinationAddress = Address.parse(OUR_ADDRESS);
      const senderAddress = Address.parseRaw(walletAddress);
      const forwardPayload = beginCell().storeUint(0, 32).storeStringTail(memo).endCell();

      const body = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(toNano(amount))
        .storeAddress(destinationAddress)
        .storeAddress(senderAddress)
        .storeBit(0)
        .storeCoins(toNano("0.0001"))
        .storeBit(1)
        .storeRef(forwardPayload)
        .endCell();

      return {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: jettonWalletAddress.toString(), // sender jetton wallet
            amount: toNano("0.05").toString(), // for commission fees, excess will be returned
            payload: body.toBoc().toString("base64"), // payload with jetton transfer and comment body
          },
        ],
      } satisfies SendTransactionRequest;
    },
    [walletAddress],
  );

  return { getJettonTx };
};
