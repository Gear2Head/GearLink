// Push Notification Service for Mobile
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initializePushNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only work on native platforms');
        return;
    }

    try {
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive !== 'granted') {
            console.warn('Push notification permission denied');
            return;
        }

        // Register for push
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token: ' + token.value);
            // Store token in Firestore for this user
        });

        // Listen for errors
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received: ', notification);
        });

        // Listen for push notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('Push action performed: ' + JSON.stringify(action));
        });

    } catch (error) {
        console.error('Push notification initialization error:', error);
    }
};

export const sendLocalNotification = async (title, body, data = {}) => {
    if (!Capacitor.isNativePlatform()) {
        // Fallback to browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/logo.png',
                badge: '/logo.png',
                data
            });
        }
        return;
    }

    // For native, use Capacitor Local Notifications plugin
    // This requires @capacitor/local-notifications package
    console.log('Local notification:', title, body);
};

