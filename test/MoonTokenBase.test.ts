import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { MoonTokenBase } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MoonTokenBase", function () {
  let moonToken: MoonTokenBase;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  // Role constants
  let MINTER_ROLE: string;
  let BURNER_ROLE: string;
  let DEFAULT_ADMIN_ROLE: string;

  beforeEach(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();
    
    // Deploy the contract using the deployment script
    await deployments.fixture(["moon-on-base"]);
    const MoonTokenDeployment = await deployments.get("MoonTokenBase");
    moonToken = await ethers.getContractAt("MoonTokenBase", MoonTokenDeployment.address) as unknown as MoonTokenBase;
    
    // Get role constants
    MINTER_ROLE = await moonToken.MINTER_ROLE();
    BURNER_ROLE = await moonToken.BURNER_ROLE();
    DEFAULT_ADMIN_ROLE = await moonToken.DEFAULT_ADMIN_ROLE();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await moonToken.name()).to.equal("MoonToken");
      expect(await moonToken.symbol()).to.equal("MOON");
    });

    it("Should assign all roles to the deployer", async function () {
      expect(await moonToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
      expect(await moonToken.hasRole(MINTER_ROLE, deployer.address)).to.be.true;
      expect(await moonToken.hasRole(BURNER_ROLE, deployer.address)).to.be.true;
    });

    it("Should have zero initial supply", async function () {
      expect(await moonToken.totalSupply()).to.equal(0);
    });
  });

  describe("Role-based access control", function () {
    it("Should allow admin to grant minter role", async function () {
      // Grant minter role to user1
      await moonToken.grantRole(MINTER_ROLE, user1.address);
      
      // Check role assignment
      expect(await moonToken.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow admin to grant burner role", async function () {
      // Grant burner role to user1
      await moonToken.grantRole(BURNER_ROLE, user1.address);
      
      // Check role assignment
      expect(await moonToken.hasRole(BURNER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      // First grant role
      await moonToken.grantRole(MINTER_ROLE, user1.address);
      expect(await moonToken.hasRole(MINTER_ROLE, user1.address)).to.be.true;
      
      // Then revoke it
      await moonToken.revokeRole(MINTER_ROLE, user1.address);
      expect(await moonToken.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("Should prevent non-admins from granting roles", async function () {
      // User1 tries to grant minter role to user2
      await expect(
        moonToken.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.reverted;
      
      // Verify user2 doesn't have the role
      expect(await moonToken.hasRole(MINTER_ROLE, user2.address)).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      
      // Mint 1000 tokens to user1
      await moonToken.mint(user1.address, mintAmount);
      
      // Check balance and total supply
      expect(await moonToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await moonToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should prevent non-minters from minting tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      
      // User1 tries to mint tokens
      await expect(
        moonToken.connect(user1).mint(user1.address, mintAmount)
      ).to.be.reverted;
      
      // Check that no tokens were minted
      expect(await moonToken.balanceOf(user1.address)).to.equal(0);
      expect(await moonToken.totalSupply()).to.equal(0);
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      
      await expect(moonToken.mint(user1.address, mintAmount))
        .to.emit(moonToken, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint tokens to user1 for burn testing
      const mintAmount = ethers.parseUnits("1000", 18);
      await moonToken.mint(user1.address, mintAmount);
    });

    it("Should allow burner to burn tokens", async function () {
      const initialBalance = await moonToken.balanceOf(user1.address);
      const burnAmount = ethers.parseUnits("500", 18);
      
      // Burn 500 tokens from user1
      await moonToken.burn(user1.address, burnAmount);
      
      // Check balance and total supply
      expect(await moonToken.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await moonToken.totalSupply()).to.equal(initialBalance - burnAmount);
    });

    it("Should prevent non-burners from burning tokens", async function () {
      const initialBalance = await moonToken.balanceOf(user1.address);
      const burnAmount = ethers.parseUnits("500", 18);
      
      // User1 tries to burn tokens (doesn't have BURNER_ROLE)
      await expect(
        moonToken.connect(user1).burn(user1.address, burnAmount)
      ).to.be.reverted;
      
      // Check that no tokens were burned
      expect(await moonToken.balanceOf(user1.address)).to.equal(initialBalance);
    });

    it("Should fail when trying to burn more tokens than an account has", async function () {
      const initialBalance = await moonToken.balanceOf(user1.address);
      const burnAmount = initialBalance + ethers.parseUnits("1", 18); // More than the balance
      
      // Try to burn more tokens than user1 has
      await expect(
        moonToken.burn(user1.address, burnAmount)
      ).to.be.reverted;
      
      // Check that no tokens were burned
      expect(await moonToken.balanceOf(user1.address)).to.equal(initialBalance);
    });

    it("Should emit Transfer event when burning", async function () {
      const burnAmount = ethers.parseUnits("500", 18);
      
      await expect(moonToken.burn(user1.address, burnAmount))
        .to.emit(moonToken, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });
  });

  describe("Token transfers", function () {
    beforeEach(async function () {
      // Mint tokens to deployer for transfer testing
      const mintAmount = ethers.parseUnits("1000", 18);
      await moonToken.mint(deployer.address, mintAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseUnits("100", 18);
      
      // Transfer 100 tokens from deployer to user1
      await moonToken.transfer(user1.address, transferAmount);
      
      // Check balances
      expect(await moonToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should approve tokens for delegated transfer", async function () {
      const approvalAmount = ethers.parseUnits("100", 18);
      
      // Approve user1 to spend tokens
      await moonToken.approve(user1.address, approvalAmount);
      
      // Check allowance
      expect(await moonToken.allowance(deployer.address, user1.address))
        .to.equal(approvalAmount);
    });

    it("Should execute transferFrom correctly", async function () {
      const approvalAmount = ethers.parseUnits("100", 18);
      const transferAmount = ethers.parseUnits("75", 18);
      
      // Approve user1 to spend tokens
      await moonToken.approve(user1.address, approvalAmount);
      
      // User1 transfers tokens from deployer to user2
      await moonToken.connect(user1).transferFrom(
        deployer.address,
        user2.address,
        transferAmount
      );
      
      // Check balances and remaining allowance
      expect(await moonToken.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await moonToken.allowance(deployer.address, user1.address))
        .to.equal(approvalAmount - transferAmount);
    });
  });
});
