import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { MoonTokenEth } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MoonTokenEth", function () {
  let moonToken: MoonTokenEth;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  const TOTAL_SUPPLY = ethers.parseUnits("10000000", 18); // 10 million tokens with 18 decimals

  beforeEach(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();
    
    // Deploy the contract using the deployment script
    await deployments.fixture(["moon-on-eth"]);
    const MoonTokenDeployment = await deployments.get("MoonTokenEth");
    moonToken = await ethers.getContractAt("MoonTokenEth", MoonTokenDeployment.address) as unknown as MoonTokenEth;
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await moonToken.name()).to.equal("MoonTokenEth");
      expect(await moonToken.symbol()).to.equal("MOON");
    });

    it("Should mint the entire supply to the deployer", async function () {
      const deployerBalance = await moonToken.balanceOf(deployer.address);
      expect(deployerBalance).to.equal(TOTAL_SUPPLY);
    });

    it("Should have the correct total supply", async function () {
      expect(await moonToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 100 tokens from deployer to user1
      const transferAmount = ethers.parseUnits("100", 18);
      await moonToken.transfer(user1.address, transferAmount);
      
      // Check balances
      const user1Balance = await moonToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(transferAmount);
      
      // Transfer 50 tokens from user1 to user2
      const secondTransferAmount = ethers.parseUnits("50", 18);
      await moonToken.connect(user1).transfer(user2.address, secondTransferAmount);
      
      // Check final balances
      expect(await moonToken.balanceOf(user1.address)).to.equal(transferAmount - secondTransferAmount);
      expect(await moonToken.balanceOf(user2.address)).to.equal(secondTransferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      // Initial balance of user1 is 0
      const initialBalance = await moonToken.balanceOf(user1.address);
      expect(initialBalance).to.equal(0);
      
      // Try to send 1 token from user1 to user2
      const transferAmount = ethers.parseUnits("1", 18);
      await expect(
        moonToken.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.reverted;
      
      // Balances should remain unchanged
      expect(await moonToken.balanceOf(user1.address)).to.equal(0);
      expect(await moonToken.balanceOf(user2.address)).to.equal(0);
    });
  });

  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const approvalAmount = ethers.parseUnits("100", 18);
      await moonToken.approve(user1.address, approvalAmount);
      
      expect(await moonToken.allowance(deployer.address, user1.address))
        .to.equal(approvalAmount);
    });

    it("Should transfer tokens through delegated transfer", async function () {
      const approvalAmount = ethers.parseUnits("100", 18);
      const transferAmount = ethers.parseUnits("75", 18);
      
      // Approve user1 to spend 100 tokens from deployer
      await moonToken.approve(user1.address, approvalAmount);
      
      // user1 transfers 75 tokens from deployer to user2
      await moonToken.connect(user1).transferFrom(
        deployer.address, 
        user2.address, 
        transferAmount
      );
      
      // Check balances
      expect(await moonToken.balanceOf(deployer.address))
        .to.equal(TOTAL_SUPPLY - transferAmount);
      expect(await moonToken.balanceOf(user2.address))
        .to.equal(transferAmount);
      
      // Check remaining allowance
      expect(await moonToken.allowance(deployer.address, user1.address))
        .to.equal(approvalAmount - transferAmount);
    });
  });
});
