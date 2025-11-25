// Location Service using Capacitor Native Geolocation
import { Geolocation } from '@capacitor/geolocation';

export const getCurrentPosition = async () => {
    try {
        const coordinates = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });

        console.log('📍 Location:', coordinates);

        return {
            latitude: coordinates.coords.latitude,
            longitude: coordinates.coords.longitude,
            accuracy: coordinates.coords.accuracy,
            timestamp: coordinates.timestamp
        };
    } catch (error) {
        console.error('Geolocation error:', error);
        throw new Error('Konum alınamadı. Lütfen GPS izni verin.');
    }
};

export const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const getGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const getStaticMapUrl = (lat, lng, apiKey = '') => {
    if (!apiKey) {
        // Placeholder if no API key
        return `https://via.placeholder.com/400x200.png?text=Map+${lat.toFixed(2)},${lng.toFixed(2)}`;
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
};

export default {
    getCurrentPosition,
    formatCoordinates,
    getGoogleMapsUrl,
    getStaticMapUrl
};
