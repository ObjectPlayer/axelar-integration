import { ethers } from "hardhat";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Network configurations
const ETH_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

// Create providers for both networks
const ethereumProvider = new ethers.JsonRpcProvider(ETH_SEPOLIA_RPC_URL);
const baseProvider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);

// Axelar contract addresses (testnet)
const interchainTokenServiceContractAddress = process.env.INTERCHAIN_TOKEN_SERVICE_ADDRESS || "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
const interchainTokenFactoryContractAddress = process.env.INTERCHAIN_TOKEN_FACTORY_ADDRESS || "0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66";

// Your token addresses (need to be updated after deployment)
const destinationchain_ethereum = process.env.DESTINATION_CHAIN_ETHEREUM || "ethereum-sepolia";
const destinationchain_base = process.env.DESTINATION_CHAIN_BASE || "base-sepolia";

// Replace with your actual token addresses after deployment
const ethereumMoonTokenAddress = process.env.ETHEREUM_MOON_TOKEN_ADDRESS || "YOUR_MOON_TOKEN_ETH_ADDRESS"; 
const baseMoonTokenAddress = process.env.BASE_MOON_TOKEN_ADDRESS || "YOUR_MOON_TOKEN_BASE_ADDRESS";

// TokenManager type - using LOCK_RELEASE = 2 / MINT_BURN (4)
const LOCK_RELEASE = 2;
const MINT_BURN = 4;

// ABIs - These will be imported from files in the utils directory
// Create these files first before running this script
import interchainTokenServiceABI from "./utils/abis/interchainTokenServiceABI.json";
import interchainTokenFactoryABI from "./utils/abis/interchainTokenFactoryABI.json";
import moonTokenEthABI from "./utils/abis/moonTokenEthABI.json";
import moonTokenBaseABI from "./utils/abis/moonTokenBaseABI.json";

// Helper functions
async function getSigner(isEthereum = true) {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY in environment variables");
  }
  
  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  
  // Connect wallet to appropriate provider
  if (isEthereum) {
    return wallet.connect(ethereumProvider);
  } else {
    return wallet.connect(baseProvider);
  }
}

async function getContractInstance(contractAddress: string, contractABI: any, signer: any) {
  return new ethers.Contract(contractAddress, contractABI, signer);
}

// Step 1: Register token metadata with the ITS Contract on Ethereum Sepolia
async function registerTokenMetadataOnEthereum() {
  console.log("Registering token metadata on Ethereum Sepolia...");
  
  // Get a signer for Ethereum network
  const signer = await getSigner(true);

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceABI,
    signer
  );


  // Register the token metadata
  const tx = await interchainTokenServiceContract.registerTokenMetadata(
    ethereumMoonTokenAddress,
    ethers.parseEther("0.0001"),
    {value: ethers.parseEther("0.001")}
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  
  console.log("Token metadata registered on Ethereum Sepolia successfully");
  
}

// Step 2: Register token metadata with the ITS Contract on Base Sepolia
async function registerTokenMetadataOnBase() {
  console.log("Registering token metadata on Base Sepolia...");
  
  // Get a signer for Base network
  const signer = await getSigner(false);

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceABI,
    signer
  );


  // Register the token metadata
  const tx = await interchainTokenServiceContract.registerTokenMetadata(
    baseMoonTokenAddress,
    ethers.parseEther("0.0001"),
    {value: ethers.parseEther("0.001")}
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  
  console.log("Token metadata registered on Base Sepolia successfully");
}

