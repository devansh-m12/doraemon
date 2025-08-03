import {z} from 'zod'
import Sdk from '@1inch/cross-chain-sdk'
import * as process from 'node:process'

const bool = z
    .string()
    .transform((v) => v.toLowerCase() === 'true')
    .pipe(z.boolean())

const ConfigSchema = z.object({
    SRC_CHAIN_RPC: z.string().url(),
    DST_CHAIN_RPC: z.string().url(),
    SRC_CHAIN_CREATE_FORK: bool.default('true'),
    DST_CHAIN_CREATE_FORK: bool.default('true'),
    // ICP Configuration
    FUSION_SWAP_CANISTER_ID: z.string().default('bkyz2-fmaaa-aaaaa-qaaaq-cai'),
    ICRC1_CANISTER_ID: z.string().default('br5f7-7uaaa-aaaaa-qaaca-cai'),
    TEST_MAKER_PRINCIPAL: z.string().default('cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae'),
    TEST_TAKER_PRINCIPAL: z.string().default('fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe'),
    // Aptos Configuration
    APTOS_NODE_URL: z.string().url().default('https://fullnode.testnet.aptoslabs.com/v1'),
    APTOS_MODULE_ADDRESS: z.string().default('0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9'),
    APTOS_TEST_MAKER_ADDRESS: z.string().default('0x1'),
    APTOS_TEST_TAKER_ADDRESS: z.string().default('0x2'),
    APTOS_PRIVATE_KEY: z.string().optional(),
    APTOS_ACCOUNT_ADDRESS: z.string().optional()
})

const fromEnv = ConfigSchema.parse(process.env)

export const config = {
    chain: {
        source: {
            chainId: Sdk.NetworkEnum.ETHEREUM,
            url: fromEnv.SRC_CHAIN_RPC,
            createFork: fromEnv.SRC_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0x111111125421ca6dc452d289314280a0f8842a65',
            wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            ownerPrivateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            tokens: {
                USDC: {
                    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    donor: '0xd54F23BE482D9A58676590fCa79c8E43087f92fB'
                }
            }
        },
        destination: {
            chainId: 56 as const, // Using BSC chainId for SDK compatibility
            url: fromEnv.DST_CHAIN_RPC,
            createFork: fromEnv.DST_CHAIN_CREATE_FORK,
            limitOrderProtocol: '0x111111125421ca6dc452d289314280a0f8842a65',
            wrappedNative: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            ownerPrivateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            tokens: {
                USDC: {
                    address: '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2',
                    donor: '0x4188663a85C92EEa35b5AD3AA5cA7CeB237C6fe9'
                }
            }
        }
    },
    icp: {
        fusionSwapCanisterId: fromEnv.FUSION_SWAP_CANISTER_ID,
        icrc1CanisterId: fromEnv.ICRC1_CANISTER_ID,
        testMakerPrincipal: fromEnv.TEST_MAKER_PRINCIPAL,
        testTakerPrincipal: fromEnv.TEST_TAKER_PRINCIPAL
    },
    aptos: {
        nodeUrl: fromEnv.APTOS_NODE_URL,
        moduleAddress: fromEnv.APTOS_MODULE_ADDRESS,
        testMakerAddress: fromEnv.APTOS_TEST_MAKER_ADDRESS,
        testTakerAddress: fromEnv.APTOS_TEST_TAKER_ADDRESS,
        privateKey: fromEnv.APTOS_PRIVATE_KEY,
        accountAddress: fromEnv.APTOS_ACCOUNT_ADDRESS
    }
} as const

export type ChainConfig = (typeof config.chain)['source' | 'destination']
