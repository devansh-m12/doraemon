<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 1inch Cross-Chain Swap Extension: Ethereum ↔ ICP Implementation Plan

A comprehensive development plan for building a novel extension that enables bidirectional cross-chain swaps between Ethereum and Internet Computer Protocol (ICP) using 1inch Fusion+ architecture with preserved hashlock and timelock functionality.

## Project Overview

This project addresses the critical need for **seamless, trustless cross-chain swaps** between Ethereum (EVM) and Internet Computer Protocol (non-EVM) blockchains[^1][^2]. By extending 1inch's proven Fusion+ architecture[^1][^3], we'll create a novel bridging solution that maintains atomic swap guarantees while leveraging ICP's unique **Chain Fusion capabilities**[^4][^5] for enhanced security and functionality.

**Key Innovation**: Unlike traditional bridges that rely on wrapped tokens or trusted intermediaries, this solution implements **true cross-chain atomic swaps** using Hash Time-Locked Contracts (HTLCs) on Ethereum and equivalent logic in ICP canisters[^6][^7].

## Technical Architecture

### Core Components

#### 1. Ethereum Smart Contracts

- **HTLC Implementation**: Based on proven patterns from existing implementations[^8][^9]
- **1inch Fusion+ Integration**: Extends current Fusion SDK architecture[^10][^11]
- **Timelock and Hashlock Logic**: Implements atomic swap guarantees[^12][^13]


#### 2. ICP Canister Smart Contracts

- **Threshold ECDSA Integration**: Lever-key cryptography[^5][^14]
- **HTLC-Equivalent Logic**: Non-EVM implementation preserving atomic properties[^15][^7]
- **Chain Fusion Capabilities**: Direct Ethereum integration via EVM RPC[^14][^16]


#### 3. Cross-Chain Bridge Protocol

- **Bidirectional Communication**: Ethereum ↔ ICP message passing[^4][^5]
- **Atomic Swap Coordination**: Ensures all-or-nothing execution[^17][^12]
- **Security Mechanisms**: Multi-signature validation and consensus[^18][^19]


### System Flow Architecture

```
[Ethereum User] → [HTLC Contract] → [Bridge Protocol] → [ICP Canister] → [ICP User]
                        ↓                    ↓                   ↓
                   [Hashlock]         [Cross-Chain           [Timelock
                   [Timelock]          Validation]            Logic]
```


## Implementation Roadmap

### Phase 1: Foundation Setup (Weeks 1-2)

#### Development Environment

**Prerequisites**:

- Node.js 18+ and npm/yarn[^20]
- IC SDK (DFX) installation[^21][^20]
- Ethereum development tools (Hardhat/Foundry)
- Git and version control

**Initial Setup**:

```bash
# Install IC SDK
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
dfx --version

# Install 1inch Fusion SDK
npm install @1inch/fusion-sdk@2
yarn add @1inch/fusion-sdk@2

# Project structure
mkdir eth-icp-bridge
cd eth-icp-bridge
dfx new icp_canisters --type=rust
mkdir ethereum-contracts
```


#### Core Dependencies

- **1inch Fusion SDK**: For order management and resolver integration[^10][^22]
- **ICP Chain Fusion**: EVM RPC canister integration[^14][^16]
- **Ethereum Libraries**: Ethers.js, Hardhat, OpenZeppelin[^9][^23]
- **ICP CDKs**: Rust or Motoko for canister development[^24][^25]


### Phase 2: Smart Contract Development (Weeks 3-6)

#### Ethereum HTLC Implementation

**Core Contract Features**[^8][^9]:

```solidity
contract EthereumICPBridge {
    struct SwapOrder {
        address sender;
        bytes32 icpRecipient;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool completed;
    }
    
    function createSwap(
        bytes32 icpRecipient,
        bytes32 hashlock,
        uint256 timelock
    ) external payable;
    
    function claimSwap(
        bytes32 orderId,
        bytes32 preimage
    ) external;
    
    function refund(bytes32 orderId) external;
}
```


#### ICP Canister Implementation

**Rust-based Canister**[^25][^14]:

```rust
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk_macros::*;

#[derive(CandidType, Deserialize)]
struct SwapOrder {
    ethereum_sender: String,
    icp_recipient: Principal,
    amount: u64,
    hashlock: Vec<u8>,
    timelock: u64,
    completed: bool,
}

#[update]
async fn create_icp_swap(
    ethereum_sender: String,
    amount: u64,
    hashlock: Vec<u8>,
    timelock: u64,
) -> Result<String, String> {
    // Implementation with Chain Fusion integration
}
```


