# Ganache GUI Setup Guide

## Step 1: Install Ganache GUI

If you don't have Ganache GUI installed, download it from:
- **Website**: https://trufflesuite.com/ganache/
- **Direct Download**: https://github.com/trufflesuite/ganache-ui/releases

## Step 2: Configure Ganache GUI

1. **Open Ganache GUI**
2. **Create a New Workspace** or use **Quickstart**
3. **Configure the Server Settings**:
   - Go to **Settings** (gear icon)
   - Click on **Server** tab
   - Set the following:
     - **Hostname**: `127.0.0.1`
     - **Port Number**: `7545`
     - **Network ID**: `5777`
     - **Automine**: `On` (recommended for development)
   - Click **Save and Restart**

## Step 3: Verify Connection

Your Ganache GUI should now show:
- 10 accounts with 100 ETH each
- Network running on `127.0.0.1:7545`
- Network ID: `5777`

## Step 4: Deploy Contracts

With Ganache GUI running, execute these commands in your terminal:

```bash
# Clean previous builds
rm -rf build/

# Compile contracts
npx truffle compile

# Deploy to Ganache GUI
npx truffle migrate

# Test the deployment
npx truffle exec test_deployment.js
```

## Step 5: Monitor Transactions

In Ganache GUI, you can:
- **Accounts Tab**: View account balances and addresses
- **Blocks Tab**: See all mined blocks
- **Transactions Tab**: Monitor all contract deployments and function calls
- **Contracts Tab**: View deployed contract details
- **Events Tab**: See emitted events from your contracts

## Troubleshooting

If you get connection errors:
1. Ensure Ganache GUI is running
2. Check that the port is `7545` in both Ganache and `truffle-config.js`
3. Verify the Network ID matches (`5777`)
4. Try restarting Ganache GUI

## Next Steps

Once connected, you can:
- Deploy contracts with `npx truffle migrate`
- Interact with contracts using `npx truffle console`
- Run tests with `npx truffle test`
- Monitor all blockchain activity in the Ganache GUI