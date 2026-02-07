const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Web3 Wallet and Token contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy MyToken
  console.log("\n📦 Deploying MyToken...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy("My Token", "MTK", 1000000n);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ MyToken deployed to:", tokenAddress);

  // Deploy EtherWallet
  console.log("\n💼 Deploying EtherWallet...");
  const EtherWallet = await hre.ethers.getContractFactory("EtherWallet");
  const wallet = await EtherWallet.deploy();
  await wallet.waitForDeployment();
  const walletAddress = await wallet.getAddress();
  console.log("✅ EtherWallet deployed to:", walletAddress);

  // Register token in wallet
  console.log("\n📝 Registering token in wallet...");
  await wallet.registerToken(tokenAddress);
  console.log("✅ Token registered in wallet");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    MyToken: tokenAddress,
    EtherWallet: walletAddress,
    deploymentTime: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployments.json");

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Wallet Address: ${walletAddress}`);
  console.log("=".repeat(60));

  // Verification info
  console.log("\n📋 To verify contracts on Etherscan:");
  console.log(
    `\nnpx hardhat verify --network ${hre.network.name} ${tokenAddress} "My Token" "MTK" "1000000"`
  );
  console.log(`npx hardhat verify --network ${hre.network.name} ${walletAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
