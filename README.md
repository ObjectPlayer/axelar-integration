# Cross-Chain Token Bridge with Axelar & Squid Router Integration

This project demonstrates how to create cross-chain token bridges between Ethereum Sepolia and Base Sepolia using Axelar Network, with additional integration of Squid Router for enhanced cross-chain swaps.

## Architecture Overview

```
+-------------------+                 +----------------+                +------------------+
| Ethereum Sepolia  |                 | Axelar Network |                | Base Sepolia     |
|                   |                 |                |                |                  |
| +--------------+  |    Messages     | +------------+ |    Messages    | +--------------+ |
| | MoonTokenEth |<-|---------------->| |   Relayer  | |<-------------->| | MoonTokenBase| |
| | (ERC-20)     |  |                 | |            | |                | | (ERC-20)     | |
| +--------------+  |                 | +------------+ |                | +--------------+ |
|                   |                 |                |                |                  |
+-------------------+                 +----------------+                +------------------+
         ^                                                                      ^
         |                                                                      |
         |              +----------------------------------+                    |
         +--------------| Squid Router (Cross-Chain Swaps) |--------------------+
                        +----------------------------------+
```

The architecture consists of two main components:

1. **Primary Chain (Ethereum Sepolia)**
   - MoonTokenEth (MOON): ERC-20 token with fixed supply
   - Total Supply: 10,000,000 MOON tokens minted at deployment

2. **Secondary Chain (Base Sepolia)**
   - MoonTokenBase (MOON): ERC-20 token with role-based access control
   - Includes minting and burning capabilities with proper role management

3. **Axelar Network**
   - Acts as the communication layer between chains
   - Securely transmits messages using the Interchain Token Service (ITS)

## Tokens and Contracts

### MoonTokenEth
- Primary token on Ethereum Sepolia
- ERC-20 standard with 18 decimals
- Fixed supply of 10 million tokens minted at deployment

### MoonTokenBase
- Secondary token on Base Sepolia
- ERC-20 standard with 18 decimals and role-based access control
- Minter and Burner roles for controlled minting/burning functionality

## Interchain Token Service Integration

This project uses Axelar's Interchain Token Service (ITS) to link the two custom tokens across chains. The integration follows these steps:

1. Deploy MoonTokenEth on Ethereum Sepolia 
2. Deploy MoonTokenBase on Base Sepolia 
3. Register token metadata with the ITS Contract on both chains
4. Register both tokens with the Interchain Token Factory
5. Link the tokens using the Interchain Token Factory
6. Assign appropriate minting/burning roles to token managers

### How It Works

When properly configured, the Interchain Token Service allows:

1. Token transfers from Ethereum Sepolia to Base Sepolia
   - Tokens are locked on Ethereum
   - Equivalent tokens are minted on Base Sepolia

2. Token transfers from Base Sepolia to Ethereum Sepolia
   - Tokens are burned on Base Sepolia
   - Equivalent tokens are released on Ethereum

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Ethereum wallet with private key
- Sepolia ETH for gas fees
- Base Sepolia ETH for gas fees

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/axelar-token-bridge.git
cd axelar-token-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```
PRIVATE_KEY=your_private_key_here
ETHEREUM_SEPOLIA_RPC_URL=your_sepolia_rpc_url
BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

### Deployment

1. Deploy MoonTokenEth to Ethereum Sepolia:
```bash
npx hardhat run scripts/deploy/01-deploy-moon-token-eth.ts --network sepolia
```

2. Deploy MoonTokenBase to Base Sepolia:
```bash
npx hardhat run scripts/deploy/02-deploy-moon-token-base.ts --network baseSepolia
```

### Axelar Cross-Chain Integration

To set up the cross-chain integration between the two tokens using Axelar:

```bash
npx hardhat run scripts/axelar-crosschain-integration.ts
```

This script handles:
- Registering both token metadata with the ITS Contract
- Registering token with the Interchain Token Factory
- Linking the tokens across chains
- Setting up minting/burning permissions

## Squid Router Integration

Squid Router enhances our token bridge by providing cross-chain liquidity and swaps. It allows for:
- One-click cross-chain transactions
- Optimized routing for best prices
- Multi-chain liquidity access

For more information, check out the [Squid Router documentation](https://docs.squidrouter.com/).

## Testing

Run tests for both tokens with:

```bash
npx hardhat test
```

This will run comprehensive tests for both MoonTokenEth and MoonTokenBase contracts, ensuring all functionality works correctly.

## Additional Resources

- [Axelar Documentation](https://docs.axelar.dev/)
- [Interchain Token Service](https://docs.axelar.dev/dev/send-tokens/interchain-tokens/intro)
- [Squid Router Documentation](https://docs.squidrouter.com/)
