const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking deployment on network:", hre.network.name);

  const deploymentsPath = require("path").join(__dirname, "../deployments.json");
  let deploymentInfo;

  try {
    deploymentInfo = require(deploymentsPath);
  } catch (error) {
    console.log("❌ No deployment info found. Please run deploy.js first.");
    return;
  }

  const { MyToken: tokenAddress, EtherWallet: walletAddress } = deploymentInfo;

  // Get signers
  const [signer] = await hre.ethers.getSigners();

  // Load contracts
  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = Token.attach(tokenAddress);

  const Wallet = await hre.ethers.getContractFactory("EtherWallet");
  const wallet = Wallet.attach(walletAddress);

  console.log("\n📊 TOKEN INFO");
  console.log("─".repeat(50));
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Decimals:", await token.decimals());
  console.log("Total Supply:", (await token.totalSupply()).toString());
  console.log("Owner:", await token.owner());

  console.log("\n💼 WALLET INFO");
  console.log("─".repeat(50));
  console.log("Owner:", await wallet.owner());

  console.log("\n✅ Deployment verified successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
