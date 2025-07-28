# Canister ID Management

## Overview

Canister IDs can change on each deployment, especially in local development environments. This document explains how the system handles dynamic canister IDs and how to update them when they change.

## How It Works

### 1. Automatic Updates During Deployment

The `start.sh` script automatically handles canister ID updates during deployment:

- Deploys the bridge canister using `dfx deploy`
- Extracts the new canister ID using `dfx canister id`
- Updates all configuration files with the new canister ID
- Updates the TypeScript utilities file

### 2. Configuration Files Updated

When a new canister ID is detected, the following files are automatically updated:

- `.env` (root directory)
- `frontend/.env.local`
- `frontend/src/utils/icp.ts`

### 3. Environment Variable Priority

The system uses the following priority for canister IDs:

1. `NEXT_PUBLIC_BRIDGE_CANISTER_ID` environment variable
2. Fallback canister ID in the code
3. Default canister ID for the network

## Manual Updates

### Using the Update Script

If you need to manually update the canister ID, use the provided script:

```bash
# Update with a specific canister ID
./scripts/update-canister-id.sh 2tvx6-uqaaa-aaaab-qaclq-cai

# Get current canister ID from dfx and update
./scripts/update-canister-id.sh
```

### Manual Steps

If you prefer to update manually:

1. **Get the new canister ID:**
   ```bash
   cd eth-icp-bridge/icp-canisters/bridge_canister
   dfx canister --network=local id bridge_canister_backend
   ```

2. **Update environment files:**
   ```bash
   # Update .env file
   sed -i.bak "s/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=NEW_CANISTER_ID/" .env
   
   # Update frontend .env.local
   sed -i.bak "s/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=NEW_CANISTER_ID/" frontend/.env.local
   ```

3. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Runtime Updates

The system also supports runtime updates through the `updateCanisterId` function:

```typescript
import { updateCanisterId } from '@/utils/icp'

// Update canister ID at runtime
updateCanisterId('local', 'new-canister-id')
```

## Troubleshooting

### Canister ID Not Updating

1. **Check if dfx is running:**
   ```bash
   dfx ping
   ```

2. **Verify canister deployment:**
   ```bash
   cd eth-icp-bridge/icp-canisters/bridge_canister
   dfx canister --network=local status bridge_canister_backend
   ```

3. **Check environment variables:**
   ```bash
   echo $NEXT_PUBLIC_BRIDGE_CANISTER_ID
   ```

### Frontend Not Using New Canister ID

1. **Clear browser cache and localStorage:**
   ```javascript
   localStorage.removeItem('NEXT_PUBLIC_BRIDGE_CANISTER_ID')
   ```

2. **Restart the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Check the .env.local file:**
   ```bash
   cat frontend/.env.local
   ```

## Best Practices

1. **Always use the start script** for initial setup to ensure automatic canister ID handling
2. **Use the update script** when canister IDs change during development
3. **Restart the frontend** after canister ID changes to ensure the new ID is loaded
4. **Check logs** if issues occur: `tail -f bridge-deploy.log`

## Network-Specific Canister IDs

The system supports different canister IDs for different networks:

- **Local**: Uses environment variable or fallback
- **Testnet**: Uses predefined testnet canister ID
- **Mainnet**: Uses predefined mainnet canister ID

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BRIDGE_CANISTER_ID` | Bridge canister ID for local network | `2tvx6-uqaaa-aaaab-qaclq-cai` |
| `NEXT_PUBLIC_ICP_NETWORK` | Current ICP network | `local` |
| `NEXT_PUBLIC_ICP_HOST` | ICP network host | `http://localhost:4943` | 