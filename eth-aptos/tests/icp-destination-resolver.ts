import { TokenUtils, OrderConfig, CreateOrderResult, FillOrderResult } from '../fusion_swap_icp/tests/token-utils'
import { ICRCUtils, Account, TransferResult, ApproveResult } from '../fusion_swap_icp/tests/icrc-utils'
import { config } from './config'
import { createHash } from 'crypto'

export class ICPDestinationResolver {
    private tokenUtils: TokenUtils
    private icrcUtils: ICRCUtils
    private fusionSwapCanisterId: string
    private icrc1CanisterId: string

    constructor() {
        this.fusionSwapCanisterId = config.icp.fusionSwapCanisterId
        this.icrc1CanisterId = config.icp.icrc1CanisterId
        this.tokenUtils = new TokenUtils()
        this.icrcUtils = new ICRCUtils(this.icrc1CanisterId)
    }

    /**
     * Create an order on ICP using the fusion swap canister
     */
    async createOrder(orderConfig: OrderConfig, identity: string): Promise<CreateOrderResult> {
        try {
            console.log(`[ICP] Creating order with ID: ${orderConfig.id}`)
            const result = await this.tokenUtils.createOrderWithDfx(orderConfig, identity)
            
            if (result.success) {
                console.log(`[ICP] Order ${orderConfig.id} created successfully`)
            } else {
                console.error(`[ICP] Failed to create order ${orderConfig.id}: ${result.error}`)
            }
            
            return result
        } catch (error) {
            console.error(`[ICP] Error creating order: ${error}`)
            return {
                success: false,
                error: `ICP order creation failed: ${error}`
            }
        }
    }

    /**
     * Fill an order on ICP using the fusion swap canister
     */
    async fillOrder(orderId: number, amount: number, identity: string): Promise<FillOrderResult> {
        try {
            console.log(`[ICP] Filling order ${orderId} with amount ${amount}`)
            const result = await this.tokenUtils.fillOrderWithDfx(orderId, amount, identity)
            
            if (result.success) {
                console.log(`[ICP] Order ${orderId} filled successfully`)
            } else {
                console.error(`[ICP] Failed to fill order ${orderId}: ${result.error}`)
            }
            
            return result
        } catch (error) {
            console.error(`[ICP] Error filling order: ${error}`)
            return {
                success: false,
                error: `ICP order filling failed: ${error}`
            }
        }
    }

    /**
     * Verify if an order exists on ICP
     */
    async verifyOrder(orderId: number): Promise<boolean> {
        try {
            console.log(`[ICP] Verifying order ${orderId}`)
            const exists = await this.tokenUtils.verifyOrder(orderId)
            console.log(`[ICP] Order ${orderId} exists: ${exists}`)
            return exists
        } catch (error) {
            console.error(`[ICP] Error verifying order: ${error}`)
            return false
        }
    }

    /**
     * Get order details from ICP
     */
    async getOrder(orderId: number): Promise<OrderConfig | null> {
        try {
            console.log(`[ICP] Getting order ${orderId}`)
            const order = await this.tokenUtils.getOrder(orderId)
            return order
        } catch (error) {
            console.error(`[ICP] Error getting order: ${error}`)
            return null
        }
    }

    /**
     * Transfer tokens on ICP
     */
    async transferTokens(fromIdentity: string, toPrincipal: string, amount: number): Promise<boolean> {
        try {
            console.log(`[ICP] Transferring ${amount} tokens from ${fromIdentity} to ${toPrincipal}`)
            const result = await this.tokenUtils.transferTokens(fromIdentity, toPrincipal, amount)
            return result
        } catch (error) {
            console.error(`[ICP] Error transferring tokens: ${error}`)
            return false
        }
    }

    /**
     * Get balance for an account on ICP
     */
    async getBalance(account: Account): Promise<number> {
        try {
            console.log(`[ICP] Getting balance for account: ${account.owner}`)
            const result = await this.icrcUtils.getBalance(account)
            
            if (result.success && result.balance !== undefined) {
                console.log(`[ICP] Balance: ${result.balance}`)
                return result.balance
            } else {
                console.error(`[ICP] Failed to get balance: ${result.error}`)
                return 0
            }
        } catch (error) {
            console.error(`[ICP] Error getting balance: ${error}`)
            return 0
        }
    }

