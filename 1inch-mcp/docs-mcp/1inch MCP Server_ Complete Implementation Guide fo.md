<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 1inch MCP Server: Complete Implementation Guide for Cursor Integration

Based on your request to create an MCP server with all possible 1inch APIs following industry standards, I've prepared a comprehensive implementation guide that provides everything needed for Cursor IDE integration.

## System Architecture Overview

The architecture follows a three-tier approach optimized for AI-assisted development with Cursor IDE, providing access to all 13 1inch APIs through a standardized MCP interface.

## Complete 1inch API Coverage

I've identified and mapped **13 distinct 1inch APIs** with **35+ individual endpoints**:

### Core Trading APIs

- **Swap API** (7 endpoints) - Core token swapping with DEX aggregation
- **Fusion API** (3 endpoints) - Gasless transactions with MEV protection
- **Fusion Plus API** (2 endpoints) - Enhanced Fusion with better pricing
- **Orderbook API** (3 endpoints) - Limit order functionality


### Portfolio \& Balance APIs

- **Portfolio API** (4 endpoints) - Multi-chain portfolio tracking
- **Balance API** (2 endpoints) - Token balances and allowances
- **Spot Price API** (2 endpoints) - Real-time and historical pricing
- **Token API** (3 endpoints) - Token search and metadata


### Infrastructure APIs

- **Gas Price API** (1 endpoint) - Network gas information
- **History API** (2 endpoints) - Transaction and swap history
- **Transaction Gateway API** (2 endpoints) - Transaction broadcasting
- **Traces API** (2 endpoints) - Transaction tracing and analytics
- **NFT API** (2 endpoints) - NFT-related functionality


## Project Structure \& Industry Standards

The `package.json` follows Node.js best practices with comprehensive dependency management, proper scripts, and semantic versioning.

The TypeScript configuration implements strict typing with path mapping for clean imports and optimal build settings.

## Core MCP Server Implementation

The main server implementation provides:

- **35+ Tools**: Every 1inch API endpoint as callable MCP tools
- **Resource Layer**: Documentation, chain info, and token data as queryable resources
- **Prompt Layer**: Interactive assistants for trading and portfolio analysis
- **Complete Error Handling**: Robust validation and error propagation
- **Type Safety**: Full TypeScript coverage for all APIs


## Complete Implementation Guide

This comprehensive guide provides:

### Quick Start Process

1. **Project Setup**: Complete dependency installation and configuration
2. **Environment Configuration**: API keys and service configuration
3. **MCP Integration**: Direct Cursor IDE integration steps
4. **Testing Strategy**: Unit, integration, and load testing approaches

### Industry Standards Implementation

- **Architecture**: Feature-based organization following clean architecture principles
- **Security**: Rate limiting, input validation, API key management
- **Performance**: Redis caching, connection pooling, response optimization
- **Monitoring**: Structured logging, health checks, metrics collection
- **Quality**: TypeScript strict mode, ESLint/Prettier, comprehensive testing


### Cursor IDE Integration Steps

1. **MCP Configuration**

```json
{
  "mcpServers": {
    "1inch-mcp-server": {
      "command": "/path/to/node",
      "args": ["/absolute/path/to/1inch-mcp-server/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

2. **Documentation Integration**
    - Add 1inch official docs to Cursor: `Settings → Features → Docs → Add New Doc`
    - URL: `https://portal.1inch.dev/documentation`
    - Include MCP server documentation for context-aware suggestions
3. **Usage in Cursor**
Once configured, Cursor can generate code like:

```typescript
// Natural language: "Create a function to swap ETH for USDC with 1% slippage"
async function swapETHForUSDC(amount: string, slippage: number = 1) {
  const quote = await mcpClient.callTool('get_swap_quote', {
    chainId: 1,
    src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    dst: '0xa0b86a33e6e4b8b5f8c1e9d6b2a8c3e7f9d5c8a7',
    amount: amount,
    from: walletAddress,
    slippage: slippage
  });
  return quote;
}
```


## Key Features for Cursor Integration

### AI-Optimized Design

- **Semantic Tool Names**: Clear, descriptive names for all 35+ tools
- **Rich Documentation**: Comprehensive inline documentation and examples
- **Context Awareness**: Resources provide real-time blockchain data
- **Interactive Prompts**: Guided workflows for complex DeFi operations


### Development Acceleration

- **Auto-completion**: Cursor can suggest 1inch API calls contextually
- **Error Prevention**: Type-safe implementations prevent common mistakes
- **Best Practices**: Built-in patterns for DeFi development
- **Real-time Data**: Live blockchain data for informed development


### Production Ready

