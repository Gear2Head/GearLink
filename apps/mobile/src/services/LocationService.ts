// services/LocationService.ts
// Texas location simulation for Kubra's "live location"

import { TEXAS_LOCATIONS } from '../constants/config';

interface Location {
    latitude: number;
    longitude: number;
    name: string;
    timestamp: Date;
}

class LocationService {
    private currentLocationIndex: number = 0;
    private updateInterval: NodeJS.Timeout | null = null;
    private currentLocation: Location | null = null;

    constructor() {
        this.initializeLocation();
    }

    // Initialize with random Texas location
    private initializeLocation() {
        const randomIndex = Math.floor(Math.random() * TEXAS_LOCATIONS.length);
        this.currentLocationIndex = randomIndex;
        this.updateCurrentLocation();
    }

    // Update to a new random Texas location
    private updateCurrentLocation() {
        const baseLocation = TEXAS_LOCATIONS[this.currentLocationIndex];

        // Add small random offset to simulate movement within the city
        const latOffset = (Math.random() - 0.5) * 0.01; // ~1 km range
        const lonOffset = (Math.random() - 0.5) * 0.01;

        this.currentLocation = {
            latitude: baseLocation.latitude + latOffset,
            longitude: baseLocation.longitude + lonOffset,
            name: baseLocation.name,
            timestamp: new Date(),
        };
    }

    // Start hourly location updates
    startLocationUpdates() {
        // Update every hour
        this.updateInterval = setInterval(() => {
            // Move to next city or stay in same city
            if (Math.random() > 0.7) {
                // 30% chance to move to different Texas city
                this.currentLocationIndex =
                    (this.currentLocationIndex + 1) % TEXAS_LOCATIONS.length;
            }
            this.updateCurrentLocation();
            console.log('Kubra location updated:', this.currentLocation);
        }, 3600000); // 1 hour = 3600000 ms
    }

    // Stop location updates
    stopLocationUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Get current "live" location
    getCurrentLocation(): Location | null {
        return this.currentLocation;
    }

    // Get location history (simulated)
    getLocationHistory(): Location[] {
        // Generate fake history for the past 24 hours
        const history: Location[] = [];
        const now = Date.now();

        for (let i = 0; i < 24; i++) {
            const cityIndex = Math.floor(Math.random() * TEXAS_LOCATIONS.length);
            const city = TEXAS_LOCATIONS[cityIndex];

            history.push({
                latitude: city.latitude + (Math.random() - 0.5) * 0.01,
                longitude: city.longitude + (Math.random() - 0.5) * 0.01,
                name: city.name,
                timestamp: new Date(now - i * 3600000), // Each hour back
            });
        }

        return history.reverse(); // Oldest first
    }

    // Format location for display
    formatLocation(): string {
        if (!this.currentLocation) return 'Konum bilinmiyor';

        const { name, timestamp } = this.currentLocation;
        const timeDiff = Date.now() - timestamp.getTime();
        const minutesAgo = Math.floor(timeDiff / 60000);

        if (minutesAgo < 5) {
            return `📍 Canlı Konum: ${name}, Texas`;
        } else if (minutesAgo < 60) {
            return `📍 ${minutesAgo} dakika önce: ${name}, Texas`;
        } else {
            const hoursAgo = Math.floor(minutesAgo / 60);
            return `📍 ${hoursAgo} saat önce: ${name}, Texas`;
        }
    }

    // Get Google Maps link
    getGoogleMapsLink(): string {
        if (!this.currentLocation) return '';

        const { latitude, longitude } = this.currentLocation;
        return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
}

export default new LocationService();
