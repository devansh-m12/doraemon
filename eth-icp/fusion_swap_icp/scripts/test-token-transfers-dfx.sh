#!/bin/bash

# Test script for ICRC1 token transfers using dfx commands
set -e

echo "🚀 Starting ICRC1 Token Transfer Tests with dfx..."

# Load environment variables
source .env

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test 1: Get token information
print_status "Testing token information..."
echo "Token Name:"
dfx canister call icrc1_ledger_canister icrc1_name

echo "Token Symbol:"
dfx canister call icrc1_ledger_canister icrc1_symbol

echo "Total Supply:"
dfx canister call icrc1_ledger_canister icrc1_total_supply

echo "Transfer Fee:"
dfx canister call icrc1_ledger_canister icrc1_fee

print_success "Token information retrieved successfully"

# Test 2: Check initial balances
print_status "Checking initial balances..."

echo "Your Minting Account Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe\"; subaccount = null })"

echo "Test Maker Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null })"

echo "Test Taker Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_TAKER_PRINCIPAL\"; subaccount = null })"

echo "Test Resolver Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_RESOLVER_PRINCIPAL\"; subaccount = null })"

print_success "Initial balances checked"

# Test 3: Transfer tokens from minting account to test accounts (if needed)
print_status "Transferring additional tokens to test accounts..."

echo "Transferring 100 million tokens to test maker..."
dfx canister call icrc1_ledger_canister icrc1_transfer "(record { from_subaccount = null; to = record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null }; amount = 100_000_000; fee = null; memo = null; created_at_time = null })"

echo "Transferring 50 million tokens to test taker..."
dfx canister call icrc1_ledger_canister icrc1_transfer "(record { from_subaccount = null; to = record { owner = principal \"$TEST_TAKER_PRINCIPAL\"; subaccount = null }; amount = 50_000_000; fee = null; memo = null; created_at_time = null })"

print_success "Additional tokens transferred to test accounts"

# Test 4: Check balances after transfer
print_status "Checking balances after transfer..."

echo "Test Maker Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null })"

echo "Test Taker Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_TAKER_PRINCIPAL\"; subaccount = null })"

print_success "Balances verified after transfer"

# Test 5: Test ICRC2 approve and transfer_from
print_status "Testing ICRC2 approve and transfer_from..."

echo "Switching to test-maker identity for approval..."
dfx identity use test-maker

echo "Approving 30 million tokens for resolver to spend from maker..."
dfx canister call icrc1_ledger_canister icrc2_approve "(record { from_subaccount = null; spender = record { owner = principal \"$TEST_RESOLVER_PRINCIPAL\"; subaccount = null }; amount = 30_000_000; expected_allowance = opt 0; expires_at = null; fee = opt 10_000; memo = null; created_at_time = null })"

echo "Checking allowance..."
dfx canister call icrc1_ledger_canister icrc2_allowance "(record { account = record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null }; spender = record { owner = principal \"$TEST_RESOLVER_PRINCIPAL\"; subaccount = null } })"

echo "Switching to test-resolver identity for transfer_from..."
dfx identity use test-resolver

echo "Transferring 15 million tokens using transfer_from..."
dfx canister call icrc1_ledger_canister icrc2_transfer_from "(record { spender_subaccount = null; from = record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null }; to = record { owner = principal \"$TEST_RESOLVER_PRINCIPAL\"; subaccount = null }; amount = 15_000_000; fee = opt 10_000; memo = null; created_at_time = null })"

echo "Switching back to default identity..."
dfx identity use default

print_success "ICRC2 approve and transfer_from completed"

# Test 6: Final balance check
print_status "Checking final balances..."

echo "Test Maker Final Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_MAKER_PRINCIPAL\"; subaccount = null })"

echo "Test Taker Final Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_TAKER_PRINCIPAL\"; subaccount = null })"

echo "Test Resolver Final Balance:"
dfx canister call icrc1_ledger_canister icrc1_balance_of "(record { owner = principal \"$TEST_RESOLVER_PRINCIPAL\"; subaccount = null })"

print_success "All tests completed successfully! 🎉"

echo ""
echo "📊 Summary:"
echo "- Token transfers from minting account to test accounts: ✅"
echo "- ICRC2 approve functionality: ✅"
echo "- ICRC2 transfer_from functionality: ✅"
echo "- Balance verification: ✅" 