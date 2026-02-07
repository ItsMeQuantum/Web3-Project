// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MyToken.sol";

/**
 * @title EtherWallet
 * @dev A simple Ethereum wallet contract with:
 * - ETH deposit and withdrawal
 * - ERC20 token management
 * - Balance tracking
 * - Multi-signature capability (optional)
 */

contract EtherWallet {
    address public owner;
    
    struct User {
        uint256 ethBalance;
        mapping(address => uint256) tokenBalance;
        mapping(address => bool) allowedTokens;
    }
    
    mapping(address => User) private users;
    MyToken[] public registeredTokens;
    
    event EthDeposited(address indexed user, uint256 amount);
    event EthWithdrawn(address indexed user, uint256 amount);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event TokenRegistered(address indexed token);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Receive ETH deposits
     */
    receive() external payable {
        depositEth();
    }

    /**
     * @dev Deposit ETH into wallet
     */
    function depositEth() public payable {
        require(msg.value > 0, "Must send ETH");
        users[msg.sender].ethBalance += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ETH from wallet
     */
    function withdrawEth(uint256 amount) external {
        require(users[msg.sender].ethBalance >= amount, "Insufficient ETH balance");
        users[msg.sender].ethBalance -= amount;
        payable(msg.sender).transfer(amount);
        emit EthWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Get ETH balance
     */
    function getEthBalance() external view returns (uint256) {
        return users[msg.sender].ethBalance;
    }

    /**
     * @dev Get ETH balance of specific address
     */
    function getEthBalanceOf(address account) external view returns (uint256) {
        return users[account].ethBalance;
    }

    /**
     * @dev Deposit ERC20 tokens
     */
    function depositToken(address tokenAddress, uint256 amount) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        
        MyToken token = MyToken(tokenAddress);
        
        // Transfer tokens from user to this contract
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        users[msg.sender].tokenBalance[tokenAddress] += amount;
        if (!users[msg.sender].allowedTokens[tokenAddress]) {
            users[msg.sender].allowedTokens[tokenAddress] = true;
        }
        
        emit TokenDeposited(msg.sender, tokenAddress, amount);
    }

    /**
     * @dev Withdraw ERC20 tokens
     */
    function withdrawToken(address tokenAddress, uint256 amount) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(users[msg.sender].tokenBalance[tokenAddress] >= amount, "Insufficient token balance");
        
        MyToken token = MyToken(tokenAddress);
        
        users[msg.sender].tokenBalance[tokenAddress] -= amount;
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokenWithdrawn(msg.sender, tokenAddress, amount);
    }

    /**
     * @dev Get token balance
     */
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        return users[msg.sender].tokenBalance[tokenAddress];
    }

    /**
     * @dev Get token balance of specific address
     */
    function getTokenBalanceOf(address account, address tokenAddress) external view returns (uint256) {
        return users[account].tokenBalance[tokenAddress];
    }

    /**
     * @dev Check if user has access to token
     */
    function hasTokenAccess(address tokenAddress) external view returns (bool) {
        return users[msg.sender].allowedTokens[tokenAddress];
    }

    /**
     * @dev Transfer tokens to another user
     */
    function transferToken(
        address tokenAddress,
        address to,
        uint256 amount
    ) external {
        require(to != address(0), "Cannot transfer to zero address");
        require(users[msg.sender].tokenBalance[tokenAddress] >= amount, "Insufficient token balance");
        
        users[msg.sender].tokenBalance[tokenAddress] -= amount;
        users[to].tokenBalance[tokenAddress] += amount;
        
        if (!users[to].allowedTokens[tokenAddress]) {
            users[to].allowedTokens[tokenAddress] = true;
        }
        
        emit TokenWithdrawn(msg.sender, tokenAddress, amount);
        emit TokenDeposited(to, tokenAddress, amount);
    }

    /**
     * @dev Register a new ERC20 token
     */
    function registerToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        
        registeredTokens.push(MyToken(tokenAddress));
        emit TokenRegistered(tokenAddress);
    }

    /**
     * @dev Get all registered tokens
     */
    function getRegisteredTokens() external view returns (MyToken[] memory) {
        return registeredTokens;
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
