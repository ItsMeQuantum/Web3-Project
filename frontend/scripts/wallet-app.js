// Contract ABIs
const TOKEN_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

const WALLET_ABI = [
  "function depositEth() public payable",
  "function withdrawEth(uint256 amount) public",
  "function getEthBalance() public view returns (uint256)",
  "function getEthBalanceOf(address account) public view returns (uint256)",
  "function depositToken(address tokenAddress, uint256 amount) public",
  "function withdrawToken(address tokenAddress, uint256 amount) public",
  "function getTokenBalance(address tokenAddress) public view returns (uint256)",
  "function transferToken(address tokenAddress, address to, uint256 amount) public",
  "event EthDeposited(address indexed user, uint256 amount)",
  "event EthWithdrawn(address indexed user, uint256 amount)",
];

// Global variables
let provider;
let signer;
let userAddress;
let tokenContract;
let walletContract;
let transactions = [];

// Load contract addresses (update these after deployment)
const CONTRACTS = {
  TOKEN_ADDRESS: "0x...", // Update after deployment
  WALLET_ADDRESS: "0x...", // Update after deployment
};

// Initialize app
async function initApp() {
  try {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      
      // Listen for account/chain changes
      window.ethereum.on("accountsChanged", () => location.reload());
      window.ethereum.on("chainChanged", () => location.reload());
    } else {
      showError("Please install MetaMask or use a Web3 wallet");
      return;
    }
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// Connect wallet
async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    signer = await provider.getSigner();

    // Update UI
    document.getElementById("accountAddress").textContent = userAddress;
    document.getElementById("statusIndicator").className = "indicator connected";
    document.getElementById("statusText").textContent = "Connected";
    document.getElementById("connectBtn").textContent = "Connected ✓";
    document.getElementById("connectBtn").disabled = true;

    // Get network info
    const network = await provider.getNetwork();
    document.getElementById("networkName").textContent = network.name || "Unknown";

    // Initialize contracts
    initContracts();
    updateBalances();
  } catch (error) {
    showError("Failed to connect wallet: " + error.message);
  }
}

// Initialize contracts
function initContracts() {
  if (!signer) return;

  tokenContract = new ethers.Contract(CONTRACTS.TOKEN_ADDRESS, TOKEN_ABI, signer);
  walletContract = new ethers.Contract(CONTRACTS.WALLET_ADDRESS, WALLET_ABI, signer);

  loadTokenInfo();
}

// Load token information
async function loadTokenInfo() {
  try {
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const totalSupply = await tokenContract.totalSupply();

    document.getElementById("tokenName").textContent = name;
    document.getElementById("tokenSymbol").textContent = symbol;
    document.getElementById("totalSupply").textContent = 
      ethers.formatEther(totalSupply) + " " + symbol;
  } catch (error) {
    console.error("Error loading token info:", error);
  }
}

// Update balances
async function updateBalances() {
  if (!userAddress || !tokenContract || !walletContract) return;

  try {
    // ETH Balance
    const ethBalance = await walletContract.getEthBalance();
    document.getElementById("ethBalance").textContent = 
      ethers.formatEther(ethBalance) + " ETH";

    // Token Balance
    const tokenBalance = await walletContract.getTokenBalance(CONTRACTS.TOKEN_ADDRESS);
    const symbol = await tokenContract.symbol();
    document.getElementById("tokenBalance").textContent = 
      ethers.formatEther(tokenBalance) + " " + symbol;
  } catch (error) {
    console.error("Error updating balances:", error);
  }
}

// Deposit ETH
async function depositETH() {
  try {
    const amount = document.getElementById("ethAmount").value;
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const tx = await walletContract.depositEth({
      value: ethers.parseEther(amount),
    });

    showInfo("Transaction pending...");
    await tx.wait();
    
    showSuccess("ETH deposited successfully!");
    document.getElementById("ethAmount").value = "";
    updateBalances();
    addTransaction("ETH Deposit", amount + " ETH");
  } catch (error) {
    showError("Deposit failed: " + error.message);
  }
}

