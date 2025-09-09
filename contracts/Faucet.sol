// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet {
    IERC20 public token;               // The token the faucet distributes
    uint256 public amount;             // Amount to give per claim
    uint256 public cooldown;           // Cooldown period in seconds
    mapping(address => uint256) public lastClaim; // Tracks last claim timestamp

    constructor(IERC20 _token, uint256 _amount, uint256 _cooldown) {
        token = _token;
        amount = _amount;
        cooldown = _cooldown;
    }

    function requestTokens() external {
        require(block.timestamp - lastClaim[msg.sender] >= cooldown, "Wait before claiming again");
        require(token.balanceOf(address(this)) >= amount, "Faucet empty");

        lastClaim[msg.sender] = block.timestamp;
        token.transfer(msg.sender, amount);
    }
}