### Phase 3: Cross-Chain Communication (Weeks 7-10)

#### Bridge Protocol Development

**Key Components**[^26][^27]:

- **Message Verification**: Cross-chain transaction validation
- **Event Listening**: Ethereum block monitoring from ICP
- **State Synchronization**: Atomic swap coordination


#### Chain Fusion Integration

**ICP's Native Ethereum Integration**[^5][^14]:

```rust
// EVM RPC integration for Ethereum interaction
use ic_cdk::api::management_canister::ecdsa::{
    sign_with_ecdsa, EcdsaKeyId, EcdsaPublicKeyArgument, SignWithEcdsaArgument,
};

#[update]
async fn submit_ethereum_transaction(
    transaction_data: Vec<u8>
) -> Result<String, String> {
    // Use threshold ECDSA to sign Ethereum transactions
    let signature = sign_with_ecdsa(SignWithEcdsaArgument {
        message_hash: transaction_hash,
        derivation_path: vec![],
        key_id: EcdsaKeyId {
            curve: EcdsaCurve::Secp256k1,
            name: "key_1".to_string(),
        },
    }).await?;
    
    // Submit to Ethereum via EVM RPC
}
```


### Phase 4: 1inch Fusion+ Integration (Weeks 11-14)

#### SDK Integration

**Fusion SDK Implementation**[^10][^11]:

```typescript
import { FusionSDK, NetworkEnum } from '@1inch/fusion-sdk';

class EthereumICPExtension {
    private fusionSDK: FusionSDK;
    
    constructor() {
        this.fusionSDK = new FusionSDK({
            url: 'https://api.1inch.dev/fusion',
            network: NetworkEnum.ETHEREUM,
            authKey: process.env.DEV_PORTAL_API_TOKEN
        });
    }
    
    async createCrossChainOrder(params: CrossChainOrderParams) {
        // Integrate with existing Fusion+ infrastructure
        const order = await this.fusionSDK.createOrder({
            fromTokenAddress: params.ethToken,
            toTokenAddress: 'ICP_BRIDGE_MARKER',
            amount: params.amount,
            walletAddress: params.sender
        });
        
        // Trigger ICP canister interaction
        return this.initiateCrossChainSwap(order);
    }
}
```


#### Resolver Integration

**Custom Resolver Logic**[^28][^29]:

- **Cross-Chain Order Fulfillment**: Atomic execution across chains
- **Economic Incentives**: Fee structure for cross-chain operations
- **MEV Protection**: Maintain Fusion+ security guarantees


### Phase 5: Testing \& Security (Weeks 15-18)

#### Security Implementation

**Critical Security Measures**[^18][^19]:

1. **Smart Contract Audits**: Comprehensive code review
2. **HTLC Validation**: Atomic swap guarantee testing
3. **Bridge Security**: Multi-sig and consensus mechanisms
4. **Economic Attack Resistance**: Griefing prevention[^30][^31]

#### Test Network Deployment

**Testnet Strategy**:

- **Ethereum Sepolia**: Testnet deployment and validation
- **ICP Local Replica**: Local development and testing
- **Integration Testing**: End-to-end swap simulation


### Phase 6: UI/UX Development (Weeks 19-22)

#### User Interface Components

**Frontend Architecture**:

```typescript
// React-based UI with Web3 integration
interface SwapInterface {
    sourceChain: 'ethereum' | 'icp';
    targetChain: 'ethereum' | 'icp';
    sourceToken: string;
    targetToken: string;
    amount: string;
}

const CrossChainSwapComponent = () => {
    const [swapParams, setSwapParams] = useState<SwapInterface>();
    
    const executeSwap = async () => {
        // Integrate with bridge protocol
        const result = await bridge.initiateSwap(swapParams);
        return result;
    };
}
```


#### Integration Points

- **MetaMask**: Ethereum wallet connectivity
- **Internet Identity**: ICP authentication system[^32]
- **1inch Interface**: Existing UI component integration


## Technical Requirements

### Core Technologies

#### Ethereum Stack

- **Solidity**: Smart contract development
- **Hardhat/Foundry**: Development framework
- **Ethers.js**: Web3 library integration
- **OpenZeppelin**: Security-tested contract libraries[^9]


#### ICP Stack