// Withdraw ETH
async function withdrawETH() {
  try {
    const amount = document.getElementById("ethAmount").value;
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const tx = await walletContract.withdrawEth(ethers.parseEther(amount));

    showInfo("Transaction pending...");
    await tx.wait();
    
    showSuccess("ETH withdrawn successfully!");
    document.getElementById("ethAmount").value = "";
    updateBalances();
    addTransaction("ETH Withdrawal", amount + " ETH");
  } catch (error) {
    showError("Withdrawal failed: " + error.message);
  }
}

// Deposit Token
async function depositToken() {
  try {
    const amount = document.getElementById("tokenAmount").value;
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const parsedAmount = ethers.parseEther(amount);

    // First approve
    showInfo("Approving token...");
    const approveTx = await tokenContract.approve(
      CONTRACTS.WALLET_ADDRESS,
      parsedAmount
    );
    await approveTx.wait();

    // Then deposit
    showInfo("Depositing token...");
    const depositTx = await walletContract.depositToken(
      CONTRACTS.TOKEN_ADDRESS,
      parsedAmount
    );
    await depositTx.wait();

    showSuccess("Token deposited successfully!");
    document.getElementById("tokenAmount").value = "";
    updateBalances();
    addTransaction("Token Deposit", amount);
  } catch (error) {
    showError("Deposit failed: " + error.message);
  }
}

// Withdraw Token
async function withdrawToken() {
  try {
    const amount = document.getElementById("tokenAmount").value;
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const tx = await walletContract.withdrawToken(
      CONTRACTS.TOKEN_ADDRESS,
      ethers.parseEther(amount)
    );

    showInfo("Transaction pending...");
    await tx.wait();

    showSuccess("Token withdrawn successfully!");
    document.getElementById("tokenAmount").value = "";
    updateBalances();
    addTransaction("Token Withdrawal", amount);
  } catch (error) {
    showError("Withdrawal failed: " + error.message);
  }
}

// Transfer Token
async function transferToken() {
  try {
    const recipient = document.getElementById("recipientAddress").value;
    const amount = document.getElementById("transferAmount").value;

    if (!recipient || !recipient.startsWith("0x")) {
      showError("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const tx = await walletContract.transferToken(
      CONTRACTS.TOKEN_ADDRESS,
      recipient,
      ethers.parseEther(amount)
    );

    showInfo("Transfer pending...");
    await tx.wait();

    showSuccess("Tokens transferred successfully!");
    document.getElementById("recipientAddress").value = "";
    document.getElementById("transferAmount").value = "";
    updateBalances();
    addTransaction("Token Transfer to " + recipient.slice(0, 6) + "...", amount);
  } catch (error) {
    showError("Transfer failed: " + error.message);
  }
}

// UI Helper functions
function showSuccess(message) {
  const status = document.getElementById("ethStatus");
  status.innerHTML = `<div class="status success">${message}</div>`;
  setTimeout(() => status.innerHTML = "", 5000);
}

function showError(message) {
  const status = document.getElementById("ethStatus");
  status.innerHTML = `<div class="status error">${message}</div>`;
  setTimeout(() => status.innerHTML = "", 5000);
}

function showInfo(message) {
  const status = document.getElementById("ethStatus");
  status.innerHTML = `<div class="status info">${message}</div>`;
}

function addTransaction(type, amount) {
  transactions.unshift({
    type,
    amount,
    timestamp: new Date().toLocaleTimeString(),
  });

  const list = document.getElementById("transactionList");
  if (transactions.length === 0) {
    list.innerHTML = "<div class='transaction-item'>No transactions yet</div>";
  } else {
    list.innerHTML = transactions
      .slice(0, 10)
      .map(
        (tx) =>
          `<div class="transaction-item"><strong>${tx.type}</strong> - ${tx.amount}<br><small>${tx.timestamp}</small></div>`
      )
      .join("");
  }
}

// Connect button handler
document.getElementById("connectBtn").addEventListener("click", connectWallet);

// Initialize on load
window.addEventListener("load", initApp);
