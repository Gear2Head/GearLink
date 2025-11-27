# Android Studio'da Yeni Değişiklikleri Görmek İçin

## Yöntem 1: Metro Cache'i Temizle ve Yeniden Başlat (ÖNERİLEN)

```powershell
# Terminal 1 - Metro bundler'ı temizle ve başlat
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile

# Cache'i temizle
npx react-native start --reset-cache

# Veya
rm -rf node_modules/.cache
npx react-native start
```

```powershell
# Terminal 2 - Uygulamayı yeniden çalıştır
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native run-android
```

## Yöntem 2: Android Build'i Tamamen Temizle

```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile\android

# Gradle build'i temizle
.\gradlew clean

# Geri dön
cd ..

# Uygulamayı çalıştır
npx react-native run-android
```

## Yöntem 3: Her Şeyi Sıfırdan (En Garantili)

```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile

# 1. Node modules cache temizle
rm -rf node_modules/.cache

# 2. Android build temizle  
cd android
.\gradlew clean
cd ..

# 3. Metro ile başlat
npx react-native start --reset-cache
```

Başka bir terminalde:
```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native run-android
```

## Android Studio'dan Çalıştırıyorsanız

1. **Metro Bundler'ı Manuel Başlatın:**
   ```powershell
   cd apps/mobile
   npx react-native start --reset-cache
   ```

2. **Android Studio'da:**
   - Build → Clean Project
   - Build → Rebuild Project
   - Yeşil ▶️ Run butonuna tıklayın

## Hot Reload Çalışmıyorsa

Emulator'da:
- **R** tuşuna 2 kez basın (Reload)
- Veya **Ctrl + M** → **Reload**

## Sorun Devam Ederse

```powershell
# Tamamen sıfırla
cd apps/mobile
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
pnpm install
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

---

**NOT:** Capacitor (`npx cap sync`) değil, **React Native** kullanıyoruz. 
Expo'dan native'e geçtik, artık `npx react-native` komutlarını kullanıyoruz!
