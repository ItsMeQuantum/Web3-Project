# Web3 Wallet & ERC20 Token Project

A complete, production-ready Web3 application featuring a custom Ethereum wallet and personalized ERC20 token implementation built entirely from scratch.

##  Features

### Smart Contracts
- **MyToken.sol** - Custom ERC20 token with:
  - Standard ERC20 functionality (transfer, approve, transferFrom)
  - Mint and burn capabilities
  - Ownership model
  - Event logging for all transactions
  
- **EtherWallet.sol** - Full-featured Ethereum wallet with:
  - ETH deposit and withdrawal
  - Multi-token support
  - Secure balance tracking per user
  - Token transfer between wallet users
  - Emergency withdrawal functions

### Frontend
- Beautiful, responsive web interface
- MetaMask integration
- Real-time balance updates
- Transaction history tracking
- Network detection
- User-friendly interactions

### Development
- **Hardhat** framework for contract development
- Comprehensive test suite (50+ test cases)
- Deployment scripts for multiple networks
- Local hardhat node for testing
- Contract verification scripts

##  Project Structure

```
Web3-Project/
├── contracts/
│   ├── MyToken.sol          
│   └── EtherWallet.sol      
├── test/
│   ├── MyToken.test.js      
│   └── EtherWallet.test.js  
├── scripts/
│   ├── deploy.js            
│   ├── check.js             
│   └── interact.js          
├── frontend/
│   ├── index.html           
│   ├── docs.html            
│   └── scripts/
│       └── wallet-app.js    
├── hardhat.config.js       
├── package.json             
├── .env.example             
└── README.md                
```

##  Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Compile contracts:**
   ```bash
   npm run compile
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

### Local Development

1. **Start Hardhat node:**
   ```bash
   npm run node
   ```

2. **In another terminal, deploy:**
   ```bash
   npm run deploy:localhost
   ```

3. **Run interaction examples:**
   ```bash
   npx hardhat run scripts/interact.js --network localhost
   ```

4. **Open frontend:**
   - Open `frontend/index.html` in your browser
   - Connect MetaMask to `http://127.0.0.1:8545`
   - Update contract addresses in `frontend/scripts/wallet-app.js`

##  Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY


PRIVATE_KEY=your_private_key_here


ETHERSCAN_API_KEY=your_etherscan_api_key


TOKEN_NAME=MyToken
TOKEN_SYMBOL=MTK
TOKEN_INITIAL_SUPPLY=1000000
```

##  Smart Contract API

### MyToken.sol Functions

| Function | Description | Parameters |
|----------|-------------|-----------|
| `transfer()` | Transfer tokens | `to: address, amount: uint256` |
| `approve()` | Approve spending | `spender: address, amount: uint256` |
| `transferFrom()` | Transfer on behalf | `from: address, to: address, amount: uint256` |
| `balanceOf()` | Get balance | `account: address` |
| `totalSupply()` | Get total supply | - |
| `mint()` | Create tokens (owner) | `to: address, amount: uint256` |
| `burn()` | Destroy tokens | `amount: uint256` |
| `transferOwnership()` | Change owner (owner) | `newOwner: address` |

### EtherWallet.sol Functions

| Function | Description | Parameters |
|----------|-------------|-----------|
| `depositEth()` | Deposit ETH | `payable` |
| `withdrawEth()` | Withdraw ETH | `amount: uint256` |
| `getEthBalance()` | Get ETH balance | - |
| `getEthBalanceOf()` | Get balance of address | `account: address` |
| `depositToken()` | Deposit ERC20 | `tokenAddress: address, amount: uint256` |
| `withdrawToken()` | Withdraw ERC20 | `tokenAddress: address, amount: uint256` |
| `getTokenBalance()` | Get token balance | `tokenAddress: address` |
| `transferToken()` | Transfer tokens between users | `tokenAddress: address, to: address, amount: uint256` |
| `registerToken()` | Register token (owner) | `tokenAddress: address` |

##  Testing

Run the comprehensive test suite:

```bash

npm test


npx hardhat test test/MyToken.test.js
npx hardhat test test/EtherWallet.test.js


npx hardhat coverage
```

##  Deployment

### Local Network (Hardhat)
```bash
npm run deploy:localhost
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

Verify on Etherscan:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS Constructor_Args
```

### Mainnet
```bash
npm run deploy -- --network mainnet
```

## Available Scripts

```bash
npm run test             
npm run compile          
npm run deploy           
npm run deploy:localhost 
npm run deploy:sepolia   
npm run node             
npm run clean            
```

##  Security Features

-  ERC20 standard compliance
-  Input validation on all functions
-  Owner access controls
-  Zero address checks
-  Overflow/underflow protection (Solidity 0.8+)
-  Reentrancy-safe patterns
-  Event logging for all state changes

##  Frontend Usage

### Connecting Wallet
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. View your address and balance

### ETH Operations
- **Deposit**: Send ETH to contract
- **Withdraw**: Request ETH from contract

### Token Operations
- **Deposit**: Approve and deposit tokens
- **Withdraw**: Request tokens back
- **Transfer**: Send tokens to another wallet user

### Account Info
- Current connected address
- Network name
- Wallet type
- Recent transactions

##  Workflow Example

```javascript
// 1. Deploy contracts
npm run deploy:localhost

// 2. Get contract addresses from console output
// Update frontend/scripts/wallet-app.js with addresses

// 3. Open frontend in browser
// frontend/index.html

// 4. Connect MetaMask to localhost:8545

// 5. Deposit ETH
await wallet.depositEth({ value: ethers.parseEther("10") });

// 6. Approve token transfer
await token.approve(walletAddress, amount);

// 7. Deposit tokens
await wallet.depositToken(tokenAddress, amount);

// 8. Transfer tokens to another user
await wallet.transferToken(tokenAddress, recipientAddress, amount);
```

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is on the correct network (Hardhat: `127.0.0.1:8545`)
- Try disconnecting and reconnecting
- Check browser console for errors

### Contract Address Errors
- Verify addresses in `frontend/scripts/wallet-app.js`
- Check `deployments.json` for correct addresses
- Ensure contracts are deployed to the network

### Transaction Failures
- Check gas balance (need ETH for gas)
- Verify token approvals before deposits
- Check contract permissions in wallet

### Compilation Errors
- Run `npm install` to update dependencies
- Run `npm run clean` to clear build cache
- Verify Node.js and Hardhat versions

## Learning Resources

- [Hardhat Documentation](https://hardhat.org/)
- [ethers.js Docs](https://docs.ethers.org/)
- [ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [Ethereum Development](https://ethereum.org/developers)
- [Solidity Docs](https://docs.soliditylang.org/)

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

This project is licensed under the MIT License - see LICENSE file for details

## Author

Built with ❤️ for Web3 developers
