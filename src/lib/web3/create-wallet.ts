import TonWeb from "tonweb";
import nacl from "tweetnacl";

(async () => {
  const tonwebInstance = new TonWeb();

  // Create a key pair
  const keyPair = nacl.sign.keyPair();

  // Extract the public key from the key pair
  const publicKey = keyPair.publicKey;
  const publicKeyHex = Buffer.from(publicKey).toString("hex");

  // Extract the private key from the key pair
  const privateKey = keyPair.secretKey;
  const privateKeyHex = Buffer.from(privateKey).toString("hex");

  // Create a wallet using the public key as Uint8Array
  const wallet = tonwebInstance.wallet.create({ publicKey });

  // Get the wallet address
  const walletAddress = (await wallet.getAddress()).toString(true, true, true);

  console.log("Wallet address:", walletAddress);
  console.log("Public key (hex):", publicKeyHex);
  console.log("Private key (hex):", privateKeyHex);
})();
