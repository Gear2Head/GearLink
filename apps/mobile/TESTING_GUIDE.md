# GearLink - Android Studio'da Test Etme Rehberi

## Uygulama Çalıştırma

### 1. Android Studio'da Projeyi Açma
1. Android Studio'yu açın
2. **Open** → `C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile\android`
3. Gradle sync tamamlanmasını bekleyin

### 2. Emulator Başlatma
- Android Studio → **Device Manager** → Emulator'ınızı başlatın
- Veya zaten çalışan bir cihaz varsa onu kullanın

### 3. Metro Bundler Başlatma
```powershell
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native start
```

### 4. Uygulamayı Çalıştırma

**Seçenek 1: React Native CLI**
```powershell
# Yeni bir terminal'de
cd C:\Users\kadir\.gemini\antigravity\scratch\GearLink\apps\mobile
npx react-native run-android
```

**Seçenek 2: Android Studio**
- Üst menüde yeşil **Run** ▶️ butonuna tıklayın

## Yeni Özellikler

### ✅ WhatsApp Tarzı UI
- **Chat Bubbles**: Mesaj baloncukları göndericiye göre renkleniyor (yeşil/beyaz)
- **Checkmarks**: Okundu işareti (çift mavi tik)
- **Reactions**: Mesajlara tepki ekleme/çıkarma
- **Unread Badge**: Okunmamış mesaj sayısı (yeşil yuvarlak)

### ✅ Mesaj Özellikleri
- **Long Press**: Mesajı uzun basarak seçme
- **Multi-Select**: Birden fazla mesaj seçme
- **Bulk Delete**: Toplu silme
- **Bulk Forward**: Toplu iletme

### ✅ Ayarlar
- **Hidden Admin**: Versiyon numarasına 5 kez tıklayarak admin panel açma (sadece senerkadiralper@gmail.com)
- **Tema Ayarları**: Açık/koyu tema seçenekleri
- **Bildirim Ayarları**: Bildirim kontrolü
- **Erişilebilirlik**: Kontrast ve animasyon ayarları

### ✅ Profil
- Profil fotoğrafı ve bilgileri
- Medya galerisi
- Yıldızlı mesajlar
- Sohbette ara

## Sorun Giderme

### Metro Bundler port zaten kullanımda
```powershell
npx react-native start --port 8088
```

### Android build hatası
```powershell
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Icon görünmüyor
- `android/app/build.gradle` dosyasında vector icons satırının eklendiğinden emin olun
- Uygulamayı temizleyip yeniden build edin

## Sonraki Adımlar
- Admin Panel UI
- Hesap değiştirme (Switch Account)
- Kubra AI geliştirmeleri
- Texas konum simülasyonu
- Video/sesli arama
