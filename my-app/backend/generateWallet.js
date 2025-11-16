// generateWallet.js
const { Keypair } = require("@solana/web3.js");

const kp = Keypair.generate();

console.log("Public key:", kp.publicKey.toBase58());
console.log("Secret key (Uint8Array):");
console.log(JSON.stringify(Array.from(kp.secretKey)));
