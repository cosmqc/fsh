#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

print_status "Starting deployment process..."

# Step 1: Build the contract
print_status "Building contract..."
cd "$PROJECT_ROOT/contract"
make build-mainnet-reproducible

if [ $? -ne 0 ]; then
    print_error "Contract build failed"
    exit 1
fi

print_status "Contract build completed successfully"

# Step 2: Upload the contract
print_status "Uploading contract..."
cd "$PROJECT_ROOT/uploader"

# Capture the upload output
UPLOAD_OUTPUT=$(npm run upload 2>&1)

# Extract Code Id and Contract hash from the output
CODE_ID=$(echo "$UPLOAD_OUTPUT" | grep "Code Id:" | awk '{print $3}')
CONTRACT_HASH=$(echo "$UPLOAD_OUTPUT" | grep "Contract hash:" | awk '{print $3}')

if [ -z "$CODE_ID" ] || [ -z "$CONTRACT_HASH" ]; then
    print_error "Failed to extract Code Id or Contract hash from upload output"
    print_error "Upload output was:"
    echo "$UPLOAD_OUTPUT"
    exit 1
fi

print_status "Upload completed"

# Step 3: Instantiate the contract
print_status "Instantiating contract..."
INSTANTIATE_OUTPUT=$(npm run instantiate $CODE_ID $CONTRACT_HASH 2>&1)

# Extract Contract address from the output
CONTRACT_ADDRESS=$(echo "$INSTANTIATE_OUTPUT" | grep "Contract address:" | awk '{print $3}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    print_error "Failed to extract Contract address from instantiate output"
    print_error "Instantiate output was:"
    echo "$INSTANTIATE_OUTPUT"
    exit 1
fi

print_status "Instantiation completed"

# Step 4: Update the .env file
print_status "Updating .env file..."
ENV_FILE="$PROJECT_ROOT/frontend/.env"
ENV_EXAMPLE="$PROJECT_ROOT/frontend/.env.example"

WAS_ERROR=0
# Update or create .env file
{
    # If .env exists, overwrite past variables
    if [ -f "$ENV_FILE" ]; then
        grep -v "^VITE_CONTRACT_CODE_HASH=" "$ENV_FILE" | grep -v "^VITE_CONTRACT_ADDR=" || true
    
    # If .env doesn't exist, copy example file and overwrite nonce values
    elif [ -f "$ENV_EXAMPLE" ]; then
        grep -v "^VITE_CONTRACT_CODE_HASH=" "$ENV_EXAMPLE" | grep -v "^VITE_CONTRACT_ADDR=" || true


    # If example file doesn
    else
        WAS_ERROR=1
    fi

    # Add new values
    echo "VITE_CONTRACT_CODE_HASH=$CONTRACT_HASH"
    echo "VITE_CONTRACT_ADDR=$CONTRACT_ADDRESS"
} > "$ENV_FILE.tmp"

mv "$ENV_FILE.tmp" "$ENV_FILE"

if [ $WAS_ERROR ]; then
    print_warning ".env and .env.example not found, you'll have to create your file manually. Check the docs :)"
    echo ""
    echo "======================================"
    echo "         DEPLOYMENT SUMMARY"
    echo "======================================"
    echo "Code Id:          $CODE_ID"
    echo "Contract Hash:    $CONTRACT_HASH"
    echo "Contract Address: $CONTRACT_ADDRESS"
    echo "======================================"
    echo ""
else
    print_status "Environment file successfully updated at: $ENV_FILE"
    print_status "Deployment completed successfully!"
    print_status "Starting frontend..."
    cd "$PROJECT_ROOT/frontend"
    npm run dev
fi