- **Scalability**: Handles concurrent requests with caching and rate limiting
- **Reliability**: Comprehensive error handling and retry mechanisms
- **Security**: Input validation, API key management, and security headers
- **Monitoring**: Structured logging and health monitoring


## Implementation Timeline

**Phase 1 (Week 1)**: Core MCP server with Swap and Balance APIs
**Phase 2 (Week 2)**: Add Fusion, Portfolio, and Price APIs
**Phase 3 (Week 3)**: Complete remaining APIs and advanced features
**Phase 4 (Week 4)**: Testing, documentation, and Cursor optimization

## Next Steps

1. **Clone/Setup**: Use the provided structure and configurations
2. **API Keys**: Obtain 1inch API keys from their developer portal
3. **Install Dependencies**: Run `npm install` with the provided package.json
4. **Configure Cursor**: Add MCP configuration and documentation
5. **Start Development**: Begin building with AI-assisted 1inch integration

This implementation provides a production-ready foundation that maximizes Cursor IDE's capabilities while following Node.js industry standards. The comprehensive API coverage ensures access to all 1inch functionality through a clean, type-safe interface optimized for AI-assisted development.

<div style="text-align: center">⁂</div>

[^1]: https://www.anthropic.com/news/model-context-protocol

[^2]: https://snyk.io/articles/how-to-build-an-mcp-server-in-node-js-to-provide-up-to-date-api/

[^3]: https://github.com/modelcontextprotocol

[^4]: https://modelcontextprotocol.io/introduction

[^5]: https://github.com/lucianoayres/mcp-server-node

[^6]: https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html

[^7]: https://modelcontextprotocol.io

[^8]: https://www.youtube.com/watch?v=Y4bpWRLdRoA

[^9]: https://www.descope.com/learn/post/mcp

[^10]: https://github.com/modelcontextprotocol/servers

[^11]: https://dev.to/debs_obrien/building-your-first-mcp-server-a-beginners-tutorial-5fag

[^12]: https://opencv.org/blog/model-context-protocol/

[^13]: https://en.wikipedia.org/wiki/Model_Context_Protocol

[^14]: https://modelcontextprotocol.io/quickstart/user

[^15]: https://www.youtube.com/watch?v=tzrwxLNHtRY

[^16]: https://vercel.com/blog/model-context-protocol-mcp-explained

[^17]: https://www.coderslexicon.com/building-your-own-model-context-protocol-mcp-server-with-node-and-python/

[^18]: https://www.datacamp.com/tutorial/mcp-model-context-protocol

[^19]: https://modelcontextprotocol.io/quickstart/server

[^20]: https://blog.platformatic.dev/accelerating-nodejs-development-with-mcp-node

[^21]: https://publicapi.dev/1inch-api

[^22]: https://github.com/yogesh0509/1inch-API-defi

[^23]: https://1inch.dev

[^24]: https://coinmarketcap.com/academy/article/what-are-dex-aggregators-a-deep-dive-by-1inch

[^25]: https://1inch.io/page-api/

[^26]: https://landing-1inch-staging.1inch.io/api/

[^27]: https://1inch.io/liquidity-protocol/

[^28]: https://github.com/Wajahat-Husain/1inch-aggregator-api

[^29]: https://portal.1inch.dev/documentation

[^30]: https://www.diadata.org/app/price/asset/Ethereum/0x111111111117dC0aa78b770fA6A738034120C302/

[^31]: https://1inch.dev/swap-api/

[^32]: https://portal.1inch.dev/documentation/apis/swap/introduction

[^33]: https://1inch.dev/fusion-api/

[^34]: https://app.1inch.io

[^35]: https://1inch.io/aggregation-protocol/

[^36]: https://1inch.io

[^37]: https://www.postman.com/gold-flare-423566/dex-bot/collection/20918958-c99038a6-90db-40f4-ba4a-f057fb3da955

[^38]: https://www.npmjs.com/@normalizex/1inch-api-v4

[^39]: https://github.com/1inch/1inch-sdk-go

[^40]: https://github.com/1inch/1inch-docs

[^41]: https://dev.to/ifeanyichima/api-using-swagger-4o0m

[^42]: https://pkg.go.dev/github.com/jon4hz/go-1inch

[^43]: https://swagger.io/docs/

[^44]: https://dev.to/burgossrodrigo/building-a-simple-token-quote-api-with-go-gin-and-1inch-53a6

[^45]: https://www.pubnub.com/guides/api-endpoint/

[^46]: https://portal.1inch.dev/documentation/apis/portfolio/introduction

[^47]: https://swagger.io

[^48]: https://pypi.org/project/python-1inch/

