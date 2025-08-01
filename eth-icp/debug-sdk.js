import Sdk from '@1inch/cross-chain-sdk'

console.log('SDK object:', Object.keys(Sdk))
console.log('CrossChainOrder:', Sdk.CrossChainOrder)
console.log('Available methods on CrossChainOrder:', Sdk.CrossChainOrder ? Object.getOwnPropertyNames(Sdk.CrossChainOrder) : 'undefined') 