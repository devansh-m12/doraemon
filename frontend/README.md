# ICP Transaction Explorer

A modern, responsive web application for monitoring transactions, verifying balances, and tracking cross-chain swaps on the Internet Computer (ICP) blockchain.

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: View total transactions, active swaps, completed transactions, and pending transactions
- **Recent Activity**: Monitor the latest transactions with status indicators
- **Quick Navigation**: Easy access to transaction explorer and balance checker

### 🔍 Transaction Explorer
- **Advanced Search**: Search transactions by ID, sender, or recipient addresses
- **Status Filtering**: Filter transactions by status (Pending, Completed, Refunded, Failed)
- **Detailed View**: Comprehensive transaction details including:
  - Transaction ID and type
  - Amount and status
  - Sender and recipient addresses
  - Hashlock and timelock information
  - Gas usage and block numbers
- **Copy Functionality**: One-click copying of addresses and transaction IDs
- **External Links**: Direct links to ICP Dashboard for additional verification

### 💰 Balance Checker
- **Address Validation**: Validate ICP Principal IDs before checking balances
- **Real-time Balance**: Display current ICP balance with currency information
- **Transaction Statistics**: View incoming and outgoing transaction counts
- **Account Details**: Complete account information including:
  - Principal ID with copy functionality
  - Last updated timestamp
  - Total transaction count
  - Currency information
- **Transaction History**: Detailed history of incoming and outgoing transactions

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ICP Integration**: @dfinity/agent, @dfinity/identity, @dfinity/principal
- **UI Components**: Headless UI

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard page
│   │   ├── explorer/
│   │   │   └── page.tsx          # Transaction explorer
│   │   ├── balance/
│   │   │   └── page.tsx          # Balance checker
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   └── utils/
│       └── icp.ts                # ICP integration utilities
├── public/                       # Static assets
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# ICP Network Configuration
NEXT_PUBLIC_ICP_NETWORK=mainnet
NEXT_PUBLIC_ICP_HOST=https://ic0.app
NEXT_PUBLIC_BRIDGE_CANISTER_ID=2tvx6-uqaaa-aaaab-qaclq-cai

# Development Configuration
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Network Configuration

The application supports both mainnet and testnet:

- **Mainnet**: `https://ic0.app`
- **Testnet**: `https://ic0.testnet.dfinity.network`

## 🎯 Usage

### Checking Balances

1. Navigate to the **Balance Checker** page
2. Enter a valid ICP Principal ID
3. Click **Check Balance**
4. View detailed balance information and transaction history

### Exploring Transactions

1. Navigate to the **Transaction Explorer** page
2. Use the search bar to find specific transactions
3. Filter by status using the dropdown
4. Click on any transaction to view detailed information
5. Copy addresses or transaction IDs with the copy button

### Dashboard Overview

1. View real-time statistics on the dashboard
2. Monitor recent transaction activity
3. Quick access to all features via navigation

## 🔗 Integration with Bridge

The explorer is designed to work with the Ethereum-ICP bridge:

- **Bridge Canister**: `2tvx6-uqaaa-aaaab-qaclq-cai`
- **Transaction Types**: Swap Created, Swap Completed, Swap Refunded
- **Cross-chain Tracking**: Monitor transactions between Ethereum and ICP

## 🧪 Testing

### Mock Data

For development and testing, the application uses mock data:

- **Sample Transactions**: Pre-populated with realistic transaction data
- **Balance Information**: Mock balance data for demonstration
- **Network Simulation**: Simulated network calls with delays

### Real Integration

To connect to real ICP networks:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in environment variables
2. Configure proper ICP agent with identity
3. Update canister IDs for your specific deployment

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Environment Variables**
   - Set production environment variables in Vercel dashboard
   - Configure ICP network settings

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use `npm run build` and deploy the `out` directory
- **AWS Amplify**: Connect your repository and configure build settings
- **Docker**: Use the provided Dockerfile for containerized deployment

## 🔒 Security

- **Address Validation**: All ICP addresses are validated before processing
- **Copy Protection**: Secure clipboard operations with user feedback
- **External Links**: Safe external links with proper rel attributes
- **Error Handling**: Comprehensive error handling for network failures

## 📱 Responsive Design

The application is fully responsive and works on:

- **Desktop**: Full-featured interface with side-by-side layouts
- **Tablet**: Optimized layouts for medium screens
- **Mobile**: Touch-friendly interface with stacked layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Issues**: Create an issue in the repository
- **Documentation**: Check the project documentation
- **Community**: Join the ICP community discussions

---

**Built with ❤️ for the Internet Computer ecosystem**
