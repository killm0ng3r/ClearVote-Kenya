# Quick Start Guide - Connect to Ganache GUI

## Current Status
✅ Contracts compiled successfully  
❌ Need to configure Ganache GUI connection

## Step-by-Step Setup

### 1. Configure Ganache GUI
Since Ganache GUI opened, you need to configure it:

1. **In Ganache GUI:**
   - Click **"NEW WORKSPACE"** or **"QUICKSTART"**
   - If using New Workspace:
     - Give it a name (e.g., "ClearVote Kenya")
     - Click **"ADD PROJECT"** and select this folder: `/Users/alan/clearvote-kenya/blockchain`
     - Click **"SAVE WORKSPACE"**

2. **Verify Server Settings:**
   - Click the **Settings/Gear icon** in Ganache GUI
   - Go to **"SERVER"** tab
   - Ensure these settings:
     - **HOSTNAME**: `127.0.0.1`
     - **PORT NUMBER**: `7545`
     - **NETWORK ID**: `5777`
   - Click **"SAVE AND RESTART"**

### 2. Verify Ganache is Running
You should see:
- 10 accounts with 100.00 ETH each
- Server running at `HTTP://127.0.0.1:7545`
- Network ID: 5777

### 3. Deploy Contracts
Once Ganache GUI shows it's running, run:
```bash
npx truffle migrate
```

### 4. Test Deployment
After successful deployment:
```bash
npx truffle exec test_deployment.js
```

## Troubleshooting

**If you get "CONNECTION ERROR":**
1. Make sure Ganache GUI is running (not just opened)
2. Check the server settings match (port 7545, network ID 5777)
3. Try restarting Ganache GUI
4. Ensure no firewall is blocking port 7545

**Alternative: Use Different Port**
If Ganache GUI is using a different port, update `truffle-config.js`:
- Change `port: 7545` to match Ganache's actual port
- Change `network_id: "5777"` to match Ganache's network ID

## Next Steps
Once connected, you'll see all transactions in Ganache GUI's:
- **Accounts** tab (balance changes)
- **Blocks** tab (mined blocks)
- **Transactions** tab (contract deployments)
- **Contracts** tab (deployed contracts)