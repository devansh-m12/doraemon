import { NextRequest, NextResponse } from 'next/server'
import { bridgeService } from '@/utils/bridge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ethereumSender, icpRecipient, amount } = body

    // Validate required fields
    if (!ethereumSender || !icpRecipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: ethereumSender, icpRecipient, amount' },
        { status: 400 }
      )
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      )
    }

    // Check if bridge service is ready
    if (!bridgeService.isReady()) {
      return NextResponse.json(
        { error: 'Bridge service not ready. Please configure environment variables.' },
        { status: 503 }
      )
    }

    // Create the swap
    const result = await bridgeService.createSwap({
      ethereumSender,
      icpRecipient,
      amount: amount.toString()
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        preimage: result.preimage,
        txHash: result.txHash,
        hashlock: result.hashlock,
        timelock: result.timelock,
        gasUsed: result.gasUsed
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Swap creation failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    )
  }

  try {
    const status = await bridgeService.getSwapStatus(orderId)
    
    if (status) {
      return NextResponse.json(status)
    } else {
      return NextResponse.json(
        { error: 'Swap not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get swap status' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, preimage } = body

    // Validate required fields
    if (!orderId || !preimage) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, preimage' },
        { status: 400 }
      )
    }

    // Check if bridge service is ready
    if (!bridgeService.isReady()) {
      return NextResponse.json(
        { error: 'Bridge service not ready. Please configure environment variables.' },
        { status: 503 }
      )
    }

    // Complete the swap
    const result = await bridgeService.claimSwap(orderId, preimage)

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        txHash: result.txHash,
        gasUsed: result.gasUsed
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Swap completion failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 