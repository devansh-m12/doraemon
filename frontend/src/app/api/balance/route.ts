import { NextRequest, NextResponse } from 'next/server'
import { checkICPBalance, isValidPrincipal } from '@/utils/icp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const principalId = searchParams.get('principal')
  const network = searchParams.get('network') || 'mainnet'

  if (!principalId) {
    return NextResponse.json(
      { error: 'Principal ID is required' },
      { status: 400 }
    )
  }

  if (!isValidPrincipal(principalId)) {
    return NextResponse.json(
      { error: 'Invalid Principal ID format' },
      { status: 400 }
    )
  }

  try {
    const balance = await checkICPBalance(principalId, network as 'mainnet' | 'testnet')
    return NextResponse.json(balance)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch balance' },
      { status: 500 }
    )
  }
} 