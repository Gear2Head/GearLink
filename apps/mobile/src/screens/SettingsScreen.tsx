// screens/SettingsScreen.tsx
// Settings screen with hidden admin panel access (tap version 5 times)

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { COLORS } from '../constants/config';
import { isAdmin } from '../utils/adminAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SettingsScreenProps {
    navigation: any;
    userEmail: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, userEmail }) => {
    const [versionTapCount, setVersionTapCount] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    const handleVersionTap = () => {
        const newCount = versionTapCount + 1;
        setVersionTapCount(newCount);

        if (newCount === 5 && isAdmin(userEmail)) {
            // Open admin panel after 5 taps (admin only)
            setVersionTapCount(0);
            navigation.navigate('AdminPanel');
        } else if (newCount >= 5) {
            // Reset if not admin
            setVersionTapCount(0);
        }
    };

    const renderSettingItem = (
        icon: string,
        title: string,
        subtitle?: string,
        onPress?: () => void,
        rightComponent?: React.ReactNode
    ) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress && !rightComponent}
        >
            <Icon name={icon} size={24} color={COLORS.primary} style={styles.icon} />
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightComponent || <Icon name="chevron-right" size={24} color={COLORS.textLight} />}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <TouchableOpacity
                style={styles.profileSection}
                onPress={() => navigation.navigate('Profile')}
            >
                <Icon name="account-circle" size={64} color={COLORS.primary} />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Kullanıcı Adı</Text>
                    <Text style={styles.profileEmail}>{userEmail}</Text>
                </View>
                <Icon name="qrcode" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Account Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hesap</Text>
                {renderSettingItem('key', 'Hesap', 'Gizlilik, güvenlik, hesabı değiştir', () =>
                    navigation.navigate('AccountSettings')
                )}
                {renderSettingItem('account-multiple', 'Hesap Değiştir', 'Çift hesap kullanımı', () =>
                    navigation.navigate('SwitchAccount')
                )}
            </View>

            {/* Chat Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sohbet Ayarları</Text>
                {renderSettingItem('palette', 'Tema', 'Açık, koyu, özel temalar', () =>
                    navigation.navigate('ThemeSettings')
                )}
                {renderSettingItem('wallpaper', 'Sohbet Arkaplanı', 'Duvar kağıdını değiştir', () =>
                    navigation.navigate('WallpaperSettings')
                )}
                {renderSettingItem('format-color-fill', 'Balon Rengi', 'Mesaj balonu renkleri', () =>
                    navigation.navigate('BubbleColorSettings')
                )}
            </View>

            {/* Notifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bildirimler</Text>
                {renderSettingItem(
                    'bell',
                    'Bildirimler',
                    notificationsEnabled ? 'Açık' : 'Kapalı',
                    undefined,
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#D1D1D1', true: COLORS.accent }}
                    />
                )}
                {renderSettingItem('volume-high', 'Bildirim Sesleri', 'Özel sesler', () =>
                    navigation.navigate('NotificationSounds')
                )}
            </View>

            {/* Storage & Data */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Depolama ve Veri</Text>
                {renderSettingItem('harddisk', 'Depolama Kullanımı', 'Önbellek yönetimi', () =>
                    navigation.navigate('StorageSettings')
                )}
                {renderSettingItem('download', 'Otomatik İndirme', 'Medya indirme ayarları', () =>
                    navigation.navigate('AutoDownloadSettings')
                )}
            </View>

            {/* Accessibility */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Erişilebilirlik</Text>
                {renderSettingItem('contrast', 'Kontrast', 'Yüksek kontrast modu', () =>
                    navigation.navigate('ContrastSettings')
                )}
                {renderSettingItem(
                    'animation',
                    'Animasyonlar',
                    animationsEnabled ? 'Açık' : 'Kapalı',
                    undefined,
                    <Switch
                        value={animationsEnabled}
                        onValueChange={setAnimationsEnabled}
                        trackColor={{ false: '#D1D1D1', true: COLORS.accent }}
                    />
                )}
                {renderSettingItem('format-size', 'Yazı Boyutu', 'Küçük, Orta, Büyük', () =>
                    navigation.navigate('TextSizeSettings')
                )}
            </View>

            {/* Help & About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yardım</Text>
                {renderSettingItem('help-circle', 'Yardım', 'Sık sorulan sorular')}
                {renderSettingItem('email', 'Bize Ulaşın', 'Destek ekibiyle iletişim')}
            </View>

            {/* Version - Hidden admin access */}
            <TouchableOpacity onPress={handleVersionTap} style={styles.versionContainer}>
                <Text style={styles.versionText}>GearLink v1.0.0</Text>
                {versionTapCount > 0 && isAdmin(userEmail) && (
                    <Text style={styles.tapCountText}>
                        {5 - versionTapCount} kez daha dokunun
                    </Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>from</Text>
                <Text style={styles.footerBrand}>GearLink Team</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 8,
        borderBottomColor: '#F0F0F0',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 4,
    },
    section: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 8,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    icon: {
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: COLORS.text,
    },
    settingSubtitle: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    versionText: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    tapCountText: {
        fontSize: 11,
        color: COLORS.primary,
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    footerBrand: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 4,
    },
});
