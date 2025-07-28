import { NextRequest, NextResponse } from 'next/server'
import { bridgeService } from '@/utils/bridge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'bridge' // 'bridge' or 'recent'

  try {
    let transactions

    if (type === 'recent') {
      // Get real recent transactions from the bridge contract
      transactions = await bridgeService.getRecentTransactions(20)
    } else {
      // Get bridge transactions (this would be from ICP canister in a full implementation)
      // For now, we'll use the bridge service recent transactions
      transactions = await bridgeService.getRecentTransactions(20)
    }

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
} 