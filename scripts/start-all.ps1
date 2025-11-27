# Start-All Script for GearLink

Write-Host "Starting GearLink Development Environment..." -ForegroundColor Green

# 1. Install Dependencies
Write-Host "Checking dependencies..." -ForegroundColor Cyan
pnpm install

# 2. Start Infrastructure
Write-Host "Starting Docker Infrastructure..." -ForegroundColor Cyan
docker-compose up -d

# 3. Run Migrations
Write-Host "Running Database Migrations..." -ForegroundColor Cyan
pnpm prisma:migrate

# 4. Start All Services
Write-Host "Starting All Services (Backend, Web, Mobile)..." -ForegroundColor Green
Write-Host "Scan the QR code below with Expo Go app on your phone once it appears." -ForegroundColor Yellow
pnpm dev:all
