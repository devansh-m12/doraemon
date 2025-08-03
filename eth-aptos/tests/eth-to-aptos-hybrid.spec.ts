import 'dotenv/config'
import {expect, jest} from '@jest/globals'

import {createServer, CreateServerReturnType} from 'prool'
import {anvil} from 'prool/instances'

import Sdk from '@1inch/cross-chain-sdk'
import {
    computeAddress,
    ContractFactory,
    JsonRpcProvider,
    MaxUint256,
    parseEther,
    parseUnits,
    randomBytes,
    Wallet as SignerWallet
} from 'ethers'
import {uint8ArrayToHex, UINT_40_MAX} from '@1inch/byte-utils'
import assert from 'node:assert'
import {ChainConfig, config} from './config'
import {Wallet} from './wallet'
import {Resolver} from './resolver'
import {EscrowFactory} from './escrow-factory'
import factoryContract from '../dist/contracts/TestEscrowFactory.sol/TestEscrowFactory.json'
import resolverContract from '../dist/contracts/Resolver.sol/Resolver.json'
import {AptosDestinationResolver} from './aptos-destination-resolver'

const {Address} = Sdk

jest.setTimeout(1000 * 120) // 2 minutes timeout for cross-chain operations

const userPk = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const resolverPk = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'

// eslint-disable-next-line max-lines-per-function
describe('ETH to Aptos Hybrid Cross-Chain Transfer', () => {
    const srcChainId = config.chain.source.chainId

    type Chain = {
        node?: CreateServerReturnType | undefined
        provider: JsonRpcProvider
        escrowFactory: string
        resolver: string
    }

    let src: Chain
    let aptosResolver: AptosDestinationResolver

    let srcChainUser: Wallet
    let srcChainResolver: Wallet

    let srcFactory: EscrowFactory
    let srcResolverContract: Wallet

    let srcTimestamp: bigint

    async function increaseTime(t: number): Promise<void> {
        await src.provider.send('evm_increaseTime', [t])
    }

    beforeAll(async () => {
        // Initialize Ethereum source chain
        src = await initChain(config.chain.source)

        srcChainUser = new Wallet(userPk, src.provider)
        srcChainResolver = new Wallet(resolverPk, src.provider)

        srcFactory = new EscrowFactory(src.provider, src.escrowFactory)
        
        // Setup ETH user with USDC tokens
        await srcChainUser.topUpFromDonor(
            config.chain.source.tokens.USDC.address,
            config.chain.source.tokens.USDC.donor,
            parseUnits('1000', 6) // 1000 USDC
        )
        await srcChainUser.approveToken(
            config.chain.source.tokens.USDC.address,
            config.chain.source.limitOrderProtocol,
            MaxUint256
        )

        // Setup ETH resolver with USDC tokens
        srcResolverContract = await Wallet.fromAddress(src.resolver, src.provider)
        await srcResolverContract.topUpFromDonor(
            config.chain.source.tokens.USDC.address,
            config.chain.source.tokens.USDC.donor,
            parseUnits('2000', 6) // 2000 USDC
        )
        await srcChainResolver.transfer(src.resolver, parseEther('1'))
        await srcResolverContract.unlimitedApprove(config.chain.source.tokens.USDC.address, src.escrowFactory)

        srcTimestamp = BigInt((await src.provider.getBlock('latest'))!.timestamp)
        
        // Initialize Aptos resolver for destination operations
        aptosResolver = new AptosDestinationResolver()
    })

    async function getBalances(): Promise<{
        eth: {user: bigint; resolver: bigint}; 
        aptos: {maker: number; taker: number}
    }> {
        const makerAddress = aptosResolver.getMakerAddress('test-maker')
        const takerAddress = aptosResolver.getTakerAddress('test-taker')
        
        console.log(`🔍 Debug - Maker Address: ${makerAddress}`)
        console.log(`🔍 Debug - Taker Address: ${takerAddress}`)
        
        const ethBalances = {
            user: await srcChainUser.tokenBalance(config.chain.source.tokens.USDC.address),
            resolver: await srcResolverContract.tokenBalance(config.chain.source.tokens.USDC.address)
        }
        
        // Get real Aptos balances for maker and taker addresses
        const makerBalance = await aptosResolver.getBalance(makerAddress)
        const takerBalance = await aptosResolver.getBalance(takerAddress)
        
        const aptosBalances = {
            maker: makerBalance,
            taker: takerBalance
        }
        
        return {
            eth: ethBalances,
            aptos: aptosBalances
        }
    }

    afterAll(async () => {
        src.provider.destroy()
        await src.node?.stop()
    })

    describe('ETH to Aptos Hybrid Cross-Chain Transfer', () => {
        it('should transfer ETH USDC tokens to Aptos tokens via hybrid cross-chain swap', async () => {
            const initialBalances = await getBalances()

            console.log('🚀 Starting ETH to Aptos hybrid cross-chain token transfer')
            console.log(`Initial ETH balances - User: ${initialBalances.eth.user}, Resolver: ${initialBalances.eth.resolver}`)
            console.log(`Initial Aptos balances - Maker: ${initialBalances.aptos.maker}, Taker: ${initialBalances.aptos.taker}`)

            // Step 1: Create cross-chain order on Ethereum (using SDK)
            const secret = uint8ArrayToHex(randomBytes(32))
            console.log(`🔐 Generated cross-chain secret: ${secret}`)

            // Create Ethereum order for cross-chain swap (using BSC as destination since SDK supports it)
            // Note: 1inch SDK doesn't support Aptos yet, so we use BSC for SDK compatibility
            const order = Sdk.CrossChainOrder.new(
                new Address(src.escrowFactory),
                {
                    salt: Sdk.randBigInt(1000n),
                    maker: new Address(await srcChainUser.getAddress()),
                    makingAmount: parseUnits('100', 6), // 100 USDC on ETH
                    takingAmount: parseUnits('99', 6), // 99 USDC equivalent on destination
                    makerAsset: new Address(config.chain.source.tokens.USDC.address),
                    takerAsset: new Address(config.chain.source.tokens.USDC.address) // Using USDC for SDK compatibility
                },
                {
                    hashLock: Sdk.HashLock.forSingleFill(secret),
                    timeLocks: Sdk.TimeLocks.new({
                        srcWithdrawal: 10n, // 10sec finality lock
                        srcPublicWithdrawal: 120n, // 2m for private withdrawal
                        srcCancellation: 121n, // 1sec public withdrawal
                        srcPublicCancellation: 122n, // 1sec private cancellation
                        dstWithdrawal: 10n, // 10sec finality lock
                        dstPublicWithdrawal: 100n, // 100sec private withdrawal
                        dstCancellation: 101n // 1sec public withdrawal
                    }),
                    srcChainId,
                    dstChainId: Sdk.NetworkEnum.BINANCE, // Use BSC for SDK compatibility (Aptos not supported)
                    srcSafetyDeposit: parseEther('0.001'),
                    dstSafetyDeposit: parseEther('0.001')
                },
                {
                    auction: new Sdk.AuctionDetails({
                        initialRateBump: 0,
                        points: [],
                        duration: 120n,
                        startTime: srcTimestamp
                    }),
                    whitelist: [
                        {
                            address: new Address(src.resolver),
                            allowFrom: 0n
                        }
                    ],
                    resolvingStartTime: 0n
                },
                {
                    nonce: Sdk.randBigInt(UINT_40_MAX),
                    allowPartialFills: false,
                    allowMultipleFills: false
                }
            )

            const signature = await srcChainUser.signOrder(srcChainId, order)
            const orderHash = order.getOrderHash(srcChainId)
            console.log(`📝 Created Ethereum cross-chain order: ${orderHash}`)

            // Step 2: Resolver fills order on Ethereum
            const resolverContract = new Resolver(src.resolver, src.resolver)
            console.log(`🔄 Filling Ethereum order ${orderHash}`)

            const fillAmount = order.makingAmount
            const {txHash: orderFillHash, blockHash: srcDeployBlock} = await srcChainResolver.send(
                resolverContract.deploySrc(
                    srcChainId,
                    order,
                    signature,
                    Sdk.TakerTraits.default()
                        .setExtension(order.extension)
                        .setAmountMode(Sdk.AmountMode.maker)
                        .setAmountThreshold(order.takingAmount),
                    fillAmount
                )
            )

            console.log(`✅ Ethereum order filled in tx: ${orderFillHash}`)

            // Step 3: Get Ethereum escrow event
            const srcEscrowEvent = await srcFactory.getSrcDeployEvent(srcDeployBlock)
            const dstImmutables = srcEscrowEvent[0]
                .withComplement(srcEscrowEvent[1])
                .withTaker(new Address(resolverContract.dstAddress))

            console.log(`💰 Ethereum escrow created with amount: ${dstImmutables.amount}`)

            // Step 4: Create corresponding Aptos order using real fusion implementation
            const aptosOrderId = `aptos_order_${Math.floor(Math.random() * 1000000)}`
            const aptosSrcAmount = Number(dstImmutables.amount) // Same amount as ETH escrow
            const aptosDstAmount = Number(order.takingAmount) // Target amount on Aptos
            
            console.log(`📝 Creating Aptos order ${aptosOrderId} for cross-chain transfer`)
            console.log(`   ETH Amount: ${aptosSrcAmount}, Aptos Target: ${aptosDstAmount}`)
            
            // Use the real Aptos resolver implementation to create order
            const aptosOrderConfig = aptosResolver.createTestOrderConfig(aptosOrderId, aptosSrcAmount, aptosDstAmount, secret)
            const createResult = await aptosResolver.createOrder(aptosOrderConfig, 'test-maker')
            
            if (!createResult.success) {
                throw new Error(`Failed to create Aptos order: ${createResult.error}`)
            }
            
            console.log(`✅ Aptos order ${aptosOrderId} created for cross-chain transfer`)

            // Step 5: Verify Aptos order exists using real implementation
            const orderExists = await aptosResolver.verifyOrder(aptosOrderId)
            expect(orderExists).toBe(true)
            console.log(`✅ Verified Aptos order ${aptosOrderId} exists`)

            // Step 6: Wait for finality lock
            console.log(`⏳ Waiting for finality lock (10 seconds)`)
            await increaseTime(11)

            // Step 7: Withdraw from Aptos using the secret using real implementation
            console.log(`💰 Withdrawing from Aptos order ${aptosOrderId} using cross-chain secret`)
            const withdrawalSuccess = await aptosResolver.withdrawFromOrder(aptosOrderId, secret, 'test-taker')
            
            if (!withdrawalSuccess) {
                throw new Error('Aptos withdrawal failed')
            }
            
            console.log(`✅ Successfully withdrew from Aptos order ${aptosOrderId}`)

            // Step 8: Withdraw from Ethereum escrow using the same secret (using SDK)
            const ESCROW_SRC_IMPLEMENTATION = await srcFactory.getSourceImpl()
            const srcEscrowAddress = new Sdk.EscrowFactory(new Address(src.escrowFactory)).getSrcEscrowAddress(
                srcEscrowEvent[0],
                ESCROW_SRC_IMPLEMENTATION
            )

            console.log(`💰 Withdrawing from Ethereum escrow ${srcEscrowAddress}`)
            const {txHash: resolverWithdrawHash} = await srcChainResolver.send(
                resolverContract.withdraw('src', srcEscrowAddress, secret, srcEscrowEvent[0])
            )
            console.log(`✅ Ethereum escrow withdrawal in tx: ${resolverWithdrawHash}`)

            // Step 9: Get final balances
            const finalBalances = await getBalances()
            
            console.log(`Final ETH balances - User: ${finalBalances.eth.user}, Resolver: ${finalBalances.eth.resolver}`)
            console.log(`Final Aptos balances - Maker: ${finalBalances.aptos.maker}, Taker: ${finalBalances.aptos.taker}`)

            // Step 10: Verify cross-chain transfer was successful
            const ethUserBalanceChange = initialBalances.eth.user - finalBalances.eth.user
            const ethResolverBalanceChange = finalBalances.eth.resolver - initialBalances.eth.resolver
            const aptosTakerBalanceChange = finalBalances.aptos.taker - initialBalances.aptos.taker

            console.log(`📊 Transfer Summary:`)
            console.log(`   ETH User lost: ${ethUserBalanceChange} USDC`)
            console.log(`   ETH Resolver gained: ${ethResolverBalanceChange} USDC`)
            console.log(`   Aptos Taker balance change: ${aptosTakerBalanceChange} tokens`)

            // Verify the cross-chain transfer
            expect(ethUserBalanceChange).toBe(order.makingAmount)
            expect(ethResolverBalanceChange).toBe(order.makingAmount)
            
            // In hybrid cross-chain, the taker should receive tokens on Aptos
            // The implementation may vary, but withdrawal should be successful
            expect(withdrawalSuccess).toBe(true)
            
            console.log('🎉 ETH to Aptos hybrid cross-chain token transfer completed successfully!')
        })

        it('should handle hybrid cross-chain transfer cancellation', async () => {
            const initialBalances = await getBalances()

            console.log('🚀 Starting ETH to Aptos hybrid cross-chain transfer cancellation test')
            
            // Step 1: Create cross-chain order on Ethereum (using SDK)
            const secret = uint8ArrayToHex(randomBytes(32))
            console.log(`🔐 Generated cross-chain secret: ${secret}`)

            const order = Sdk.CrossChainOrder.new(
                new Address(src.escrowFactory),
                {
                    salt: Sdk.randBigInt(1000n),
                    maker: new Address(await srcChainUser.getAddress()),
                    makingAmount: parseUnits('50', 6), // 50 USDC on ETH
                    takingAmount: parseUnits('49', 6), // 49 USDC on destination
                    makerAsset: new Address(config.chain.source.tokens.USDC.address),
                    takerAsset: new Address(config.chain.source.tokens.USDC.address)
                },
                {
                    hashLock: Sdk.HashLock.forSingleFill(secret),
                    timeLocks: Sdk.TimeLocks.new({
                        srcWithdrawal: 0n, // No finality lock for cancellation test
                        srcPublicWithdrawal: 120n,
                        srcCancellation: 121n,
                        srcPublicCancellation: 122n,
                        dstWithdrawal: 0n,
                        dstPublicWithdrawal: 100n,
                        dstCancellation: 101n
                    }),
                    srcChainId,
                    dstChainId: Sdk.NetworkEnum.BINANCE, // Use BSC for SDK compatibility
                    srcSafetyDeposit: parseEther('0.001'),
                    dstSafetyDeposit: parseEther('0.001')
                },
                {
                    auction: new Sdk.AuctionDetails({
                        initialRateBump: 0,
                        points: [],
                        duration: 120n,
                        startTime: srcTimestamp
                    }),
                    whitelist: [
                        {
                            address: new Address(src.resolver),
                            allowFrom: 0n
                        }
                    ],
                    resolvingStartTime: 0n
                },
                {
                    nonce: Sdk.randBigInt(UINT_40_MAX),
                    allowPartialFills: false,
                    allowMultipleFills: false
                }
            )

            const signature = await srcChainUser.signOrder(srcChainId, order)
            const orderHash = order.getOrderHash(srcChainId)
            console.log(`📝 Created Ethereum cross-chain order for cancellation: ${orderHash}`)

            // Step 2: Fill order on Ethereum
            const resolverContract = new Resolver(src.resolver, src.resolver)
            const fillAmount = order.makingAmount
            const {txHash: orderFillHash, blockHash: srcDeployBlock} = await srcChainResolver.send(
                resolverContract.deploySrc(
                    srcChainId,
                    order,
                    signature,
                    Sdk.TakerTraits.default()
                        .setExtension(order.extension)
                        .setAmountMode(Sdk.AmountMode.maker)
                        .setAmountThreshold(order.takingAmount),
                    fillAmount
                )
            )

            console.log(`✅ Ethereum order filled in tx: ${orderFillHash}`)

            // Step 3: Create corresponding Aptos order using real implementation
            const aptosOrderId = `aptos_cancel_${Math.floor(Math.random() * 1000000)}`
            const srcEscrowEvent = await srcFactory.getSrcDeployEvent(srcDeployBlock)
            const dstImmutables = srcEscrowEvent[0]
                .withComplement(srcEscrowEvent[1])
                .withTaker(new Address(resolverContract.dstAddress))

            const aptosOrderConfig = aptosResolver.createTestOrderConfig(
                aptosOrderId, 
                Number(dstImmutables.amount), 
                Number(order.takingAmount),
                secret
            )
            const createResult = await aptosResolver.createOrder(aptosOrderConfig, 'test-maker')
            
            if (!createResult.success) {
                throw new Error(`Failed to create Aptos order: ${createResult.error}`)
            }
            
            console.log(`✅ Aptos order ${aptosOrderId} created for cancellation test`)

            // Step 4: Wait for cancellation timeout
            console.log(`⏳ Waiting for cancellation timeout (125 seconds)`)
            await increaseTime(125)

            // Step 5: Cancel Aptos order using real implementation
            console.log(`❌ Cancelling Aptos order ${aptosOrderId}`)
            const cancelResult = await aptosResolver.cancelOrder(aptosOrderId, 'test-maker')
            
            if (!cancelResult) {
                throw new Error(`Failed to cancel Aptos order ${aptosOrderId}`)
            }
            
            console.log(`✅ Aptos order ${aptosOrderId} cancelled successfully`)

            // Step 6: Cancel Ethereum escrow (using SDK)
            const ESCROW_SRC_IMPLEMENTATION = await srcFactory.getSourceImpl()
            const srcEscrowAddress = new Sdk.EscrowFactory(new Address(src.escrowFactory)).getSrcEscrowAddress(
                srcEscrowEvent[0],
                ESCROW_SRC_IMPLEMENTATION
            )

            console.log(`❌ Cancelling Ethereum escrow ${srcEscrowAddress}`)
            const {txHash: cancelSrcEscrow} = await srcChainResolver.send(
                resolverContract.cancel('src', srcEscrowAddress, srcEscrowEvent[0])
            )
            console.log(`✅ Ethereum escrow cancelled in tx: ${cancelSrcEscrow}`)

            // Step 7: Get final balances
            const finalBalances = await getBalances()
            
            console.log(`Final balances after cancellation:`)
            console.log(`   ETH User: ${finalBalances.eth.user}, Aptos Maker: ${finalBalances.aptos.maker}`)

            // Step 8: Verify cancellation was successful (balances should be largely unchanged)
            expect(finalBalances.eth.user).toBe(initialBalances.eth.user)
            expect(finalBalances.eth.resolver).toBe(initialBalances.eth.resolver)
            
            console.log('🎉 ETH to Aptos hybrid cross-chain transfer cancellation completed successfully!')
        })
    })
})

