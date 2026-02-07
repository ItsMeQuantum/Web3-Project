const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherWallet", function () {
  let wallet;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy wallet
    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    wallet = await EtherWallet.deploy();
    await wallet.waitForDeployment();

    // Deploy token
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy("My Token", "MTK", 1000000n);
    await token.waitForDeployment();

    // Register token in wallet
    await wallet.registerToken(token.getAddress());

    // Transfer some tokens to addr1
    const transferAmount = ethers.parseEther("1000");
    await token.transfer(addr1.address, transferAmount);
  });

  describe("ETH Operations", function () {
    it("Should accept ETH deposits", async function () {
      const depositAmount = ethers.parseEther("10");
      await owner.sendTransaction({
        to: wallet.getAddress(),
        value: depositAmount,
      });

      const balance = await wallet.connect(owner).getEthBalance();
      expect(balance).to.equal(depositAmount);
    });

    it("Should track ETH balance", async function () {
      const depositAmount = ethers.parseEther("5");
      await wallet.connect(addr1).depositEth({ value: depositAmount });

      const balance = await wallet.getEthBalanceOf(addr1.address);
      expect(balance).to.equal(depositAmount);
    });

    it("Should withdraw ETH", async function () {
      const depositAmount = ethers.parseEther("10");
      await wallet.connect(addr1).depositEth({ value: depositAmount });

      const withdrawAmount = ethers.parseEther("3");
      await wallet.connect(addr1).withdrawEth(withdrawAmount);

      const balance = await wallet.getEthBalanceOf(addr1.address);
      expect(balance).to.equal(depositAmount - withdrawAmount);
    });

    it("Should fail if insufficient ETH balance", async function () {
      const withdrawAmount = ethers.parseEther("1");
      await expect(
        wallet.connect(addr1).withdrawEth(withdrawAmount)
      ).to.be.revertedWith("Insufficient ETH balance");
    });
  });

  describe("Token Operations", function () {
    it("Should deposit tokens", async function () {
      const depositAmount = ethers.parseEther("100");
      
      // Approve wallet to spend tokens
      await token.connect(addr1).approve(wallet.getAddress(), depositAmount);
      
      // Deposit tokens
      await wallet.connect(addr1).depositToken(token.getAddress(), depositAmount);

      const balance = await wallet.connect(addr1).getTokenBalance(token.getAddress());
      expect(balance).to.equal(depositAmount);
    });

    it("Should withdraw tokens", async function () {
      const depositAmount = ethers.parseEther("100");
      
      await token.connect(addr1).approve(wallet.getAddress(), depositAmount);
      await wallet.connect(addr1).depositToken(token.getAddress(), depositAmount);

      const withdrawAmount = ethers.parseEther("30");
      await wallet.connect(addr1).withdrawToken(token.getAddress(), withdrawAmount);

      const remainingBalance = await wallet.connect(addr1).getTokenBalance(token.getAddress());
      expect(remainingBalance).to.equal(depositAmount - withdrawAmount);
    });

    it("Should fail if insufficient token balance", async function () {
      const withdrawAmount = ethers.parseEther("100");
      await expect(
        wallet.connect(addr2).withdrawToken(token.getAddress(), withdrawAmount)
      ).to.be.revertedWith("Insufficient token balance");
    });

    it("Should track multiple tokens", async function () {
      const depositAmount = ethers.parseEther("200");
      
      await token.connect(addr1).approve(wallet.getAddress(), depositAmount);
      await wallet.connect(addr1).depositToken(token.getAddress(), depositAmount);

      const balance = await wallet.getTokenBalanceOf(addr1.address, token.getAddress());
      expect(balance).to.equal(depositAmount);
    });
  });

  describe("Token Transfers", function () {
    it("Should transfer tokens between users", async function () {
      const depositAmount = ethers.parseEther("100");
      
      await token.connect(addr1).approve(wallet.getAddress(), depositAmount);
      await wallet.connect(addr1).depositToken(token.getAddress(), depositAmount);

      const transferAmount = ethers.parseEther("50");
      await wallet.connect(addr1).transferToken(
        token.getAddress(),
        addr2.address,
        transferAmount
      );

      const addr1Balance = await wallet.getTokenBalanceOf(addr1.address, token.getAddress());
      const addr2Balance = await wallet.getTokenBalanceOf(addr2.address, token.getAddress());

      expect(addr1Balance).to.equal(depositAmount - transferAmount);
      expect(addr2Balance).to.equal(transferAmount);
    });
  });

  describe("Token Registration", function () {
    it("Should register tokens", async function () {
      const registeredTokens = await wallet.getRegisteredTokens();
      expect(registeredTokens.length).to.be.greaterThan(0);
    });

    it("Should fail if non-owner tries to register", async function () {
      const MyToken = await ethers.getContractFactory("MyToken");
      const newToken = await MyToken.deploy("New Token", "NEW", 1000000n);
      
      await expect(
        wallet.connect(addr1).registerToken(newToken.getAddress())
      ).to.be.revertedWith("Only owner");
    });
  });
});