// Step 3: Register the custom token with the Interchain Token Factory on Ethereum Sepolia
async function registerCustomTokenOnEthereum() {
  console.log("Registering custom token on Ethereum Sepolia...");
  
  // Get a signer for Ethereum network
  const signer = await getSigner(true);

  // The token ID - a unique identifier for your token
  // This should be the same across both chains for the same token
  const salt = "0x" + crypto.randomBytes(32).toString("hex");
  console.log("Generated Salt:", salt);


  // Get the interchain token factory contract instance
  const interchainTokenFactoryContract = await getContractInstance(
    interchainTokenFactoryContractAddress,
    interchainTokenFactoryABI,
    signer
  );

  // Deploy the interchain token
  const tokenAddress = ethereumMoonTokenAddress;
  const minter = await signer.getAddress();

  // Register custom token
  const tx = await interchainTokenFactoryContract.registerCustomToken(
    salt,
    tokenAddress,
    MINT_BURN,
    minter,
    {value: ethers.parseEther("0.001")}
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  // Get the TokenId and TokenManagerAddress
  const tokenId = await interchainTokenFactoryContract.getCustomTokenId(
    await signer.getAddress(),
    salt
  );

  console.log(`TokenId: ${tokenId}`);
  console.log("Custom token registered on Ethereum Sepolia successfully");

  return salt;
}

// Step 4: Link custom token from Ethereum Sepolia to Base Sepolia
async function linkCustomTokenFromEthereumToBase(salt:string) {
  console.log("Linking custom token from Ethereum Sepolia to Base Sepolia...");
  
  // Get a signer for Ethereum network
  const signer = await getSigner(true);

  // Get the interchain token factory contract instance
  const interchainTokenFactoryContract = await getContractInstance(
    interchainTokenFactoryContractAddress,
    interchainTokenFactoryABI,
    signer
  );
  
  // Calculate gas payment
  // You may need to adjust the gas amount
  const gasAmount = ethers.parseEther("0.001"); 

  const minter = await signer.getAddress();

  const tx = await interchainTokenFactoryContract.linkToken(
    salt,
    destinationchain_base,
    baseMoonTokenAddress,
    LOCK_RELEASE,
    minter,
    gasAmount,
    { value: gasAmount }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("Custom token linked from Ethereum Sepolia to Base Sepolia successfully");
  
}

// Step 5: Get token manager address 
async function getTokenIdAndManagerAddress(salt:string) {
  console.log("Getting token manager address from the Factory contract...");
  
  // Get a signer for Ethereum network
  const signer = await getSigner(true);

  // Get the interchain token factory contract instance
  const interchainTokenFactoryContract = await getContractInstance(
    interchainTokenFactoryContractAddress,
    interchainTokenFactoryABI,
    signer
  );
  
  const minter = await signer.getAddress();

   // Retrieve linked token id
  const tokenId = await interchainTokenFactoryContract.linkToken(
    minter,
    salt,
  );

  console.log(`TokenId for : ${tokenId}`);


    // Get the InterchainTokenService contract instance
    const interchainTokenServiceContract = await getContractInstance(
      interchainTokenServiceContractAddress,
      interchainTokenServiceABI,
      signer,
    );
  
  const tokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  return { tokenId, tokenManagerAddress };
  
}


// Step 6: Assign minter role to token manager on Base Sepolia
async function transferMintAndBurnAccessToTokenManagerOnBase(tokenManagerAddress: string) {
  console.log("Transferring minter/burner role to token manager on Base Sepolia...");
  
  // Get a signer for Base network
  const signer = await getSigner(false);

  // Get the token contract instance
  const tokenContract = await getContractInstance(
    baseMoonTokenAddress,
    moonTokenBaseABI,
    signer
  );

  // Get the minter role
  const MINTER_ROLE = await tokenContract.MINTER_ROLE();
  const BURNER_ROLE = await tokenContract.BURNER_ROLE();

  // Grant minter and burner roles to the token manager
  const tx1 = await tokenContract.grantRole(MINTER_ROLE, tokenManagerAddress);
  console.log(`Transaction hash for granting minter role: ${tx1.hash}`);
  await tx1.wait();

  const tx2 = await tokenContract.grantRole(BURNER_ROLE, tokenManagerAddress);
  console.log(`Transaction hash for granting burner role: ${tx2.hash}`);
  await tx2.wait();

  console.log("Minter and Burner roles transferred to token manager on Base Sepolia successfully");
}

// Step 7.1: Approve tokens
async function approveTokens(isEthereum: boolean, tokenManagerAddress: string, amount: string) {
  console.log(`Approving tokens on ${isEthereum ? "Ethereum Sepolia" : "Base Sepolia"}...`);
  
  // Get a signer for the appropriate network
  const signer = await getSigner(isEthereum);

  let tokenContract;

  if (isEthereum) {
  // Get the token contract instance
   tokenContract = await getContractInstance(
    ethereumMoonTokenAddress,
    moonTokenEthABI,
    signer
  );
  } else {
  // Get the token contract instance
  tokenContract = await getContractInstance(
    baseMoonTokenAddress,
    moonTokenBaseABI,
    signer
  );
    
  }

  // Approve tokens 
  const tx1 = await tokenContract.approve(tokenManagerAddress, amount);
  console.log(`Transaction hash for approving token: ${tx1.hash}`);
  await tx1.wait();

}

// Step 7: Transfer tokens from Ethereum to Base
async function transferTokensFromEthereumToBase(tokenManagerAddress:string, tokenId: string, receiverAddress: string) {
  console.log("Transferring tokens from Ethereum to Base...");
  
  // Get a signer for Ethereum network
  const signer = await getSigner(true);


  const amount = ethers.parseEther("1000").toString();

  // Approve tokens 
  await approveTokens(true, tokenManagerAddress, amount);


  // Transfer tokens
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceABI,
    signer,
  );

  const transfer = await interchainTokenServiceContract.interchainTransfer(
    tokenId, // tokenId, the one you store in the earlier step
    destinationchain_base, // destination chain
    receiverAddress, // receiver address
    amount, // amount of token to transfer
    "0x",
    ethers.parseEther("0.001"), // gasValue
    {
      // Transaction options should be passed here as an object
      value: ethers.parseEther("0.001"),
    },
  );

  console.log("Transfer Transaction Hash:", transfer.hash);

}

// Step 8: Transfer tokens from Base to Ethereum
async function transferTokensFromBaseToEthereum(tokenManagerAddress:string, tokenId: string, receiverAddress: string) {
  console.log("Transferring tokens from Base to Ethereum...");
  
  // Get a signer for Base network
  const signer = await getSigner(false);


  const amount = ethers.parseEther("1000").toString();

  // Approve tokens 
  await approveTokens(false, tokenManagerAddress, amount);


  // Transfer tokens
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceABI,
    signer,
  );


  const transfer = await interchainTokenServiceContract.interchainTransfer(
    tokenId, // tokenId, the one you store in the earlier step
    destinationchain_ethereum, // destination chain
    receiverAddress, // receiver address
    amount, // amount of token to transfer
    "0x",
    ethers.parseEther("0.001"), // gasValue
    {
      // Transaction options should be passed here as an object
      value: ethers.parseEther("0.001"),
    },
  );

  console.log("Transfer Transaction Hash:", transfer.hash);

}