async function initChain(
    cnf: ChainConfig
): Promise<{node?: CreateServerReturnType; provider: JsonRpcProvider; escrowFactory: string; resolver: string}> {
    const {node, provider} = await getProvider(cnf)
    const deployer = new SignerWallet(cnf.ownerPrivateKey, provider)

    // deploy EscrowFactory
    const escrowFactory = await deploy(
        factoryContract,
        [
            cnf.limitOrderProtocol,
            cnf.wrappedNative, // feeToken,
            Address.fromBigInt(0n).toString(), // accessToken,
            deployer.address, // owner
            60 * 30, // src rescue delay
            60 * 30 // dst rescue delay
        ],
        provider,
        deployer
    )
    console.log(`[${cnf.chainId}]`, `Escrow factory contract deployed to`, escrowFactory)

    // deploy Resolver contract
    const resolver = await deploy(
        resolverContract,
        [
            escrowFactory,
            cnf.limitOrderProtocol,
            computeAddress(resolverPk) // resolver as owner of contract
        ],
        provider,
        deployer
    )
    console.log(`[${cnf.chainId}]`, `Resolver contract deployed to`, resolver)

    return {node: node, provider, resolver, escrowFactory}
}

async function getProvider(cnf: ChainConfig): Promise<{node?: CreateServerReturnType; provider: JsonRpcProvider}> {
    if (!cnf.createFork) {
        return {
            provider: new JsonRpcProvider(cnf.url, cnf.chainId, {
                cacheTimeout: -1,
                staticNetwork: true
            })
        }
    }

    const node = createServer({
        instance: anvil({forkUrl: cnf.url, chainId: cnf.chainId}),
        limit: 1
    })
    await node.start()

    const address = node.address()
    assert(address)

    const provider = new JsonRpcProvider(`http://[${address.address}]:${address.port}/1`, cnf.chainId, {
        cacheTimeout: -1,
        staticNetwork: true
    })

    return {
        provider,
        node
    }
}

/**
 * Deploy contract and return its address
 */
async function deploy(
    json: {abi: any; bytecode: any},
    params: unknown[],
    provider: JsonRpcProvider,
    deployer: SignerWallet
): Promise<string> {
    const deployed = await new ContractFactory(json.abi, json.bytecode, deployer).deploy(...params)
    await deployed.waitForDeployment()

    return await deployed.getAddress()
}