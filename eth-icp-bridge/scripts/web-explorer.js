const express = require('express');
const { ethers } = require('ethers');
const NetworkConfig = require('./network-config');

/**
 * Simple Web Explorer for Local Network
 * Provides a web interface to view transactions and contract state
 */
class WebExplorer {
    constructor() {
        const networkConfig = new NetworkConfig();
        networkConfig.setupEnvironment();
        
        this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
        
        // Load contract ABI
        const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
        this.contract = new ethers.Contract(this.contractAddress, contractABI, this.provider);
        
        this.app = express();
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.use(express.static('public'));
        this.app.set('view engine', 'ejs');
        this.app.set('views', __dirname + '/views');

        // Home page
        this.app.get('/', async (req, res) => {
            try {
                const latestBlock = await this.provider.getBlockNumber();
                const contractBalance = await this.provider.getBalance(this.contractAddress);
                
                res.render('index', {
                    network: process.env.NETWORK_NAME,
                    contractAddress: this.contractAddress,
                    latestBlock,
                    contractBalance: ethers.formatEther(contractBalance),
                    title: 'Bridge Explorer'
                });
            } catch (error) {
                res.status(500).send('Error: ' + error.message);
            }
        });

        // Transaction details
        this.app.get('/tx/:hash', async (req, res) => {
            try {
                const txHash = req.params.hash;
                const tx = await this.provider.getTransaction(txHash);
                const receipt = await this.provider.getTransactionReceipt(txHash);
                
                if (!tx) {
                    return res.status(404).send('Transaction not found');
                }

                res.render('transaction', {
                    tx,
                    receipt,
                    contractAddress: this.contractAddress,
                    title: 'Transaction Details'
                });
            } catch (error) {
                res.status(500).send('Error: ' + error.message);
            }
        });

        // Contract state
        this.app.get('/contract', async (req, res) => {
            try {
                const bridgeFeePercentage = await this.contract.bridgeFeePercentage();
                const minSwapAmount = await this.contract.minSwapAmount();
                const maxSwapAmount = await this.contract.maxSwapAmount();
                const owner = await this.contract.owner();
                const balance = await this.provider.getBalance(this.contractAddress);

                res.render('contract', {
                    bridgeFeePercentage: bridgeFeePercentage.toString(),
                    minSwapAmount: ethers.formatEther(minSwapAmount),
                    maxSwapAmount: ethers.formatEther(maxSwapAmount),
                    owner,
                    balance: ethers.formatEther(balance),
                    contractAddress: this.contractAddress,
                    title: 'Contract State'
                });
            } catch (error) {
                res.status(500).send('Error: ' + error.message);
            }
        });

        // Recent transactions
        this.app.get('/recent', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const latestBlock = await this.provider.getBlockNumber();
                const transactions = [];

                for (let i = 0; i < limit; i++) {
                    const blockNumber = latestBlock - i;
                    const block = await this.provider.getBlock(blockNumber, true);
                    
                    if (block && block.transactions.length > 0) {
                        block.transactions.forEach(tx => {
                            transactions.push({
                                hash: tx.hash,
                                blockNumber: blockNumber,
                                from: tx.from,
                                to: tx.to,
                                value: ethers.formatEther(tx.value),
                                gasUsed: tx.gasLimit.toString(),
                                timestamp: new Date(block.timestamp * 1000).toISOString()
                            });
                        });
                    }
                }

                res.render('recent', {
                    transactions,
                    title: 'Recent Transactions'
                });
            } catch (error) {
                res.status(500).send('Error: ' + error.message);
            }
        });

        // API endpoints
        this.app.get('/api/tx/:hash', async (req, res) => {
            try {
                const txHash = req.params.hash;
                const tx = await this.provider.getTransaction(txHash);
                const receipt = await this.provider.getTransactionReceipt(txHash);
                
                res.json({
                    transaction: tx,
                    receipt: receipt
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/contract', async (req, res) => {
            try {
                const bridgeFeePercentage = await this.contract.bridgeFeePercentage();
                const minSwapAmount = await this.contract.minSwapAmount();
                const maxSwapAmount = await this.contract.maxSwapAmount();
                const owner = await this.contract.owner();
                const balance = await this.provider.getBalance(this.contractAddress);

                res.json({
                    bridgeFeePercentage: bridgeFeePercentage.toString(),
                    minSwapAmount: ethers.formatEther(minSwapAmount),
                    maxSwapAmount: ethers.formatEther(maxSwapAmount),
                    owner,
                    balance: ethers.formatEther(balance)
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log('🌐 Web Explorer started!');
            console.log(`📍 URL: http://localhost:${port}`);
            console.log(`🔗 Network: ${process.env.NETWORK_NAME}`);
            console.log(`📝 Contract: ${this.contractAddress}`);
            console.log('');
            console.log('📋 Available Pages:');
            console.log(`  - Home: http://localhost:${port}/`);
            console.log(`  - Contract: http://localhost:${port}/contract`);
            console.log(`  - Recent TX: http://localhost:${port}/recent`);
            console.log(`  - TX Details: http://localhost:${port}/tx/<hash>`);
            console.log('');
        });
    }
}

// Create views directory and basic templates
const fs = require('fs');
const path = require('path');

function createViews() {
    const viewsDir = path.join(__dirname, 'views');
    if (!fs.existsSync(viewsDir)) {
        fs.mkdirSync(viewsDir);
    }

    // Create basic HTML template
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #3498db; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
        .info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .tx-hash { font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Bridge Explorer</h1>
            <p>Network: <%= network || 'Local Hardhat' %></p>
        </div>
        
        <div class="nav">
            <a href="/">🏠 Home</a>
            <a href="/contract">📝 Contract</a>
            <a href="/recent">📜 Recent TX</a>
        </div>
        
        <%- body %>
    </div>
</body>
</html>`;

    // Create index template
    const indexTemplate = `
<div class="info">
    <h2>📊 Network Status</h2>
    <p><strong>Latest Block:</strong> <%= latestBlock %></p>
    <p><strong>Contract Address:</strong> <span class="tx-hash"><%= contractAddress %></span></p>
    <p><strong>Contract Balance:</strong> <%= contractBalance %> ETH</p>
</div>

<div class="info">
    <h2>🔗 Quick Links</h2>
    <p><a href="/contract">📝 View Contract State</a></p>
    <p><a href="/recent">📜 View Recent Transactions</a></p>
    <p><a href="/recent?limit=50">📜 View Last 50 Transactions</a></p>
</div>

<div class="info">
    <h2>🔍 Search Transaction</h2>
    <form action="/tx/" method="get">
        <input type="text" name="hash" placeholder="Enter transaction hash" style="width: 400px; padding: 8px;">
        <button type="submit">Search</button>
    </form>
</div>`;

    // Create transaction template
    const transactionTemplate = `
<h2>📋 Transaction Details</h2>

<div class="info">
    <h3>Transaction Information</h3>
    <p><strong>Hash:</strong> <span class="tx-hash"><%= tx.hash %></span></p>
    <p><strong>Status:</strong> <span class="<%= receipt.status === 1 ? 'success' : 'error' %>"><%= receipt.status === 1 ? '✅ Success' : '❌ Failed' %></span></p>
    <p><strong>Block:</strong> <%= receipt.blockNumber %></p>
    <p><strong>From:</strong> <span class="tx-hash"><%= tx.from %></span></p>
    <p><strong>To:</strong> <span class="tx-hash"><%= tx.to || 'Contract Creation' %></span></p>
    <p><strong>Value:</strong> <%= ethers.formatEther(tx.value) %> ETH</p>
    <p><strong>Gas Used:</strong> <%= receipt.gasUsed.toString() %></p>
    <p><strong>Gas Price:</strong> <%= ethers.formatUnits(tx.gasPrice, 'gwei') %> gwei</p>
</div>

<% if (tx.to === contractAddress) { %>
<div class="info">
    <h3>🏗️ Contract Interaction</h3>
    <p>This transaction interacted with the bridge contract.</p>
</div>
<% } %>`;

    // Create contract template
    const contractTemplate = `
<h2>📝 Contract State</h2>

<div class="info">
    <h3>Bridge Configuration</h3>
    <p><strong>Contract Address:</strong> <span class="tx-hash"><%= contractAddress %></span></p>
    <p><strong>Bridge Fee:</strong> <%= bridgeFeePercentage %> basis points</p>
    <p><strong>Min Swap Amount:</strong> <%= minSwapAmount %> ETH</p>
    <p><strong>Max Swap Amount:</strong> <%= maxSwapAmount %> ETH</p>
    <p><strong>Owner:</strong> <span class="tx-hash"><%= owner %></span></p>
    <p><strong>Contract Balance:</strong> <%= balance %> ETH</p>
</div>`;

    // Create recent template
    const recentTemplate = `
<h2>📜 Recent Transactions</h2>

<table>
    <thead>
        <tr>
            <th>Hash</th>
            <th>Block</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
            <th>Gas</th>
        </tr>
    </thead>
    <tbody>
        <% transactions.forEach(function(tx) { %>
        <tr>
            <td><a href="/tx/<%= tx.hash %>" class="tx-hash"><%= tx.hash.substring(0, 10) %>...</a></td>
            <td><%= tx.blockNumber %></td>
            <td><span class="tx-hash"><%= tx.from.substring(0, 10) %>...</span></td>
            <td><span class="tx-hash"><%= tx.to ? tx.to.substring(0, 10) + '...' : 'Contract Creation' %></span></td>
            <td><%= tx.value %> ETH</td>
            <td><%= tx.gasUsed %></td>
        </tr>
        <% }); %>
    </tbody>
</table>`;

    // Write templates
    fs.writeFileSync(path.join(viewsDir, 'layout.ejs'), htmlTemplate);
    fs.writeFileSync(path.join(viewsDir, 'index.ejs'), indexTemplate);
    fs.writeFileSync(path.join(viewsDir, 'transaction.ejs'), transactionTemplate);
    fs.writeFileSync(path.join(viewsDir, 'contract.ejs'), contractTemplate);
    fs.writeFileSync(path.join(viewsDir, 'recent.ejs'), recentTemplate);
}

// Start the web explorer
if (require.main === module) {
    createViews();
    const explorer = new WebExplorer();
    explorer.start();
}

module.exports = WebExplorer; 