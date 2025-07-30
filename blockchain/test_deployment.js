const VoteLedger = artifacts.require("VoteLedger");

module.exports = async function(callback) {
  try {
    console.log("Testing VoteLedger contract deployment...");
    
    // Get the deployed contract instance
    const voteLedger = await VoteLedger.deployed();
    console.log("VoteLedger contract address:", voteLedger.address);
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log("Available accounts:", accounts.length);
    
    // Test casting a vote
    console.log("Casting a test vote...");
    await voteLedger.castVote("election-2024", "candidate-1", { from: accounts[0] });
    console.log("Vote cast successfully!");
    
    // Get all votes
    const votes = await voteLedger.getAllVotes();
    console.log("Total votes:", votes.length);
    console.log("First vote:", {
      electionId: votes[0].electionId,
      candidateId: votes[0].candidateId,
      voter: votes[0].voter
    });
    
    console.log("✅ Contract deployment and functionality test passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
  
  callback();
};