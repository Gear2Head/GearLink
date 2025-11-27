#!/bin/bash

# GearLink - Setup Script
# This script sets up the development environment

set -e

echo "🚀 GearLink Setup Script"
echo "========================="

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20.x or higher is required"
    exit 1
fi
echo "✅ Node.js version OK"

# Check pnpm
echo "📦 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "📥 Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm OK"

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi
echo "✅ Docker OK"

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# Setup environment
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - please configure it"
else
    echo "✅ .env file already exists"
fi

# Start infrastructure
echo "🐳 Starting infrastructure (PostgreSQL, Redis, Kafka)..."
docker-compose up -d

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd libs/prisma
pnpm generate

# Run migrations
echo "🗄️  Running database migrations..."
pnpm migrate:dev

# Seed database
echo "🌱 Seeding database..."
pnpm seed

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your API keys"
echo "2. Start services: pnpm dev:all"
echo "3. Or start individual services:"
echo "   - pnpm dev:auth"
echo "   - pnpm dev:user"
echo "   - pnpm dev:chat"
echo "   - pnpm dev:media"
echo "   - pnpm dev:notification"
echo ""
