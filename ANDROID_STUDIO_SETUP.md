# Android Studio Kurulum Rehberi - GearLink

## Ön Gereksinimler

### 1. Android Studio İndir ve Kur

**İndirme:**
- [Android Studio İndir](https://developer.android.com/studio)
- Windows için `.exe` dosyasını indirin

**Kurulum:**
1. İndirilen dosyayı çalıştırın
2. "Standard" kurulum seçeneğini seçin
3. Android SDK, Android SDK Platform, ve Android Virtual Device yüklenecek
4. Kurulum tamamlanana kadar bekleyin

### 2. Android SDK Yapılandırması

Android Studio'yu açtıktan sonra:
1. **More Actions** > **SDK Manager**
2. **SDK Platforms** sekmesi:
   - `Android 13.0 (Tiramisu)` ✅
   - `Android 12.0 (S)` ✅
3. **SDK Tools** sekmesi:
   - `Android SDK Build-Tools`
   - `Android Emulator`
   - `Android SDK Platform-Tools`
   - `Intel x86 Emulator Accelerator (HAXM installer)`
4. **Apply** tıklayın

### 3. Ortam Değişkenlerini Ayarlama

**Windows için:**

1. **Sistem Özellikleri** açın:
   - Windows tuşu + "environment variables" arayın
   - "Sistem ortam değişkenlerini düzenle"

2. **Sistem değişkenleri** → **Yeni**:
   - Değişken adı: `ANDROID_HOME`
   - Değişken değeri: `C:\Users\<KullanıcıAdı>\AppData\Local\Android\Sdk`

3. **Path** değişkenini düzenleyin, ekleyin:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Kaydet** ve bilgisayarı **yeniden başlatın**

### 4. Java Development Kit (JDK)

Android Studio genellikle JDK ile birlikte gelir. Kontrol etmek için:

```powershell
java -version
```

Eğer kurulu değilse:
- [JDK 11 İndir](https://adoptium.net/)

---

## Emulator Kurulumu

### Virtual Device Oluşturma

1. Android Studio → **More Actions** → **Virtual Device Manager**
2. **Create Device** tıklayın
3. **Phone** kategorisinden bir cihaz seçin (örn: **Pixel 5**)
4. **System Image** seçin:
   - **API Level 33** (Android 13.0 - Tiramisu) önerilir
   - İndirmek için **Download** tıklayın
5. **Finish**

### Emulator'ı Başlatma

- Virtual Device Manager'dan **Play** ▶️ butonuna tıklayın
- Emulator açılacak (ilk açılışta biraz zaman alabilir)

---

## React Native Development Environment

### 1. Node.js (Zaten Kurulu)

Kontrol:
```powershell
node -v
```

### 2. React Native CLI

```powershell
npm install -g react-native-cli
```

---

## GearLink Uygulamasını Android Studio'da Çalıştırma

### 1. Projeyi Android Studio'da Açma

1. Android Studio'yu açın
2. **Open** tıklayın
3. Şu klasörü seçin:
   ```
   C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile\android
   ```

### 2. Gradle Sync

- Android Studio projeyi açtığında otomatik olarak **Gradle Sync** başlatır
- Alt kısımda ilerleme çubuğu görünecek
- Tamamlanmasını bekleyin (ilk seferde uzun sürebilir)

### 3. Uygulamayı Çalıştırma

**Metro Bundler'ı Başlatın:**
```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native start
```

**Başka Bir Terminal'de:**
```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native run-android
```

Veya Android Studio'da:
- Üst menüden **Run** → **Run 'app'**
- Veya yeşil **Play** ▶️ butonuna tıklayın

---

## Docker Desktop Kurulumu (Database için)

### 1. Docker Desktop İndirme

- [Docker Desktop İndir](https://www.docker.com/products/docker-desktop/)
- Windows sürümünü indirin

### 2. Kurulum

1. İndirilen `.exe` dosyasını çalıştırın
2. "Use WSL 2 instead of Hyper-V" seçeneğini işaretleyin (önerilir)
3. Kurulumu tamamlayın
4. Bilgisayarı yeniden başlatın

### 3. Docker Desktop'ı Başlatma

- Docker Desktop'ı açın
- Alt kısımda yeşil durum görünene kadar bekleyin

### 4. Database ve Redis Başlatma

```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink
docker-compose -f docker-compose.infra.yml up -d
```

---

## Environment Variables Ayarlama

### 1. .env Dosyası Oluşturma

`C:\Users\kadir\.gemini\antigravity\scratch\GearLink` klasöründe `.env` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://gearlink:gearlink123@localhost:5432/gearlink"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# API
API_URL="http://localhost:3000"

# Twilio (SMS için - opsiyonel)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Google OAuth (opsiyonel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# AWS S3 (media için - opsiyonel)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_REGION="us-east-1"
```

### 2. Database Migration

```powershell
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

---

## Sorun Giderme

### Gradle Build Hatası

```powershell
cd apps/mobile/android
./gradlew clean
./gradlew build
```

### Metro Bundler Port Çakışması

Metro Bundler portunu değiştirin:
```powershell
npx react-native start --port 8088
```

### Android Emulator Açılmıyor

**HAXM Kurulumu:**
1. SDK Manager → SDK Tools
2. Intel x86 Emulator Accelerator (HAXM installer) ✅
3. Apply → İndir ve kur

**Hyper-V Devre Dışı Bırakma (Windows 10/11):**
```powershell
# Yönetici olarak PowerShell açın
bcdedit /set hypervisorlaunchtype off
# Bilgisayarı yeniden başlatın
```

### "adb: command not found"

Path'e ekleyin:
```
C:\Users\<KullanıcıAdı>\AppData\Local\Android\Sdk\platform-tools
```

---

## Başarılı Kurulum Kontrolü

Tüm komutlar çalışmalı:

```powershell
# Java
java -version

# Android SDK
adb version

# Node & npm
node -v
npm -v

# React Native
npx react-native --version

# Docker
docker --version

# pnpm
pnpm --version
```

---

## Sonraki Adımlar

Kurulum tamamlandıktan sonra:
1. ✅ Emulator'da uygulamayı çalıştırın
2. ✅ Hot reload test edin (kod değişikliği yapın)
3. ✅ Backend servislerini başlatın
4. ✅ Database bağlantısını test edin

**Uygulama geliştirmeye hazır! 🚀**
