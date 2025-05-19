import { Address, JettonMaster, JettonWallet, TonClient } from "@ton/ton";

export async function getJettonBalance(jetton: string, owner: string, apiKey: string) {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey,
  });

  const jettonMaster = client.open(JettonMaster.create(Address.parse(jetton)));

  const userAddress = Address.parse(owner);
  const jettonWalletAddress = await jettonMaster.getWalletAddress(userAddress);
  const jettonWallet = client.open(JettonWallet.create(jettonWalletAddress));

  return await jettonWallet.getBalance();
}

// const balance = await getJettonBalance(
//   'jetton master address',
//   'user wallet address',
//   'toncenter api key'
// );
// console.log(balance);
