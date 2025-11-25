# GitHub Release Oluşturma ve APK Yükleme

## 🚀 Adım Adım GitHub Release

### 1. GitHub'a Git
Repo sayfanıza gidin: [https://github.com/Gear2Head/GearLink](https://github.com/Gear2Head/GearLink)

### 2. Releases Bölümüne Git
- Sağ tarafta "Releases" linkine tıklayın
- VEYA direkt: [https://github.com/Gear2Head/GearLink/releases](https://github.com/Gear2Head/GearLink/releases)

### 3. "Create a new release" butonuna tıklayın

### 4. Release Bilgilerini Doldurun

**Tag version**: `v1.0`
- "Choose a tag" dropdown'dan "Create new tag: v1.0" seçin

**Release title**: `GearLink v1.0 - Initial Release`

**Description**:
```markdown
## 🎉 GearLink v1.0 - Initial Release

### Features
- ✅ Real-time messaging
- ✅ Image & file uploads
- ✅ Voice messages
- ✅ Location sharing
- ✅ AI chatbot (Kübra Nisa)
- ✅ Polls & reactions
- ✅ Profile management

### Download
- **Android**: Download `app-debug.apk` below
- **Installation**: Enable "Unknown sources" in Android settings

### Requirements
- Android 7.0+
- Firebase account setup required (see README)

### Known Issues
- None

### Next Release
- iOS support
- Release APK (signed)
- Bug fixes
```

### 5. APK Dosyasını Yükle

**APK Konum**: 
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Yükleme**:
1. "Attach binaries" altındaki kutuya sürükleyin
2. VEYA "choose your files" tıklayıp seçin
3. Dosya adı: `app-debug.apk` (değiştirmeyin!)

### 6. "Publish release" butonuna tıklayın

---

## ✅ Sonuç

Release oluşturduktan sonra:

**Download Linki**: 
```
https://github.com/Gear2Head/GearLink/releases/download/v1.0/app-debug.apk
```

**Latest Release**: 
```
https://github.com/Gear2Head/GearLink/releases/latest
```

Bu linkler README.md'de zaten hazır! 🎉

---

## 🔄 Güncelleme İçin

README'yi güncelleyip GitHub'a push edin:
```bash
git add README.md
git commit -m "docs: add download section to README"
git push
```
