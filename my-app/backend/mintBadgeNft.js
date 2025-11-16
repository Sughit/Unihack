// backend/mintBadgeNft.js

// Pentru demo / hackathon:
// simulăm un "mint" pe blockchain, fără să mai chemăm Solana deloc.
// Returnăm un mintAddress și un txSignature "fake", dar unice,
// ca să le putem salva în DB și arăta frumos în UI.

async function mintBadgeNft(userWalletAddress, badgeType) {
  const timestamp = Date.now();

  const mintAddress = `SIMULATED_MINT_${badgeType}_${userWalletAddress.slice(
    0,
    8
  )}`;
  const txSignature = `SIMULATED_TX_${timestamp}`;

  console.log(
    "[mintBadgeNft] Simulated mint for",
    userWalletAddress,
    "badge:",
    badgeType,
    "mint:",
    mintAddress,
    "tx:",
    txSignature
  );

  return {
    mintAddress,
    txSignature,
  };
}

module.exports = {
  mintBadgeNft,
};