// Main function to orchestrate the entire process
async function main() {
  try {
    console.log("Starting Axelar cross-chain integration...");
    
    // Step 1 & 2: Register token metadata on both chains
    await registerTokenMetadataOnEthereum();
    await registerTokenMetadataOnBase();
    
    // Step 3 : Register custom tokens on primary chain
    const salt =  await registerCustomTokenOnEthereum();
        
    // Step 4: Link tokens across chains
    await linkCustomTokenFromEthereumToBase(salt);

    // Step 5: Get token manager address
    const { tokenId, tokenManagerAddress } = await getTokenIdAndManagerAddress(salt);
    

    // Step 6 : Transfer mint/burn access to token managers
    await transferMintAndBurnAccessToTokenManagerOnBase(tokenManagerAddress);
    
    console.log("Axelar cross-chain integration completed successfully!");
    console.log(`Token ID: ${tokenId}`);
    console.log(`Token Manager Address: ${tokenManagerAddress}`);
    console.log(`Salt (save for future reference): ${salt}`);

    // Uncomment the following lines to test token transfers
    // You'll need to provide a valid receiver address
    // const receiverAddress = "YOUR_RECEIVER_ADDRESS"; 
    // const tokenManagerAddress = "YOUR_TOKEN_MANAGER_ADDRESS"; 
    // const tokenId = "YOUR_TOKEN_ID"; 

    // await transferTokensFromEthereumToBase(tokenManagerAddress, tokenId, receiverAddress);
    // await transferTokensFromBaseToEthereum(tokenManagerAddress, tokenId, receiverAddress);
    
  } catch (error) {
    console.error("Error during Axelar cross-chain integration:", error);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
