# GearLink Startup Guide

## Quick Start

### 1. Start Infrastructure
```powershell
docker-compose -f docker-compose.infra.yml up -d
```

### 2. Run Database Setup
```powershell
pnpm prisma:migrate
```

### 3. Start Mobile App
```powershell
cd apps/mobile
npx expo start --port 8082
```

**Expo Go App Connection:**
1. Download **Expo Go** app from:
   - iOS: App Store
   - Android: Google Play Store
2. Open Expo Go on your phone
3. Scan the QR code displayed in your terminal
4. The app will load on your device

### 4. Start Web App
```powershell
# In a new terminal
pnpm --filter @gearlink/web dev
```

Access the web app at: **http://localhost:3019**

### 5. Start Backend Services
```powershell
# In a new terminal
pnpm dev:auth
pnpm dev:user
pnpm dev:chat
pnpm dev:media
pnpm dev:notification
pnpm dev:worker
```

## Automated Startup (All Services)

To start everything at once, use:
```powershell
.\scripts\start-all.ps1
```

**Note:** This script will:
- Install dependencies
- Start Docker infrastructure
- Run database migrations
- Start all backend services, web app, and mobile app concurrently

## Expo Go Connection Code

When you run the mobile app, you'll see output like:
```
› Metro waiting on exp://192.168.1.x:8082
› Scan QR code above with Expo Go (Android) or the Camera app (iOS)
```

The QR code will appear in your terminal. Simply scan it with the Expo Go app to connect.

## Troubleshooting

**Port Already in Use:**
- Mobile (Metro): Use `--port 8082` instead of default 8081
- Web: Vite will automatically try ports 3001, 3002, etc.

**Missing Dependencies:**
```powershell
pnpm install
```

**Database Errors:**
```powershell
pnpm prisma:generate
pnpm prisma:migrate
```
