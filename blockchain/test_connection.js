const Web3 = require('web3');

async function testConnection() {
  try {
    console.log('🔍 Testing connection to Ganache GUI...');
    console.log('Expected: http://127.0.0.1:7545');
    
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Test connection
    const networkId = await web3.eth.net.getId();
    console.log('✅ Connected successfully!');
    console.log('📊 Network ID:', networkId);
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log('👥 Available accounts:', accounts.length);
    
    if (accounts.length > 0) {
      const balance = await web3.eth.getBalance(accounts[0]);
      const ethBalance = web3.utils.fromWei(balance, 'ether');
      console.log('💰 First account balance:', ethBalance, 'ETH');
    }
    
    console.log('\n🎉 Ganache GUI is properly configured!');
    console.log('✨ You can now run: npx truffle migrate');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n📋 Please check:');
    console.log('1. Ganache GUI is running (not just opened)');
    console.log('2. Server settings: 127.0.0.1:7545');
    console.log('3. Network ID: 5777');
    console.log('4. Try restarting Ganache GUI');
  }
}

testConnection();