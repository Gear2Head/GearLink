# Android Studio Setup & Testing Guide

This guide will help you set up Android Studio to test the GearLink mobile application.

## 1. Prerequisites

- **Java Development Kit (JDK) 11 or newer**: Ensure JDK is installed and `JAVA_HOME` environment variable is set.
- **Node.js 20+**: Already required for the project.
- **Android Studio**: Download and install from [developer.android.com](https://developer.android.com/studio).

## 2. Android Studio Configuration

### Step 1: SDK Manager
1. Open Android Studio.
2. Go to **More Actions** > **SDK Manager**.
3. In **SDK Platforms**, check **Android 13.0 (Tiramisu)** or newer.
4. In **SDK Tools**, check:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools (latest)
   - Android Emulator
   - Android SDK Platform-Tools
5. Click **Apply** to install.

### Step 2: Environment Variables (Windows)
Add the following to your System Environment Variables:
- `ANDROID_HOME`: `C:\Users\<YourUser>\AppData\Local\Android\Sdk`
- Add to `Path`:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\cmdline-tools\latest\bin`

### Step 3: Create Virtual Device (AVD)
1. Open Android Studio.
2. Go to **More Actions** > **Virtual Device Manager**.
3. Click **Create device**.
4. Select a phone (e.g., Pixel 6).
5. Select a system image (e.g., Tiramisu API 33).
6. Click **Finish**.
7. Launch the emulator by clicking the **Play** button.

## 3. Running GearLink Mobile

### Step 1: Install Dependencies
Open a terminal in the project root:
```powershell
pnpm install
```

### Step 2: Start Metro Bundler
```powershell
cd apps/mobile
pnpm start
```

### Step 3: Run on Android Emulator
In the Metro Bundler terminal, press `a` to open on Android.
OR run:
```powershell
pnpm android
```

## 4. Troubleshooting

### "SDK location not found"
Create a `local.properties` file in `apps/mobile/android` (if you eject) with:
```
sdk.dir=C:\\Users\\<YourUser>\\AppData\\Local\\Android\\Sdk
```

### "ADB not recognized"
Ensure `platform-tools` is in your System Path and restart your terminal.

### Network Issues
If the emulator cannot connect to localhost backend:
- Use `10.0.2.2` instead of `localhost` in your API calls within the app.
- Or run `adb reverse tcp:3000 tcp:3000` to forward ports.

## 5. Physical Device Testing
1. Install **Expo Go** from Play Store on your phone.
2. Connect phone to same Wi-Fi as PC.
3. Run `pnpm start`.
4. Scan the QR code with Expo Go.
