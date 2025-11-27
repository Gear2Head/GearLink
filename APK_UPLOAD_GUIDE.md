# APK'yı İndirilebilir Hale Getirme - Hızlı Rehber

## 🎯 Hedef
APK'yı GitHub'a yükleyip mobil cihazda tıklandığında direkt kurulabilir hale getirmek.

## ⚡ 5 Dakikada Tamamlama

### Adım 1: APK Dosyasını Hazırla
**Konum**: 
```
C:\Users\kadir\.gemini\antigravity\scratch\GearLink\android\app\build\outputs\apk\debug\app-debug.apk
```

Bu dosyayı masaüstüne kopyalayın (kolaylık için).

---

### Adım 2: GitHub Releases Sayfasına Git

**Şu an açık olan sekme zaten doğru!**
```
https://github.com/Gear2Head/GearLink/releases/new
```

Browser'da bu sayfa açık, devam edin! ✅

---

### Adım 3: Formu Doldurun

#### Tag version (sol üst)
1. "Choose a tag" dropdown'a tıklayın
2. `v1.0` yazın
3. "Create new tag: v1.0" seçeneğini tıklayın

#### Release title
```
GearLink v1.0 - Initial Release
```

#### Description (büyük metin alanı)
```markdown
## 🎉 GearLink v1.0 - Initial Release

### Features
- ✅ Real-time messaging
- ✅ Image & file uploads
- ✅ Voice messages
- ✅ AI chatbot (Kübra Nisa)
- ✅ Location sharing
- ✅ Polls & reactions
- ✅ Profile management

### 📥 Download
**Android APK**: Download `app-debug.apk` below

### 📋 Installation
1. Enable "Unknown sources" in Android Settings → Security
2. Download APK
3. Tap to install
4. Open app and setup Firebase

### Requirements
- Android 7.0+
- Firebase account (see [README](https://github.com/Gear2Head/GearLink#firebase-setup))

### Known Issues
None

---

**Developed with ❤️ using React + Firebase + Capacitor**
```

---

### Adım 4: APK'yı Yükle (EN ÖNEMLİ ADIM!)

1. Sayfayı **aşağı scroll** edin
2. "**Attach binaries**" bölümünü bulun (Description'ın altında)
3. İki yöntem:
   - **Yöntem A**: APK dosyasını sürükleyip kutunun içine bırakın
   - **Yöntem B**: "**choose your files**" linkine tıklayıp `app-debug.apk` seçin

4. Dosya yüklenince "**app-debug.apk**" görünecek ✅

---

### Adım 5: Publish!

1. Sayfanın **en altına** scroll edin
2. Yeşil **"Publish release"** butonuna tıklayın
3. Bekleyin (5-10 saniye)

---

## ✅ Sonuç

Release oluştuktan sonra:

### Direkt İndirme Linki
```
https://github.com/Gear2Head/GearLink/releases/download/v1.0/app-debug.apk
```

Bu linke **mobil cihazdan** tıklandığında:
1. APK direkt indirilir
2. "Install" butonu çıkar
3. Tıklayınca kurulur ✅

### Release Sayfası
```
https://github.com/Gear2Head/GearLink/releases
```

### Latest Release (otomatik en son)
```
https://github.com/Gear2Head/GearLink/releases/latest
```

---

## 📱 Mobil Cihazda Kurulum

Release oluşturduktan sonra:

1. **Android telefonda browser'ı aç**
2. Git: `https://github.com/Gear2Head/GearLink/releases/latest`
3. **"app-debug.apk"** linkine tıkla
4. İndir
5. **"Install"** tıkla
6. Uygulama kurulur! ✅

---

## 🔒 "Unknown Sources" Hatası Alırsan

Android cihazda:
1. Settings → Security → Unknown Sources → **Enable**
2. VEYA: Settings → Apps → Chrome → Install unknown apps → **Allow**

Tekrar yüklemeyi dene.

---

## ✨ Bonus: QR Code ile Paylaş

Release oluştuktan sonra:
1. https://www.qr-code-generator.com/ git
2. APK linkini yapıştır
3. QR code oluştur
4. README.md'ye ekle (screenshot olarak)

Kullanıcılar QR'ı taratıp direkt indirsin! 📲

---

**HEMEN ŞİMDİ YAPILMASI GEREKEN**: Yukarıdaki Adım 1-5'i takip et! 🚀
