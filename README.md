# 🔗 GearLink

<div align="center">

![GearLink Logo](public/logo.png)

**Modern, WhatsApp-style messaging app with AI chatbot integration**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4-brightgreen.svg)](https://capacitorjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8-orange.svg)](https://firebase.google.com/)

</div>

---

## 📱 Features

### Core Messaging
- ✅ Real-time chat with Firebase Firestore
- ✅ Text messages with typing indicators
- ✅ Image & file uploads (10MB limit)
- ✅ Voice messages
- ✅ Location sharing
- ✅ Polls & surveys
- ✅ Message reactions
- ✅ Message editing & deletion
- ✅ Reply to messages

### AI Integration
- 🤖 **Kübra Nisa AI Bot** - Realistic conversational AI
  - Natural Turkish conversation style
  - Typing delays (5-30 seconds)
  - Emotion-aware responses
  - Context tracking

### User Features
- 👤 Profile management
- 📸 Capacitor Camera integration
- 🌍 Geolocation support
- 🔔 Push notifications
- 🔐 Firebase Authentication
- 📊 Admin panel

### UI/UX
- 🎨 WhatsApp-inspired dark theme
- 📱 Responsive design (mobile + desktop)
- ⚡ Fast & optimized
- 🌐 Turkish language support

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Mobile** | Capacitor (iOS/Android) |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **AI** | Google Gemini API |
| **Icons** | Lucide React |
| **Utilities** | date-fns, emoji-picker-react |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/GearLink.git
cd GearLink
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional
VITE_GEMINI_API_KEY=your_gemini_key
```

4. **Run development server**
```bash
npm run dev
```

---

## 📦 Build & Deploy

### Web Build
```bash
npm run build
npm run preview
```

### Android APK

**Debug APK** (for testing):
```bash
npm run build:apk
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK** (production):
```bash
# First time: Create keystore
cd android
mkdir keystore
keytool -genkey -v -keystore keystore/gearlink.keystore \
  -alias gearlink -keyalg RSA -keysize 2048 -validity 10000

# Build
npm run build:apk:release
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### iOS Build
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Build in Xcode.

---

## 📂 Project Structure

```
GearLink/
├── src/
│   ├── components/        # React components
│   │   ├── ChatScreen.jsx
│   │   ├── ChatListScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   ├── AdminPanel.jsx
│   │   └── ui/            # Reusable UI components
│   ├── lib/              # Utilities & services
│   │   ├── firebase.js
│   │   ├── errorHandler.js
│   │   ├── kubraNisaAI.js
│   │   └── locationService.js
│   ├── App.jsx           # Main application
│   └── main.jsx          # Entry point
├── android/              # Android Capacitor project
├── ios/                  # iOS Capacitor project
├── public/               # Static assets
└── README.md
```

---

## 🎨 UI Screenshots

> Add screenshots here

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage

### 2. Security Rules

**Firestore** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat-files/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🤖 AI Bot Setup

Create a Gemini API key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to `.env`:
```env
VITE_GEMINI_API_KEY=your_key_here
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run sync` | Sync Capacitor |
| `npm run build:android` | Open Android Studio |
| `npm run build:apk` | Build debug APK |
| `npm run build:apk:release` | Build release APK |

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean Android build
cd android
./gradlew clean
cd ..
```

### Capacitor Sync Issues
```bash
npx cap sync
npx cap update
```

### Firebase Errors
- Check `.env` credentials
- Verify Firebase rules
- Enable required Firebase services

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Kadir** - Initial development

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google Gemini for AI capabilities
- Capacitor for mobile deployment
- Lucide for beautiful icons
- Tailwind CSS for styling

---

## 📞 Support

For support, email support@gearlink.app or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ using React + Firebase + Capacitor**

[⭐ Star this repo](https://github.com/yourusername/GearLink) if you find it useful!

</div>
