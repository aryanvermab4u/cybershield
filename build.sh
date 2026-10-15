#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Step 1: Installing Python dependencies..."
pip install -r requirements.txt

# If frontend/dist already exists (pre-built), use it
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    echo "==> Step 2: Pre-built frontend found in frontend/dist. Assets verified."
else
    echo "==> Step 2: Frontend assets not found. Provisioning Node.js..."
    NODE_VERSION="20.18.0"
    curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz | tar -xJ
    export PATH="$(pwd)/node-v${NODE_VERSION}-linux-x64/bin:$PATH"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
    echo "Building React frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo "==> Build process completed successfully!"
