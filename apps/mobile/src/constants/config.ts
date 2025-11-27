// constants/config.ts
// Admin configuration - only this email has admin access

export const ADMIN_EMAIL = 'senerkadiralper@gmail.com';

export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

export const SOCKET_URL = process.env.API_URL || 'http://localhost:3000';

// Texas locations for Kubra's simulated live location
export const TEXAS_LOCATIONS = [
    { latitude: 29.7604, longitude: -95.3698, name: 'Houston' },
    { latitude: 29.4241, longitude: -98.4936, name: 'San Antonio' },
    { latitude: 32.7767, longitude: -96.7970, name: 'Dallas' },
    { latitude: 30.2672, longitude: -97.7431, name: 'Austin' },
    { latitude: 31.7619, longitude: -106.4850, name: 'El Paso' },
    { latitude: 32.7555, longitude: -97.3308, name: 'Fort Worth' },
];

// Theme colors - WhatsApp style
export const COLORS = {
    primary: '#075E54',       // WhatsApp green
    primaryDark: '#054640',
    accent: '#25D366',        // WhatsApp lighter green
    senderBubble: '#DCF8C6',  // Light green sender bubble
    receiverBubble: '#FFFFFF', // White receiver bubble
    background: '#ECE5DD',    // Chat background
    inputBg: '#FFFFFF',
    border: '#D1D1D1',
    text: '#000000',
    textLight: '#667781',
    unread: '#25D366',        // Unread badge green
    timestamp: '#667781',
    checkmark: '#53BDEB',     // Blue checkmark
    online: '#25D366',
};
