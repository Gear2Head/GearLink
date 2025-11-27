// screens/ProfileScreen.tsx
// WhatsApp-style profile view screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { COLORS } from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileScreenProps {
    navigation: any;
    user: {
        name: string;
        phone?: string;
        about?: string;
        photoUrl?: string;
    };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, user }) => {
    const renderInfoRow = (icon: string, label: string, value: string, editable: boolean = false) => (
        <TouchableOpacity style={styles.infoRow} disabled={!editable}>
            <View style={styles.infoLeft}>
                <Icon name={icon} size={24} color={COLORS.textLight} style={styles.infoIcon} />
                <View>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
            {editable && <Icon name="pencil" size={20} color={COLORS.primary} />}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Photo */}
            <View style={styles.photoContainer}>
                {user.photoUrl ? (
                    <Image source={{ uri: user.photoUrl }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Icon name="account" size={100} color="#FFFFFF" />
                    </View>
                )}
                <TouchableOpacity style={styles.photoButton}>
                    <Icon name="camera" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.infoSection}>
                {renderInfoRow('account', 'Ad', user.name, true)}
                {renderInfoRow('information', 'Hakkında', user.about || 'Hey, GearLink kullanıyorum!', true)}
                {renderInfoRow('phone', 'Telefon', user.phone || '+90 555 123 4567', false)}
            </View>

            {/* Media Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medya, Linkler ve Dokümanlar</Text>
                <TouchableOpacity style={styles.mediaRow}>
                    <View style={styles.mediaPreview}>
                        <Icon name="image" size={40} color={COLORS.primary} />
                        <Icon name="video" size={40} color={COLORS.primary} />
                        <Icon name="file-document" size={40} color={COLORS.primary} />
                    </View>
                    <Icon name="chevron-right" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            {/* Starred Messages */}
            <TouchableOpacity style={styles.menuItem}>
                <Icon name="star" size={24} color={COLORS.textLight} style={styles.menuIcon} />
                <Text style={styles.menuText}>Yıldızlı Mesajlar</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>0</Text>
                </View>
            </TouchableOpacity>

            {/* Search in Conversation */}
            <TouchableOpacity style={styles.menuItem}>
                <Icon name="magnify" size={24} color={COLORS.textLight} style={styles.menuIcon} />
                <Text style={styles.menuText}>Sohbette Ara</Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="bell-off" size={24} color={COLORS.accent} />
                    <Text style={styles.actionText}>Bildirimleri Kapat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="wallpaper" size={24} color={COLORS.accent} />
                    <Text style={styles.actionText}>Duvar Kağıdı</Text>
                </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerSection}>
                <TouchableOpacity style={styles.dangerItem}>
                    <Icon name="export" size={24} color={COLORS.accent} />
                    <Text style={[styles.dangerText, { color: COLORS.accent }]}>Sohbeti Dışa Aktar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerItem}>
                    <Icon name="delete-forever" size={24} color="#FF3B30" />
                    <Text style={[styles.dangerText, { color: '#FF3B30' }]}>Sohbeti Temizle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerItem}>
                    <Icon name="block-helper" size={24} color="#FF3B30" />
                    <Text style={[styles.dangerText, { color: '#FF3B30' }]}>Engelle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerItem}>
                    <Icon name="alert-circle" size={24} color="#FF3B30" />
                    <Text style={[styles.dangerText, { color: '#FF3B30' }]}>Şikayet Et</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    photoContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: COLORS.primary,
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    photoPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoButton: {
        position: 'absolute',
        bottom: 40,
        right: '30%',
        backgroundColor: COLORS.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    infoSection: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoIcon: {
        marginRight: 20,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.text,
    },
    section: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        color: COLORS.textLight,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    mediaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    mediaPreview: {
        flexDirection: 'row',
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuIcon: {
        marginRight: 20,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    badge: {
        backgroundColor: COLORS.unread,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionsSection: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    actionText: {
        fontSize: 16,
        color: COLORS.text,
        marginLeft: 20,
    },
    dangerSection: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        marginBottom: 40,
    },
    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    dangerText: {
        fontSize: 16,
        marginLeft: 20,
    },
});
