// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyToken
 * @dev A custom ERC20 token implementation from scratch
 * Features:
 * - Standard ERC20 functionality (transfer, approve, transferFrom)
 * - Mint and burn capabilities
 * - Ownership model
 * - Event logging for all transfers and approvals
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract MyToken is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    address public owner;

    event Burn(address indexed burner, uint256 amount);
    event Mint(address indexed minter, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Constructor initializing the token with name, symbol, and initial supply
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply in smallest units (considering decimals)
     */
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        owner = msg.sender;
        _totalSupply = _initialSupply * 10 ** uint256(decimals);
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    /**
     * @dev Returns the total supply of tokens
     */
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns balance of a specific address
     */
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfer tokens from sender to recipient
     */
    function transfer(address to, uint256 amount) external override returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Returns approved amount for spender
     */
    function allowance(address owner_, address spender) external view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    /**
     * @dev Approve spender to spend tokens on behalf of owner
     */
    function approve(address spender, uint256 amount) external override returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        
        _allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another on behalf of owner
     */
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(from != address(0), "Cannot transfer from zero address");
        require(to != address(0), "Cannot transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
        return true;
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance to burn");
        
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    /**
     * @dev Transfer ownership to a new address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Cannot transfer to zero address");
        owner = newOwner;
    }
}
