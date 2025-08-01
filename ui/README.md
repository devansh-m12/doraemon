# Token Search UI

A modern, responsive web application for searching tokens across multiple blockchain networks using the 1inch API through Model Context Protocol (MCP).

## 🚀 Features

- **Multi-Chain Support**: Search tokens across Ethereum, BSC, Polygon, Arbitrum, and Optimism
- **Real-time Search**: Debounced search with instant results
- **Modern UI**: Beautiful gradient design with smooth animations
- **Token Information**: Display token symbols, names, addresses, decimals, and tags
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Error Handling**: Comprehensive error states and loading indicators

## 🏗️ Architecture

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React for beautiful icons
- **State Management**: React hooks for local state
- **TypeScript**: Full type safety throughout

### Backend Integration
- **API Routes**: Next.js API routes for server-side logic
- **MCP Client**: Integration with 1inch MCP server
- **Error Handling**: Comprehensive error handling and validation

### Key Components

#### 1. Search Interface
```typescript
// Main search component with chain selection
const [searchQuery, setSearchQuery] = useState('');
const [selectedChain, setSelectedChain] = useState(1);
```

#### 2. Token Display
```typescript
// Token card with comprehensive information
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}
```

#### 3. MCP Integration
```typescript
// MCP client for 1inch API communication
export class MCPClient {
  async searchTokens(chainId: number, query: string, limit: number = 10)
}
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- 1inch API key (for production)

### Installation

1. **Clone and Install Dependencies**
```bash
cd ui
npm install --legacy-peer-deps
```

2. **Environment Configuration**
Create a `.env.local` file:
```env
# 1inch API Configuration
ONEINCH_API_KEY=your_1inch_api_key_here
ONEINCH_BASE_URL=https://api.1inch.dev

# MCP Server Configuration
MCP_SERVER_PATH=/path/to/1inch-mcp/dist/index.js
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open Application**
Navigate to `http://localhost:3000`

## 🎯 Usage

### Search Tokens
1. **Select Network**: Choose from available blockchain networks
2. **Enter Query**: Type token name or symbol (e.g., "USDC", "ETH")
3. **View Results**: See comprehensive token information including:
   - Token symbol and name
   - Contract address (truncated for readability)
   - Decimal places
   - Token tags (stablecoin, wrapped, etc.)
   - Token logo (if available)

### Supported Networks
- **Ethereum (1)**: Mainnet with blue theme
- **BSC (56)**: Binance Smart Chain with yellow theme
- **Polygon (137)**: Polygon network with purple theme
- **Arbitrum (42161)**: Arbitrum One with blue theme
- **Optimism (10)**: Optimism network with red theme

## 🔧 Development

### Project Structure
```
ui/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── search-tokens/
│   │   │       └── route.ts          # API endpoint
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main search page
│   └── lib/
│       └── mcp-client.ts             # MCP client utility
├── public/                           # Static assets
└── package.json                      # Dependencies
```

### Key Files

#### 1. Main Page (`src/app/page.tsx`)
- Complete search interface
- Chain selection
- Results display
- Error handling

#### 2. API Route (`src/app/api/search-tokens/route.ts`)
- Handles search requests
- Integrates with MCP client
- Returns formatted results

#### 3. MCP Client (`src/lib/mcp-client.ts`)
- Manages MCP server connection
- Handles token search requests
- Provides mock data for development

### Adding New Features

#### 1. Add New Networks
```typescript
const chains = [
  // ... existing chains
  { id: 43114, name: 'Avalanche', color: 'bg-orange-500' },
];
```

#### 2. Extend Token Information
```typescript
interface TokenInfo {
  // ... existing fields
  marketCap?: string;
  volume24h?: string;
  priceChange24h?: string;
}
```

#### 3. Add New Search Filters
```typescript
const [filterByTag, setFilterByTag] = useState<string>('');
const [sortBy, setSortBy] = useState<'name' | 'symbol' | 'marketCap'>('name');
```

## 🚀 Production Deployment

### 1. Build Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Environment Variables
Ensure all required environment variables are set:
- `ONEINCH_API_KEY`: Your 1inch API key
- `MCP_SERVER_PATH`: Path to compiled MCP server

### 4. MCP Server Integration
For production, update the MCP client to connect to the actual 1inch MCP server:

```typescript
// In mcp-client.ts
async connect() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [process.env.MCP_SERVER_PATH || '/path/to/mcp/server']
  });
  
  this.client = new Client({
    name: '1inch-token-search',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  });
  
  await this.client.connect(transport);
}
```

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Dark theme with purple accents
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and hover effects
- **Icons**: Consistent iconography with Lucide React

### Responsive Design
- **Mobile**: Optimized for touch interactions
- **Tablet**: Adaptive layout for medium screens
- **Desktop**: Full-featured interface with hover states

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: High contrast ratios for readability

## 🔍 Search Functionality

### Search Algorithm
1. **Input Validation**: Sanitize and validate search queries
2. **Debounced Search**: 500ms delay to prevent excessive API calls
3. **Multi-field Search**: Search by symbol and name
4. **Case Insensitive**: Results regardless of case
5. **Limit Results**: Maximum 10 results per search

### Error Handling
- **Network Errors**: Graceful handling of API failures
- **Invalid Input**: Clear error messages for invalid queries
- **Empty Results**: Helpful empty state with suggestions
- **Loading States**: Clear loading indicators

## 🧪 Testing

### Manual Testing
1. **Search Functionality**: Test with various token names
2. **Network Switching**: Verify results change per network
3. **Error Scenarios**: Test with invalid inputs
4. **Responsive Design**: Test on different screen sizes

### Automated Testing (Future)
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [1inch Developer Portal](https://portal.1inch.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using Next.js, React 19, and the 1inch MCP server
