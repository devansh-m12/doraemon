import { NextRequest, NextResponse } from 'next/server'
import { getBridgeTransactions, getTransactionHistory } from '@/utils/icp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const principalId = searchParams.get('principal')
  const network = searchParams.get('network') || 'mainnet'
  const type = searchParams.get('type') || 'bridge' // 'bridge' or 'account'

  try {
    let transactions

    if (type === 'account' && principalId) {
      transactions = await getTransactionHistory(principalId, network as 'mainnet' | 'testnet')
    } else {
      transactions = await getBridgeTransactions(network as 'mainnet' | 'testnet')
    }

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
} 