- **Rust CDK**: Primary canister development language[^25]
- **DFX**: IC SDK for deployment and management[^21]
- **Chain Fusion**: Native Ethereum integration[^5]
- **Threshold ECDSA**: Cross-chain transaction signing[^14]


#### Integration Libraries

- **1inch Fusion SDK**: Core swap functionality[^10][^11]
- **Web3 Connectors**: Multi-wallet support
- **Cross-Chain Messaging**: Bridge communication protocols


### Infrastructure Requirements

#### Development Tools

- **Version Control**: Git with branching strategy
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Cross-chain transaction tracking
- **Documentation**: Comprehensive API documentation


#### Security Tools

- **Static Analysis**: Solidity and Rust code scanning
- **Fuzzing**: Contract vulnerability testing
- **Audit Tools**: Professional security review platforms


## Security Considerations

### Bridge Security Framework

#### Multi-Layer Protection[^18][^33]

1. **Smart Contract Security**: Audited HTLC implementations
2. **Cryptographic Validation**: Hash and signature verification
3. **Economic Security**: Anti-griefing mechanisms[^30][^31]
4. **Operational Security**: Multi-sig governance and upgrades

#### Attack Vector Mitigation

**Common Vulnerabilities Addressed**[^34][^35]:

- **Double Spending**: Atomic swap prevention
- **Oracle Manipulation**: Decentralized price feeds
- **Smart Contract Bugs**: Comprehensive testing and audits
- **Bridge Exploits**: Multi-signature validation


### Best Practices Implementation

**Security Standards**[^19]:

- **Principle of Least Privilege**: Minimal access rights
- **Defense in Depth**: Multiple security layers
- **Fail-Safe Defaults**: Secure failure modes
- **Regular Security Reviews**: Continuous monitoring


## Economic Model

### Fee Structure

**Cross-Chain Operations**:

- **Bridge Fee**: 0.1% of swap amount
- **Resolver Rewards**: Dynamic based on complexity
- **Gas Optimization**: Efficient transaction batching


### Incentive Alignment

**Stakeholder Benefits**:

- **Users**: Lower fees than traditional bridges
- **Resolvers**: New revenue opportunities
- **1inch Ecosystem**: Expanded market reach


## Testing Strategy

### Multi-Phase Testing Approach

#### Unit Testing

- **Smart Contract Testing**: Comprehensive coverage
- **Canister Testing**: ICP-specific functionality
- **Integration Testing**: Cross-chain communication


#### Integration Testing

- **End-to-End Flows**: Complete swap simulation
- **Error Handling**: Failure scenario testing
- **Performance Testing**: High-volume stress testing


#### Security Testing

- **Penetration Testing**: Ethical hacking attempts
- **Economic Attack Simulation**: Game theory validation
- **Formal Verification**: Mathematical proof of correctness


## Deployment Strategy

### Testnet Deployment

**Phase 1**: Internal testing environment
**Phase 2**: Public testnet availability
**Phase 3**: Community testing and feedback

### Mainnet Strategy

**Requirements for Production**:

- [ ] Comprehensive security audits completed
- [ ] Economic model validated
- [ ] Community testing successful
- [ ] Regulatory compliance reviewed


## Documentation \& Resources

### Essential Documentation

1. **API Documentation**: Complete endpoint reference
2. **Developer Guides**: Integration tutorials
3. **Security Audits**: Public audit reports
4. **Economic Analysis**: Tokenomics documentation

### Key Resources

#### 1inch Resources

