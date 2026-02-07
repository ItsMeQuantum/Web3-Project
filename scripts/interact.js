const hre = require("hardhat");

async function main() {
  console.log("🎯 Running interaction example...\n");

  const [signer, addr1, addr2] = await hre.ethers.getSigners();

  // Deploy MyToken
  const MyTokenFactory = await hre.ethers.getContractFactory("MyToken");
  const token = await MyTokenFactory.deploy("My Awesome Token", "MAT", 1000000n);
  await token.waitForDeployment();
  console.log("✅ Token deployed to:", await token.getAddress());

  // Deploy EtherWallet
  const WalletFactory = await hre.ethers.getContractFactory("EtherWallet");
  const wallet = await WalletFactory.deploy();
  await wallet.waitForDeployment();
  console.log("✅ Wallet deployed to:", await wallet.getAddress());

  // Register token
  await wallet.registerToken(await token.getAddress());
  console.log("✅ Token registered in wallet");

  // Test 1: Transfer tokens
  console.log("\n📤 Test 1: Transferring tokens...");
  const transferAmount = hre.ethers.parseEther("1000");
  await token.transfer(addr1.address, transferAmount);
  const balance = await token.balanceOf(addr1.address);
  console.log(`✅ Transferred 1000 tokens to addr1. Balance: ${hre.ethers.formatEther(balance)} MAT`);

  // Test 2: Deposit ETH
  console.log("\n💰 Test 2: Depositing ETH...");
  const ethAmount = hre.ethers.parseEther("5");
  await wallet.connect(addr1).depositEth({ value: ethAmount });
  const ethBalance = await wallet.getEthBalanceOf(addr1.address);
  console.log(`✅ Deposited 5 ETH. Wallet ETH balance: ${hre.ethers.formatEther(ethBalance)}`);

  // Test 3: Approve and deposit token
  console.log("\n🪙 Test 3: Depositing tokens in wallet...");
  const tokenDepositAmount = hre.ethers.parseEther("500");
  await token.connect(addr1).approve(await wallet.getAddress(), tokenDepositAmount);
  await wallet.connect(addr1).depositToken(await token.getAddress(), tokenDepositAmount);
  const walletTokenBalance = await wallet.getTokenBalanceOf(addr1.address, await token.getAddress());
  console.log(`✅ Deposited tokens in wallet. Balance: ${hre.ethers.formatEther(walletTokenBalance)} MAT`);

  // Test 4: Transfer tokens between wallet users
  console.log("\n🔄 Test 4: Transferring tokens between wallet users...");
  const internalTransferAmount = hre.ethers.parseEther("100");
  await wallet.connect(addr1).transferToken(
    await token.getAddress(),
    addr2.address,
    internalTransferAmount
  );
  const addr2Balance = await wallet.getTokenBalanceOf(addr2.address, await token.getAddress());
  const addr1NewBalance = await wallet.getTokenBalanceOf(addr1.address, await token.getAddress());
  console.log(`✅ Transferred tokens. Addr1: ${hre.ethers.formatEther(addr1NewBalance)} MAT, Addr2: ${hre.ethers.formatEther(addr2Balance)} MAT`);

  // Test 5: Burn tokens
  console.log("\n🔥 Test 5: Burning tokens...");
  const burnAmount = hre.ethers.parseEther("100");
  await token.burn(burnAmount);
  const totalSupply = await token.totalSupply();
  console.log(`✅ Burned 100 tokens. New total supply: ${hre.ethers.formatEther(totalSupply)} MAT`);

  console.log("\n✨ All interactions completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
