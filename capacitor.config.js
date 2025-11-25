const config = {
    appId: 'com.gearlink.app',
    appName: 'GearLink',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#0F172A',
            showSpinner: false
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert']
        }
    }
};

export default config;
