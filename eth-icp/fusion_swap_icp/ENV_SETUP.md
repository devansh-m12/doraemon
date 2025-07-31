# Environment Variables Setup

This document explains how to configure the canister IDs and test principals using environment variables.

## Overview

All hardcoded canister IDs and test principal IDs have been moved to environment variables to make the tests more flexible and easier to maintain. When canister IDs change, you only need to update the `.env` file instead of modifying multiple test files.

## Environment Variables

The following environment variables are used in the tests:

### Canister IDs
- `FUSION_SWAP_CANISTER_ID`: The Fusion Swap backend canister ID
- `ICRC1_CANISTER_ID`: The ICRC1 token ledger canister ID  
- `ICRC1_LEDGER_CANISTER_ID`: The ICRC1 ledger canister ID (used in some tests)

### Test Principals
- `TEST_MAKER_PRINCIPAL`: The principal ID for the test-maker identity
- `TEST_TAKER_PRINCIPAL`: The principal ID for the test-taker identity
- `DEFAULT_PRINCIPAL`: The principal ID for the default identity

## Default Values

If environment variables are not set, the following default values are used:

```
FUSION_SWAP_CANISTER_ID=bkyz2-fmaaa-aaaaa-qaaaq-cai
ICRC1_CANISTER_ID=br5f7-7uaaa-aaaaa-qaaca-cai
ICRC1_LEDGER_CANISTER_ID=bd3sg-teaaa-aaaaa-qaaba-cai
TEST_MAKER_PRINCIPAL=cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae
TEST_TAKER_PRINCIPAL=fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe
DEFAULT_PRINCIPAL=vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe
```

## Files Updated

The following files have been updated to use environment variables:

### Test Files
- `tests/token-utils.ts`
- `tests/icrc-utils.ts`
- `tests/dfx-order-creation.test.ts`
- `tests/fill-order.test.ts`
- `tests/fusion-plus.test.ts`
- `tests/icrc-utils.test.ts`

### Script Files
- `scripts/test-order-operations.ts`

## Usage

1. Copy the `.env.example` file to `.env` (if it doesn't exist)
2. Update the canister IDs in the `.env` file when they change
3. Run the tests as usual - they will automatically use the environment variables

## Benefits

- **Centralized Configuration**: All canister IDs are in one place
- **Easy Updates**: When canister IDs change, only update the `.env` file
- **Backward Compatibility**: Tests still work with default values if `.env` is not present
- **Environment Flexibility**: Different environments can use different canister IDs

## Example .env File

```env
# Canister IDs for Fusion Swap ICP tests
FUSION_SWAP_CANISTER_ID=bkyz2-fmaaa-aaaaa-qaaaq-cai
ICRC1_CANISTER_ID=br5f7-7uaaa-aaaaa-qaaca-cai
ICRC1_LEDGER_CANISTER_ID=bd3sg-teaaa-aaaaa-qaaba-cai

# Test Identity Principals
TEST_MAKER_PRINCIPAL=cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae
TEST_TAKER_PRINCIPAL=fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe
DEFAULT_PRINCIPAL=vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe
``` 