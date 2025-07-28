#!/bin/bash

# Setup Secrets Helper Script
# This script helps users set up their .env.secrets file

set -e

echo "🔐 Setting up secure environment configuration..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env.secrets already exists
if [ -f ".env.secrets" ]; then
    print_warning ".env.secrets already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Keeping existing .env.secrets file."
        exit 0
    fi
fi

# Copy template
if [ -f "env.secrets.example" ]; then
    cp env.secrets.example .env.secrets
    print_success "Created .env.secrets from template."
else
    print_error "env.secrets.example not found!"
    exit 1
fi

echo ""
echo "📝 Please edit .env.secrets with your actual values:"
echo ""

# Show the current content
echo "Current .env.secrets content:"
echo "============================="
cat .env.secrets
echo ""

print_status "You can edit this file with:"
echo "  nano .env.secrets"
echo "  vim .env.secrets"
echo "  code .env.secrets"
echo ""

print_warning "IMPORTANT: Replace the placeholder values with your actual sensitive data!"
echo ""

print_status "After editing .env.secrets, you can run:"
echo "  ./start.sh"
echo ""

print_success "Secrets setup complete!" 