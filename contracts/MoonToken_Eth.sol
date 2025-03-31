// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MoonTokenEth
 * @dev A simple ERC-20 token with a fixed supply that is minted at deployment
 */
contract MoonTokenEth is ERC20 {
    // Total supply is fixed at 10 million tokens
    uint256 private constant TOTAL_SUPPLY = 10_000_000;

    /**
     * @dev Constructor that mints the entire token supply to the deployer
     */
    constructor() ERC20("MoonTokenEth", "MOON") {
        // Mint initial supply to the deployer (with 18 decimals)
        _mint(msg.sender, TOTAL_SUPPLY * 10**decimals());
    }
}
