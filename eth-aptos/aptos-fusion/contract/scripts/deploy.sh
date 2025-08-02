#!/bin/bash

# Fusion Swap Aptos Deployment Script
# This script deploys the fusion swap contract to different networks

set -e

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if aptos CLI is installed
check_aptos_cli() {
    if ! command_exists aptos; then
        print_error "Aptos CLI is not installed. Please install it first:"
        echo "curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
        exit 1
    fi
    print_success "Aptos CLI found"
}

# Function to compile the contract
compile_contract() {
    print_status "Compiling fusion swap contract..."
    
    if aptos move compile --package-dir .; then
        print_success "Contract compiled successfully"
    else
        print_error "Contract compilation failed"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if aptos move test --package-dir .; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Function to deploy to local network
deploy_local() {
    print_status "Deploying to local network..."
    
    # Start local node if not running
    if ! curl -s http://localhost:8080/v1 >/dev/null 2>&1; then
        print_warning "Local Aptos node not running. Starting node..."
        aptos node start &
        sleep 10
    fi
    
    # Deploy contract
    if aptos move publish --package-dir . --named-addresses fusion_swap_addr=default; then
        print_success "Contract deployed to local network successfully"
        print_status "Contract address: $(aptos account list --query resources --account default | grep -o '0x[a-fA-F0-9]*' | head -1)"
    else
        print_error "Local deployment failed"
        exit 1
    fi
}

# Function to deploy to testnet
deploy_testnet() {
    print_status "Deploying to testnet..."
    
    # Check if testnet profile exists
    if ! aptos init --profile testnet --network testnet --assume-yes; then
        print_error "Failed to initialize testnet profile"
        exit 1
    fi
    
    # Deploy contract
    if aptos move publish --package-dir . --profile testnet --named-addresses fusion_swap_addr=default; then
        print_success "Contract deployed to testnet successfully"
        print_status "Contract address: $(aptos account list --profile testnet --query resources --account default | grep -o '0x[a-fA-F0-9]*' | head -1)"
    else
        print_error "Testnet deployment failed"
        exit 1
    fi
}

# Function to deploy to mainnet
deploy_mainnet() {
    print_status "Deploying to mainnet..."
    
    # Check if mainnet profile exists
    if ! aptos init --profile mainnet --network mainnet --assume-yes; then
        print_error "Failed to initialize mainnet profile"
        exit 1
    fi
    
    # Deploy contract
    if aptos move publish --package-dir . --profile mainnet --named-addresses fusion_swap_addr=default; then
        print_success "Contract deployed to mainnet successfully"
        print_status "Contract address: $(aptos account list --profile mainnet --query resources --account default | grep -o '0x[a-fA-F0-9]*' | head -1)"
    else
        print_error "Mainnet deployment failed"
        exit 1
    fi
}

# Function to initialize contract
initialize_contract() {
    local network=$1
    print_status "Initializing fusion swap contract on $network..."
    
    if [ "$network" = "local" ]; then
        if aptos move run --function-id default::fusion_swap::init_module; then
            print_success "Contract initialized on local network"
        else
            print_error "Contract initialization failed on local network"
            exit 1
        fi
    elif [ "$network" = "testnet" ]; then
        if aptos move run --function-id default::fusion_swap::init_module --profile testnet; then
            print_success "Contract initialized on testnet"
        else
            print_error "Contract initialization failed on testnet"
            exit 1
        fi
    elif [ "$network" = "mainnet" ]; then
        if aptos move run --function-id default::fusion_swap::init_module --profile mainnet; then
            print_success "Contract initialized on mainnet"
        else
            print_error "Contract initialization failed on mainnet"
            exit 1
        fi
    fi
}

# Function to verify deployment
verify_deployment() {
    local network=$1
    print_status "Verifying deployment on $network..."
    
    if [ "$network" = "local" ]; then
        if aptos move view --function-id default::fusion_swap::get_order_count; then
            print_success "Deployment verified on local network"
        else
            print_error "Deployment verification failed on local network"
            exit 1
        fi
    elif [ "$network" = "testnet" ]; then
        if aptos move view --function-id default::fusion_swap::get_order_count --profile testnet; then
            print_success "Deployment verified on testnet"
        else
            print_error "Deployment verification failed on testnet"
            exit 1
        fi
    elif [ "$network" = "mainnet" ]; then
        if aptos move view --function-id default::fusion_swap::get_order_count --profile mainnet; then
            print_success "Deployment verified on mainnet"
        else
            print_error "Deployment verification failed on mainnet"
            exit 1
        fi
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --network NETWORK    Deploy to specific network (local|testnet|mainnet)"
    echo "  -c, --compile            Compile contract only"
    echo "  -t, --test               Run tests only"
    echo "  -i, --init               Initialize contract after deployment"
    echo "  -v, --verify             Verify deployment after deployment"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -n local              Deploy to local network"
    echo "  $0 -n testnet -i -v      Deploy to testnet, initialize and verify"
    echo "  $0 -c -t                 Compile and test only"
    echo "  $0 -n mainnet            Deploy to mainnet"
}

# Main script
main() {
    local network=""
    local compile_only=false
    local test_only=false
    local init_contract=false
    local verify_deployment_flag=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -n|--network)
                network="$2"
                shift 2
                ;;
            -c|--compile)
                compile_only=true
                shift
                ;;
            -t|--test)
                test_only=true
                shift
                ;;
            -i|--init)
                init_contract=true
                shift
                ;;
            -v|--verify)
                verify_deployment_flag=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if aptos CLI is installed
    check_aptos_cli
    
    # Change to contract directory
    cd "$(dirname "$0")/.."
    
    # Compile contract
    compile_contract
    
    # Run tests
    run_tests
    
    # If compile or test only, exit here
    if [ "$compile_only" = true ] || [ "$test_only" = true ]; then
        print_success "Operation completed successfully"
        exit 0
    fi
    
    # Deploy based on network
    case $network in
        local)
            deploy_local
            if [ "$init_contract" = true ]; then
                initialize_contract "local"
            fi
            if [ "$verify_deployment_flag" = true ]; then
                verify_deployment "local"
            fi
            ;;
        testnet)
            deploy_testnet
            if [ "$init_contract" = true ]; then
                initialize_contract "testnet"
            fi
            if [ "$verify_deployment_flag" = true ]; then
                verify_deployment "testnet"
            fi
            ;;
        mainnet)
            deploy_mainnet
            if [ "$init_contract" = true ]; then
                initialize_contract "mainnet"
            fi
            if [ "$verify_deployment_flag" = true ]; then
                verify_deployment "mainnet"
            fi
            ;;
        "")
            print_error "Network not specified. Use -n or --network option."
            show_usage
            exit 1
            ;;
        *)
            print_error "Invalid network: $network. Valid options: local, testnet, mainnet"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@" 