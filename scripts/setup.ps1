# GearLink - Setup Script (PowerShell)
# This script sets up the development environment on Windows

Write-Host "🚀 GearLink Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = (node -v).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 20) {
    Write-Host "❌ Node.js 20.x or higher is required" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version OK" -ForegroundColor Green

# Check pnpm
Write-Host "📦 Checking pnpm..." -ForegroundColor Yellow
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "✅ pnpm OK" -ForegroundColor Green

# Check Docker
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is required but not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker OK" -ForegroundColor Green

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Setup environment
Write-Host "⚙️  Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file - please configure it" -ForegroundColor Green
}
else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Start infrastructure
Write-Host "🐳 Starting infrastructure (PostgreSQL, Redis, Kafka)..." -ForegroundColor Yellow
docker-compose up -d

# Wait for PostgreSQL
Write-Host "⏳ Waiting for PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
Set-Location libs\prisma
pnpm generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
pnpm migrate:dev

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
pnpm seed

Set-Location ..\..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure .env file with your API keys"
Write-Host "2. Start services: pnpm dev:all"
Write-Host "3. Or start individual services:"
Write-Host "   - pnpm dev:auth"
Write-Host "   - pnpm dev:user"
Write-Host "   - pnpm dev:chat"
Write-Host "   - pnpm dev:media"
Write-Host "   - pnpm dev:notification"
Write-Host ""