- **Fusion+ Whitepaper**: [1inch Fusion+ Technical Documentation](https://1inch.io/assets/1inch-fusion-plus.pdf)[^1]
- **Fusion SDK**: [GitHub Repository](https://github.com/1inch/fusion-sdk)[^10]
- **Developer Portal**: [1inch API Documentation](https://portal.1inch.dev/)[^36]


#### ICP Resources

- **Developer Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs)[^37]
- **Chain Fusion Guide**: [Cross-Chain Integration](https://internetcomputer.org/docs/building-apps/chain-fusion/overview)[^4]
- **Canister Development**: [IC SDK Tutorial](https://internetcomputer.org/docs/tutorials/developer-liftoff/)[^21]


#### Cross-Chain Development

- **Atomic Swaps Research**: [Academic Papers](https://arxiv.org/abs/1801.09515)[^38]
- **Bridge Security**: [Security Best Practices](https://webisoft.com/articles/blockchain-bridge-security/)[^39]
- **HTLC Implementations**: [GitHub Examples](https://github.com/chatch/hashed-timelock-contract-ethereum)[^9]


### Community \& Support

- **1inch Discord**: Developer community support
- **ICP Developer Forum**: [Technical discussions](https://forum.dfinity.org/)
- **DFINITY Developer Relations**: Direct engineering support[^40]


## Success Metrics

### Technical Metrics

- **Swap Success Rate**: >99.9% completion rate
- **Average Swap Time**: <5 minutes end-to-end
- **Gas Efficiency**: <50% of traditional bridge costs
- **Uptime**: >99.95% availability


### Business Metrics

- **Total Value Locked**: Target \$10M+ in first 6 months
- **Daily Active Users**: 1000+ unique swappers
- **Integration Adoption**: 5+ DeFi protocols using the bridge
- **Community Growth**: 10,000+ Discord/forum members


## Risk Assessment \& Mitigation

### Technical Risks

**Risk**: Smart contract vulnerabilities
**Mitigation**: Multiple security audits and formal verification

**Risk**: Cross-chain communication failures
**Mitigation**: Robust retry mechanisms and fallback procedures

### Economic Risks

**Risk**: Low liquidity affecting swap rates
**Mitigation**: Incentive programs for early liquidity providers

**Risk**: Competitive pressure from existing solutions
**Mitigation**: Focus on unique ICP integration advantages

### Regulatory Risks

**Risk**: Changing regulatory landscape
**Mitigation**: Compliance-first development approach

## Conclusion

This comprehensive plan provides a **complete roadmap** for developing a novel 1inch Fusion+ extension enabling Ethereum ↔ ICP cross-chain swaps. By leveraging ICP's unique Chain Fusion capabilities[^5] and 1inch's proven atomic swap architecture[^1][^3], this project addresses a significant gap in cross-chain DeFi infrastructure.

The implementation preserves critical **hashlock and timelock functionality**[^6][^7] while enabling bidirectional swaps between EVM and non-EVM ecosystems. With proper execution, this extension will provide users with **secure, efficient, and cost-effective** cross-chain trading capabilities while maintaining the decentralized ethos of both platforms.

**Next Steps**: Begin with Phase 1 foundation setup and proceed through the structured development timeline. Success depends on thorough security implementation, comprehensive testing, and strong community engagement throughout the development process.

*This plan serves as a comprehensive guide for cursor-based development, providing all necessary links, technical specifications, and implementation details required for successful project completion.*

<div style="text-align: center">⁂</div>

[^1]: https://1inch.io/assets/1inch-fusion-plus.pdf

[^2]: https://1inch.io/fusion/

[^3]: https://help.1inch.io/en/articles/9842591-what-is-1inch-fusion-and-how-does-it-work

[^4]: https://internetcomputer.org/docs/building-apps/chain-fusion/overview

[^5]: https://internetcomputer.org/multichain

[^6]: https://www.investopedia.com/terms/h/hashed-timelock-contract.asp

[^7]: https://www.publish0x.com/blockchain-basics/hashed-timelock-contracts-htlcs-and-how-they-work-xxvnpdm

[^8]: https://github.com/jxu86/hashed-time-lock-contract

[^9]: https://github.com/chatch/hashed-timelock-contract-ethereum

[^10]: https://github.com/1inch/fusion-sdk

[^11]: https://www.npmjs.com/package/@1inch/fusion-sdk

[^12]: https://tokenminds.co/blog/knowledge-base/atomic-swaps

[^13]: https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc

[^14]: https://internetcomputer.org/docs/building-apps/chain-fusion/ethereum/using-eth/eth-dev-workflow

[^15]: https://alexandercodes.hashnode.dev/building-a-hashed-timelock-contract-on-algorand

[^16]: https://www.youtube.com/watch?v=enwbU2tOSxI

[^17]: https://bcoin.io/guides/swaps.html

[^18]: https://cryptoslate.com/how-can-we-make-defi-bridges-safer-minimize-the-trust/

[^19]: https://cointelegraph.com/innovation-circle/10-crypto-leaders-on-ways-devs-can-increase-the-security-of-bridge-protocols

[^20]: https://internetcomputer.org/docs/building-apps/getting-started/install

[^21]: https://internetcomputer.org/docs/tutorials/developer-liftoff/level-1/1.3-intro-dfx

[^22]: https://docs.1inch.io/docs/fusion-swap/fusion-sdk/for-integrators/sdk-overview/

[^23]: https://chainstack.com/how-to-create-blockchain-bridge/

[^24]: https://hwvjt-wqaaa-aaaam-qadra-cai.ic0.app/docs/current/developer-docs/backend/choosing-language

[^25]: https://internetcomputer.org/docs/building-apps/developer-tools/cdks/rust/intro-to-rust

[^26]: https://chain.link/education-hub/cross-chain-bridge

[^27]: https://developers.flow.com/tutorials/cross-vm-apps/vm-bridge

[^28]: https://help.1inch.io/en/articles/6796085-what-is-1inch-fusion-and-how-does-it-work

[^29]: https://beincrypto.com/learn/1inch-swap-guide/

[^30]: https://sites.ualberta.ca/~mkhabbaz/assets/pdf/AtomicSwaps.pdf

[^31]: https://decentralizedthoughts.github.io/2022-08-12-hehtlc/

[^32]: https://wiki.internetcomputer.org/wiki/Internet_Computer_vision

[^33]: https://hexn.io/blog/vulnerabilities-in-bridge-security-310

[^34]: https://kanga.exchange/university/en/courses/advanced-course/lessons/79-typical-vulnerabilities-and-bridge-security-in-blockchain-technology/

[^35]: https://www.lbank.com/academy/article/arsadz1721033362-what-are-common-bridge-security-vulnerabilities

[^36]: https://portal.1inch.dev/documentation/apis/swap/fusion-plus/introduction

[^37]: https://internetcomputer.org/what-is-the-ic

[^38]: https://arxiv.org/pdf/1801.09515.pdf

[^39]: https://webisoft.com/articles/blockchain-bridge-security/

[^40]: https://dfinity.org/hackathons

[^41]: https://gitingest.com/1inch/solana-fusion-protocol

[^42]: https://github.com/1inch/solana-fusion-sdk

[^43]: https://gitingest.com/1inch/fusion-resolver-example

[^44]: https://transak.com/blog/what-are-cross-chain-swaps

[^45]: https://github.com/HajdiBengu/Hashlock

[^46]: https://blog.1inch.io/a-deep-dive-into-1inch-fusion/

[^47]: https://arxiv.org/pdf/1902.04471.pdf

[^48]: https://coinbureau.com/education/what-are-cross-chain-atomic-swaps/

[^49]: https://arxiv.org/abs/1905.09985

[^50]: https://internetcomputer.org/docs/references/system-canisters/management-canister

[^51]: https://internetcomputer.org/docs/building-apps/essentials/network-overview

[^52]: https://github.com/PrimLabs/iCAN

[^53]: https://www.altcoinbuzz.io/cryptocurrency-news/solana-joins-icp-for-cross-chain-smart-contracts/

[^54]: https://internetcomputer.org/docs/building-apps/essentials/canisters

[^55]: https://internetcomputer.org/docs/building-apps/developing-canisters/what-are-canisters

[^56]: https://internetcomputer.org

[^57]: https://internetcomputer.org/docs/building-apps/developer-tools/cdks/

[^58]: https://dashboard.internetcomputer.org/chain-fusion

[^59]: https://www.bitstamp.net/learn/earn/icp-internet-computer-protocol-future-of-decentralized-applications/

[^60]: https://www.youtube.com/watch?v=RCib3N1Y7gw

[^61]: https://raritysniper.com/news/dfinity-enhances-cross-chain-interoperability-for-icp/

[^62]: https://lu.ma/ssqz9bkf

[^63]: https://lu.ma/brmiz4gk

[^64]: https://www.thebigwhale.io/tokens/internet-computer

[^65]: https://www.youtube.com/watch?v=qYHHHJNG3N8

[^66]: https://dorahacks.io/hackathon/wchl25-qualification-round/detail

[^67]: https://forum.dfinity.org/t/introduction-to-scaffold-icp/50495

[^68]: https://www.hackerearth.com/challenges/hackathon/ais-hackaithon/custom-tab/announcement/

[^69]: https://support.dfinity.org/hc/en-us/articles/360057132652-What-is-Motoko

[^70]: https://www.youtube.com/watch?v=J5rhdzjuq6k

[^71]: https://www.reddit.com/r/dfinity/comments/ovqp3g/rust_or_motoko/

[^72]: https://dfinity.org

[^73]: https://www.youtube.com/watch?v=fDMHUdo7m-k

[^74]: https://internetcomputer.org/docs/tutorials/developer-liftoff/level-0/intro-languages

[^75]: https://bvrit.ac.in/latest-news/dept-of-ai-ds-a-24-hour-national-level-hackathon-hackfiniti-2025-ideas-to-limitless-solutions-on-april-3rd-4th-2025/

[^76]: https://brson.github.io/2022/06/26/more-icp-programming

[^77]: https://dfinityhacks.devpost.com

[^78]: https://internetcomputer.org/docs/motoko/home

[^79]: https://reskilll.com/allhacks

[^80]: https://github.com/dfinity/sdk

[^81]: https://arxiv.org/html/2504.15449v1

[^82]: https://www.cointribune.com/en/crypto-icp-announces-a-major-breakthrough-with-the-imminent-integration-of-ethereum/

[^83]: https://coingeek.com/cross-chain-atomic-swaps-without-hash-time-locked-contracts/

[^84]: https://allbridge.io/classic/

[^85]: https://www.youtube.com/watch?v=A0eC2tA951g

[^86]: https://stackoverflow.com/questions/75290736/performing-an-atomic-swap-in-solidity-with-a-disposable-smart-contract

[^87]: https://internetcomputer.org/ethereum-integration

[^88]: https://aptosfoundation.org/ecosystem/projects/bridges

[^89]: https://iris.cnr.it/retrieve/90ee3668-daa2-4366-bf5a-566f5be34af1/prod_437661-doc_156828.pdf

[^90]: https://hackmd.io/@rh7/BJzhPan63

[^91]: https://chain.link/education-hub/atomic-swaps

[^92]: https://ethereum-magicians.org/t/erc-6170-cross-chain-messaging-interface/12197

[^93]: https://www.coindesk.com/tech/2021/12/24/dfinitys-internet-computer-opens-ethereum-bridge

[^94]: https://github.com/catalogfi/swapper

[^95]: https://www.youtube.com/watch?v=6fYRFwPL0rc

[^96]: https://forum.moralis.io/t/integrating-1inch-fusion-sdk-with-dex/24480

[^97]: https://www.youtube.com/watch?v=AvXLRHyT2GQ

[^98]: https://github.com/Wajahat-Husain/1inch-fusion-swap-sdk

[^99]: https://www.okx.com/web3/build/docs/waas/dex-use-crosschain-quick-start

[^100]: https://iris.unito.it/retrieve/78e46915-625f-491b-8809-f0e4302bb1ae/MP-HTLC.pdf

[^101]: https://www.youtube.com/watch?v=qFaCvxrcqmo

[^102]: https://iris.unito.it/bitstream/2318/1891671/1/MP-HTLC.pdf

[^103]: https://www.youtube.com/watch?v=aBdjENTdiZ4

[^104]: https://arxiv.org/pdf/2006.12031.pdf

[^105]: https://stouy.com/phantom-wallet-cross-chain-swaps-tutorial/

[^106]: https://github.com/1inch-community/interface/blob/dev/libs/sdk/README.md

[^107]: https://docs.kaleido.io/kaleido-services/token-swaps/htlc/

[^108]: https://www.avax.network/about/blog/how-to-build-cross-chain-applications

[^109]: https://github.com/bgoonz/Markdown-Templates/blob/master/official/README_TEMPLATES/Hackathon.md

[^110]: https://www.nadcab.com/blog/cross-chain-compatibility-web3

[^111]: https://hackmd.io/@yoZKyo/web3hacktempl

[^112]: https://www.rapidinnovation.io/post/how-to-create-a-cross-chain-defi-platform

[^113]: https://www.scribd.com/document/876214761/Hackathon-Submission-Template-Level-1-Solution

[^114]: https://www.solulab.com/cross-chain-bridge-platform-solutions/

[^115]: https://www.slideshare.net/slideshow/hackathon-pitch-deck-template/255823128

[^116]: https://editorialge.com/how-to-build-cross-chain-web3-applications/

[^117]: https://www.cryptopolitan.com/crypto-bridges-prone-to-hacks-solutions/

[^118]: https://www.scribd.com/document/866822447/Student-Hackathon-Concept-Note-Template

[^119]: https://www.linkedin.com/pulse/bridging-gap-cross-chain-development-umnfc

[^120]: https://github.com/mcitosa/hackathon-resources/blob/master/hackathon_README_template.md

[^121]: https://www.youtube.com/watch?v=s-KqB6pumLU

