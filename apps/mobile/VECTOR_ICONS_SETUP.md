# Android için React Native Vector Icons Kurulumu

## 1. android/app/build.gradle Güncellemesi

`android/app/build.gradle` dosyasının sonuna şunu ekleyin:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## 2. Proje Rebuild

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 3. Icon Kullanımı

```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

<Icon name="check" size={24} color="#000" />
```

Icon isimleri: https://materialdesignicons.com/