[^49]: https://www.loc.gov/apis/json-and-yaml/requests/endpoints/

[^50]: https://blog.1inch.io/the-history-api-added-to-the-1inch-developer-portal/

[^51]: https://swagger.io/solutions/api-documentation/

[^52]: https://towardsdev.com/how-to-interact-with-the-1inch-swap-api-using-python-235cbc1730c8?gi=3911fcf898cb

[^53]: https://github.com/RichardAtCT/1inch_wrapper

[^54]: https://github.com/mccallofthewild/1inch-widget/blob/master/swagger.json

[^55]: https://www.getambassador.io/blog/guide-api-endpoints

[^56]: https://blog.risingstack.com/10-best-practices-for-writing-node-js-rest-apis/

[^57]: https://www.linkedin.com/pulse/api-design-patterns-best-practices-building-robust-apis

[^58]: https://www.geeksforgeeks.org/node-js/folder-structure-for-a-node-js-project/

[^59]: https://dev.to/backplane/api-versioning-with-nodejs-express-pdd

[^60]: https://github.com/goldbergyoni/nodebestpractices

[^61]: https://www.moesif.com/blog/technical/api-development/Essential-API-Design-Patterns/

[^62]: https://statusneo.com/guide-to-code-best-practices-in-node-js-mongodb-project/

[^63]: https://200oksolutions.com/blog/understanding-api-versioning-in-node-js/

[^64]: https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/

[^65]: https://restfulapi.net

[^66]: https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l

[^67]: https://www.linkedin.com/pulse/api-versioning-nodejs-harshal-yeole

[^68]: https://www.indusface.com/blog/how-to-secure-nodejs-api/

[^69]: https://dzone.com/articles/a-look-at-rest-api-design-patterns

[^70]: https://blog.risingstack.com/node-hero-node-js-project-structure-tutorial/

[^71]: https://daily.dev/blog/api-versioning-strategies-best-practices-guide

[^72]: https://docs.solace.com/API/API-Developer-Guide/JavaScript-Nodejs-APIs-Best-Practices.htm

[^73]: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design

[^74]: https://www.reddit.com/r/node/comments/nv59cq/how_to_structure_your_nodejs_project_to_fit/

[^75]: https://stackoverflow.com/questions/51513715/node-js-rest-api-versioning-the-right-way

[^76]: https://en.wikipedia.org/wiki/Cursor_(code_editor)

[^77]: https://dev.to/chatgptnexus/2025021118-21-25-article-117p

[^78]: https://www.geeksforgeeks.org/blogs/how-to-use-cursor-ai-with-examples/

[^79]: https://www.youtube.com/watch?v=Uy3G2zSrZEg

[^80]: https://www.datacamp.com/tutorial/cursor-ai-code-editor

[^81]: https://www.youtube.com/watch?v=OU32qjpEyG8

[^82]: https://dev.to/ajmal_hasan/exploring-cursor-ai-a-developers-smart-coding-companion-500

[^83]: https://ricardoanderegg.com/posts/cursor-ide-better-code-local-documentation/

[^84]: https://www.youtube.com/watch?v=ocMOZpuAMw4

[^85]: https://www.scribd.com/document/874552127/Introduction-to-Cursor-AI-Code-Editor

[^86]: https://vocal.media/education/ai-for-programmers-cursor-ai

[^87]: https://www.youtube.com/watch?v=MUGG2vTwM7E

[^88]: https://cursor.com

[^89]: https://www.youtube.com/watch?v=9cpS5HiuOmc

[^90]: https://dev.to/velan/discovering-the-power-of-cursor-ai-47ob

[^91]: https://www.rudrank.com/exploring-cursor-accessing-external-documentation-using-doc/

[^92]: https://lablab.ai/tech/cursor

[^93]: https://www.youtube.com/watch?v=Dvx5_DEReq0

[^94]: https://cursor.com/features

[^95]: https://www.youtube.com/watch?v=e0KjHv5w-mY

[^96]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/d277a5e4f1f48122568d5f8368a66ce6/9f9bfd96-f52d-4348-b401-227461555ee9/611af797.md

[^97]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/d277a5e4f1f48122568d5f8368a66ce6/211a9fce-5b5b-49b2-820f-8755dd3c3f2e/0392265f.ts

[^98]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/d277a5e4f1f48122568d5f8368a66ce6/e49db94c-43f1-4e15-80bf-6fd7d46df246/b55cdbef.json

[^99]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/d277a5e4f1f48122568d5f8368a66ce6/3c2e3e3f-ec3b-4801-bc25-7797f4d6fd43/7ae45ad1.json

