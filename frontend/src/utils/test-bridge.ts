import { bridgeService } from './bridge'

/**
 * Test utility for verifying bridge service functionality
 */
export async function testBridgeService() {
  console.log('🧪 Testing Bridge Service...')
  
  try {
    // Check if bridge service is ready
    const isReady = bridgeService.isReady()
    console.log('Bridge Service Ready:', isReady)
    
    if (!isReady) {
      console.log('⚠️ Bridge service not ready. Check environment configuration.')
      return {
        success: false,
        error: 'Bridge service not initialized'
      }
    }
    
    // Get network info
    const networkInfo = bridgeService.getNetworkInfo()
    console.log('Network Info:', networkInfo)
    
    // Check balance
    const balance = await bridgeService.checkBalance()
    console.log('Wallet Balance:', balance, 'ETH')
    
    // Test swap creation (without actually creating a swap)
    const testParams = {
      ethereumSender: networkInfo?.walletAddress || '0x0000000000000000000000000000000000000000',
      icpRecipient: '2vxsx-fae',
      amount: '0.001'
    }
    
    console.log('Test Parameters:', testParams)
    
    return {
      success: true,
      isReady,
      networkInfo,
      balance,
      testParams
    }
    
  } catch (error) {
    console.error('❌ Bridge service test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test bridge service from browser console
 */
export function testFromConsole() {
  console.log('🔧 Bridge Service Test')
  console.log('=====================')
  
  testBridgeService().then(result => {
    console.log('Test Result:', result)
  }).catch(error => {
    console.error('Test Error:', error)
  })
}

// Make test function available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testBridgeService = testFromConsole
} 