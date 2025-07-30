// backend/src/scripts/setupBlockchain.ts
import { setupBlockchain, checkSetup, deployContract, testContract } from '../utils/blockchainSetup'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'setup'

  console.log('🔗 ClearVote Kenya - Blockchain Setup Tool\n')

  switch (command) {
    case 'check':
      await checkSetup()
      break
    
    case 'deploy':
      await deployContract()
      break
    
    case 'test':
      await testContract()
      break
    
    case 'setup':
    default:
      await setupBlockchain()
      break
  }

  process.exit(0)
}

main().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})