import { NextRequest, NextResponse } from 'next/server'
import { bridgeService } from '@/utils/bridge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    )
  }

  try {
    // Check if bridge service is ready
    if (!bridgeService.isReady()) {
      return NextResponse.json(
        { error: 'Bridge service not ready. Please configure environment variables.' },
        { status: 503 }
      )
    }

    // Get real balance from bridge service
    const balance = await bridgeService.checkBalance()
    const contractInfo = await bridgeService.getContractInfo()
    const networkInfo = bridgeService.getNetworkInfo()

    if (balance === null) {
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      address: address,
      balance: balance,
      currency: 'ETH',
      network: networkInfo?.network || 'unknown',
      contractInfo: contractInfo,
      networkInfo: networkInfo,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch balance' },
      { status: 500 }
    )
  }
} 