// Native Permissions Manager for GearLink
// Handles runtime permission requests for Android/iOS

import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export const requestCameraPermission = async () => {
    try {
        const result = await Camera.requestPermissions();
        console.log('Camera permission:', result);
        return result.camera === 'granted' || result.photos === 'granted';
    } catch (error) {
        console.error('Camera permission error:', error);
        return false;
    }
};

export const requestLocationPermission = async () => {
    try {
        const result = await Geolocation.requestPermissions();
        console.log('Location permission:', result);
        return result.location === 'granted';
    } catch (error) {
        console.error('Location permission error:', error);
        return false;
    }
};

export const checkCameraPermission = async () => {
    try {
        const result = await Camera.checkPermissions();
        return result.camera === 'granted' || result.photos === 'granted';
    } catch (error) {
        return false;
    }
};

export const checkLocationPermission = async () => {
    try {
        const result = await Geolocation.checkPermissions();
        return result.location === 'granted';
    } catch (error) {
        return false;
    }
};

// Otomatik tüm izinleri iste (ilk açılışta)
export const requestAllPermissions = async () => {
    console.log('🔐 Requesting all permissions...');

    const results = {
        camera: await requestCameraPermission(),
        location: await requestLocationPermission()
    };

    console.log('✅ Permission results:', results);
    return results;
};

export default {
    requestCameraPermission,
    requestLocationPermission,
    checkCameraPermission,
    checkLocationPermission,
    requestAllPermissions
};
