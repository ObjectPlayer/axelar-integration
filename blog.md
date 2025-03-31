# Integrating Cross-Chain Functionality with Axelar and Squid Router

In the rapidly evolving world of blockchain, the ability to transfer assets and data across different chains seamlessly is becoming increasingly crucial. Axelar Network, with its robust cross-chain communication infrastructure, combined with the Squid Router, offers a powerful solution for developers looking to integrate cross-chain functionality into their applications. This blog post will guide you through the process of setting up a cross-chain integration using Axelar, focusing on Ethereum Sepolia and Base Sepolia networks.

## What is Axelar?

Axelar is a decentralized network that facilitates secure cross-chain communication. It acts as a universal overlay network, enabling dApps to communicate with each other across different blockchain platforms. With Axelar, developers can leverage the power of cross-chain transfers, ensuring that their applications are not limited to a single blockchain ecosystem.

## What is Squid Router?

Squid Router, also known as 0xSquid, is a protocol built on top of the Axelar Network. It enables cross-chain liquidity routing and swaps, allowing users to perform one-click cross-chain transactions. By utilizing Axelar's General Message Passing (GMP) capabilities, Squid Router simplifies the process of adding cross-chain functionality to applications.

## Setting Up Cross-Chain Integration

### Prerequisites

Before you begin, ensure you have the following:
- Node.js and npm installed on your machine.
- A basic understanding of blockchain and smart contracts.
- Access to Ethereum Sepolia and Base Sepolia test networks.
- An account with some testnet ETH for transaction fees.

### Step 1: Clone the Repository

Start by cloning the repository containing the integration scripts:
```bash
git clone <repository-url>
cd Axelar-Testing
```

### Step 2: Install Dependencies

Navigate to the project directory and install the necessary dependencies:
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variables:
```plaintext
PRIVATE_KEY=<your_private_key>
ETHEREUM_SEPOLIA_RPC_URL=<your_ethereum_sepolia_rpc_url>
BASE_SEPOLIA_RPC_URL=<your_base_sepolia_rpc_url>
ETHEREUM_MOON_TOKEN_ADDRESS=<your_ethereum_token_address>
BASE_MOON_TOKEN_ADDRESS=<your_base_token_address>
```

### Step 4: Deploy Smart Contracts

Deploy the necessary smart contracts on both Ethereum Sepolia and Base Sepolia networks. Ensure you update the `.env` file with the deployed contract addresses.

### Step 5: Run the Integration Script

Execute the integration script to register token metadata, link tokens, and transfer tokens across chains:
```bash
npx hardhat run scripts/axelar-crosschain-integration.ts
```

### Step 6: Verify Token Transfers

Uncomment the token transfer lines in the script and provide a valid receiver address to test token transfers between the two networks.

## Conclusion

By following these steps, you can successfully set up a cross-chain integration using Axelar and Squid Router. This setup not only enhances the functionality of your dApp but also broadens its reach across multiple blockchain ecosystems. As the blockchain space continues to grow, tools like Axelar and Squid Router will play a pivotal role in ensuring seamless interoperability between different networks.

For more information, visit [Axelar's official documentation](https://docs.axelar.dev/) and explore the possibilities of cross-chain development.
