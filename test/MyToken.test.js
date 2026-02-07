const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "My Token";
  const TOKEN_SYMBOL = "MTK";
  const INITIAL_SUPPLY = 1000000n;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name", async function () {
      expect(await token.name()).to.equal(TOKEN_NAME);
    });

    it("Should set the correct symbol", async function () {
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should assign initial supply to owner", async function () {
      const expectedSupply = INITIAL_SUPPLY * 10n ** 18n;
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(expectedSupply);
    });

    it("Should set owner correctly", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct total supply", async function () {
      const expectedSupply = INITIAL_SUPPLY * 10n ** 18n;
      expect(await token.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("50");
      await token.transfer(addr1.address, transferAmount);
      
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should fail if sender has insufficient balance", async function () {
      const transferAmount = ethers.parseEther("1000001");
      await expect(
        token.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail if recipient is zero address", async function () {
      const transferAmount = ethers.parseEther("10");
      await expect(
        token.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Cannot transfer to zero address");
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = ethers.parseEther("50");
      await expect(token.transfer(addr1.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });
  });

  describe("Approve", function () {
    it("Should approve tokens for spending", async function () {
      const approveAmount = ethers.parseEther("100");
      await token.approve(addr1.address, approveAmount);
      
      const allowance = await token.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should emit Approval event", async function () {
      const approveAmount = ethers.parseEther("100");
      await expect(token.approve(addr1.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });

    it("Should fail if spender is zero address", async function () {
      const approveAmount = ethers.parseEther("100");
      await expect(
        token.approve(ethers.ZeroAddress, approveAmount)
      ).to.be.revertedWith("Cannot approve zero address");
    });
  });

  describe("TransferFrom", function () {
    beforeEach(async function () {
      const approveAmount = ethers.parseEther("100");
      await token.approve(addr1.address, approveAmount);
    });

    it("Should transfer approved tokens", async function () {
      const transferAmount = ethers.parseEther("50");
      await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should reduce allowance after transfer", async function () {
      const transferAmount = ethers.parseEther("30");
      await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      const allowance = await token.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(ethers.parseEther("70"));
    });

    it("Should fail if allowance is insufficient", async function () {
      const transferAmount = ethers.parseEther("150");
      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Mint", function () {
    it("Should mint tokens (owner only)", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.mint(addr1.address, mintAmount);
      
      const balance = await token.balanceOf(addr1.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should increase total supply", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await token.totalSupply();
      await token.mint(addr1.address, mintAmount);
      
      const newSupply = await token.totalSupply();
      expect(newSupply).to.equal(initialSupply + mintAmount);
    });

    it("Should fail if not owner", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        token.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Burn", function () {
    it("Should burn tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await token.balanceOf(owner.address);
      await token.burn(burnAmount);
      
      const newBalance = await token.balanceOf(owner.address);
      expect(newBalance).to.equal(initialBalance - burnAmount);
    });

    it("Should decrease total supply", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialSupply = await token.totalSupply();
      await token.burn(burnAmount);
      
      const newSupply = await token.totalSupply();
      expect(newSupply).to.equal(initialSupply - burnAmount);
    });

    it("Should fail if insufficient balance", async function () {
      const burnAmount = ethers.parseEther("2000000");
      await expect(token.burn(burnAmount))
        .to.be.revertedWith("Insufficient balance to burn");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await token.transferOwnership(addr1.address);
      expect(await token.owner()).to.equal(addr1.address);
    });

    it("Should fail transferring to zero address", async function () {
      await expect(token.transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("Cannot transfer to zero address");
    });
  });
});
