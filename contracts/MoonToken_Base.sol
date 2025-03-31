// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MoonToken
 * @dev ERC-20 token with role-based access control for minting and burning operations
 */
contract MoonTokenBase is ERC20, AccessControl {
    // Define roles as bytes32 constants
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /**
     * @dev Constructor that sets up the token and assigns roles
     */
    constructor() ERC20("MoonToken", "MOON") {
        // Grant the contract deployer both the admin role, minter and burner roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Creates new tokens and assigns them to the specified account
     * @param to The account to receive the new tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Destroys tokens from the specified account
     * @param from The account to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}