    /**
     * Withdraw funds from ICP order using secret
     */
    async withdrawFromOrder(orderId: number, secret: string, identity: string): Promise<boolean> {
        try {
            console.log(`[ICP] Withdrawing from order ${orderId} using secret`)
            
            // First verify the order exists
            const orderExists = await this.verifyOrder(orderId)
            if (!orderExists) {
                console.error(`[ICP] Order ${orderId} does not exist`)
                return false
            }

            // Get order details
            const order = await this.getOrder(orderId)
            if (!order) {
                console.error(`[ICP] Failed to get order ${orderId} details`)
                return false
            }

            // In a cross-chain scenario, the taker should be receiving tokens, not spending them
            // The secret is used to unlock the funds that were escrowed
            // We need to call fill_order with the secret to receive the tokens
            console.log(`[ICP] Using secret to unlock funds from order ${orderId}`)
            
            // Convert the secret to the format expected by the canister
            const secretBytes = new TextEncoder().encode(secret)
            const secretArray = Array.from(secretBytes)
            
            // Fill the order with the secret to withdraw funds
            // The taker will receive the src_amount tokens
            const fillResult = await this.tokenUtils.fillOrderWithDfx(orderId, order.src_amount, identity, secret)
            
            if (fillResult.success) {
                console.log(`[ICP] Successfully withdrew from order ${orderId}`)
                return true
            } else {
                console.error(`[ICP] Failed to withdraw from order ${orderId}: ${fillResult.error}`)
                return false
            }
        } catch (error) {
            console.error(`[ICP] Error withdrawing from order: ${error}`)
            return false
        }
    }

    /**
     * Cancel an order on ICP
     */
    async cancelOrder(orderId: number, identity: string): Promise<boolean> {
        try {
            console.log(`[ICP] Cancelling order ${orderId}`)
            
            // Verify order exists
            const orderExists = await this.verifyOrder(orderId)
            if (!orderExists) {
                console.error(`[ICP] Order ${orderId} does not exist`)
                return false
            }

            // For ICP, cancellation might involve different logic
            // This is a placeholder for actual cancellation implementation
            console.log(`[ICP] Order ${orderId} cancellation would be implemented here`)
            
            // For now, we'll just verify the order exists
            return true
        } catch (error) {
            console.error(`[ICP] Error cancelling order: ${error}`)
            return false
        }
    }

    /**
     * Get real balance for a principal on ICP
     */
    async getPrincipalBalance(principal: string): Promise<number> {
        try {
            const account: Account = {
                owner: principal,
                subaccount: undefined
            }
            return await this.getBalance(account)
        } catch (error) {
            console.error(`[ICP] Error getting principal balance: ${error}`)
            return 0
        }
    }

    /**
     * Approve tokens on ICP
     */
    async approveTokens(identity: string, spenderPrincipal: string, amount: number): Promise<boolean> {
        try {
            console.log(`[ICP] Approving ${amount} tokens for spender ${spenderPrincipal}`)
            const result = await this.tokenUtils.approveTokens(identity, spenderPrincipal, amount)
            return result
        } catch (error) {
            console.error(`[ICP] Error approving tokens: ${error}`)
            return false
        }
    }

    /**
     * Create a test order configuration for ICP
     */
    createTestOrderConfig(orderId: number, srcAmount: number, dstAmount: number, secret?: string): OrderConfig {
        const currentTime = Math.floor(Date.now() / 1000)
        
        // Generate secret hash if secret is provided
        let secretHash: number[] = new Array(32).fill(0)
        if (secret) {
            const secretBytes = new TextEncoder().encode(secret)
            const hashBytes = new Uint8Array(createHash('sha256').update(secretBytes).digest())
            secretHash = Array.from(hashBytes)
        }
        
        return {
            id: orderId,
            src_mint: this.icrc1CanisterId,
            dst_mint: this.icrc1CanisterId,
            maker: config.icp.testMakerPrincipal,
            src_amount: srcAmount,
            min_dst_amount: dstAmount,
            estimated_dst_amount: dstAmount,
            expiration_time: currentTime + 3600, // 1 hour from now
            fee: {
                protocol_fee_bps: 30,
                integrator_fee_bps: 20,
                surplus_bps: 10,
                max_cancel_premium: 100000000
            },
            auction: {
                start_time: currentTime,
                end_time: currentTime + 7200, // 2 hours from now
                start_price: srcAmount,
                end_price: dstAmount,
                current_price: srcAmount
            },
            cancellation_auction_secs: 3600,
            hashlock: {
                secret_hash: secretHash,
                revealed: false,
                reveal_time: null
            },
            timelock: {
                finality_lock_duration: 0,
                exclusive_withdraw_duration: 0,
                cancellation_timeout: 0,
                created_at: currentTime
            },
            status: 'Announced',
            created_at: currentTime
        }
    }

    /**
     * Get maker principal for an identity
     */
    getMakerPrincipal(identity: string): string {
        return this.tokenUtils.getMakerPrincipal(identity)
    }

    /**
     * Get taker principal for an identity
     */
    getTakerPrincipal(identity: string): string {
        // Use the tokenUtils to get the principal for the given identity
        return this.tokenUtils.getMakerPrincipal(identity)
    }
} 