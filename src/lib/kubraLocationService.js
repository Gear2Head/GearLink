// Kübra Nisa Location Service - Texas Random Locations
import { getFirebaseDb } from './firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Texas şehirleri ve koordinatları
const TEXAS_LOCATIONS = [
    { city: 'Houston', lat: 29.7604, lng: -95.3698 },
    { city: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { city: 'Austin', lat: 30.2672, lng: -97.7431 },
    { city: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { city: 'Fort Worth', lat: 32.7555, lng: -97.3308 },
    { city: 'El Paso', lat: 31.7619, lng: -106.4850 },
    { city: 'Arlington', lat: 32.7357, lng: -97.1081 },
    { city: 'Corpus Christi', lat: 27.8006, lng: -97.3964 },
    { city: 'Plano', lat: 33.0198, lng: -96.6989 },
    { city: 'Laredo', lat: 27.5306, lng: -99.4803 },
    { city: 'Lubbock', lat: 33.5779, lng: -101.8552 },
    { city: 'Garland', lat: 32.9126, lng: -96.6389 },
    { city: 'Irving', lat: 32.8140, lng: -96.9489 },
    { city: 'Amarillo', lat: 35.2220, lng: -101.8313 },
    { city: 'Grand Prairie', lat: 32.7459, lng: -97.0080 }
];

// Random offset ekle (şehir içinde hareket)
const addRandomOffset = (baseLat, baseLng) => {
    const offset = 0.05; // ~5km
    return {
        lat: baseLat + (Math.random() - 0.5) * offset,
        lng: baseLng + (Math.random() - 0.5) * offset
    };
};

export const updateKubraLocation = async () => {
    try {
        const db = getFirebaseDb();
        const botUserId = 'kubra_nisa_ai_bot';
        
        // Random Texas şehri seç
        const randomLocation = TEXAS_LOCATIONS[Math.floor(Math.random() * TEXAS_LOCATIONS.length)];
        const { lat, lng } = addRandomOffset(randomLocation.lat, randomLocation.lng);
        
        // Google Maps URL
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        
        // Firestore'da güncelle
        await updateDoc(doc(db, 'users', botUserId), {
            lastLocation: {
                latitude: lat,
                longitude: lng,
                city: randomLocation.city,
                mapsUrl: mapsUrl,
                updatedAt: serverTimestamp()
            },
            lastSeen: serverTimestamp(),
            isOnline: true
        }, { merge: true });
        
        console.log(`📍 Kübra konumu güncellendi: ${randomLocation.city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        
        return { lat, lng, city: randomLocation.city, mapsUrl };
    } catch (error) {
        console.error('Kübra konum güncelleme hatası:', error);
    }
};

// Her saat başı konum güncelle
export const startKubraLocationUpdates = () => {
    // İlk güncelleme
    updateKubraLocation();
    
    // Her saat başı güncelle (60 dakika = 3600000 ms)
    const interval = setInterval(() => {
        updateKubraLocation();
    }, 3600000);
    
    return () => clearInterval(interval);
};

