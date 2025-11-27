// screens/SwitchAccountScreen.tsx
// Multi-account support - switch between multiple logged-in accounts

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { COLORS } from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Account {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoUrl?: string;
    isActive: boolean;
}

interface SwitchAccountScreenProps {
    navigation: any;
}

export const SwitchAccountScreen: React.FC<SwitchAccountScreenProps> = ({ navigation }) => {
    const [accounts, setAccounts] = useState<Account[]>([
        {
            id: '1',
            name: 'Ana Hesap',
            email: 'senerkadiralper@gmail.com',
            phone: '+90 555 123 4567',
            isActive: true,
        },
        {
            id: '2',
            name: 'İş Hesabı',
            email: 'is@example.com',
            phone: '+90 555 987 6543',
            isActive: false,
        },
    ]);

    const handleSwitchAccount = (accountId: string) => {
        Alert.alert(
            'Hesap Değiştir',
            'Bu hesaba geçmek istediğinizden emin misiniz?',
            [
                {
                    text: 'İptal',
                    style: 'cancel',
                },
                {
                    text: 'Değiştir',
                    onPress: () => {
                        const updatedAccounts = accounts.map((acc) => ({
                            ...acc,
                            isActive: acc.id === accountId,
                        }));
                        setAccounts(updatedAccounts);

                        // TODO: Actually switch account in Redux/AsyncStorage
                        Alert.alert('Başarılı', 'Hesap değiştirildi');
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleAddAccount = () => {
        navigation.navigate('Login', { isAddingAccount: true });
    };

    const handleRemoveAccount = (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);

        if (account?.isActive) {
            Alert.alert('Hata', 'Aktif hesabı silemezsiniz');
            return;
        }

        Alert.alert(
            'Hesabı Kaldır',
            `${account?.name} hesabını kaldırmak istediğinizden emin misiniz?`,
            [
                {
                    text: 'İptal',
                    style: 'cancel',
                },
                {
                    text: 'Kaldır',
                    style: 'destructive',
                    onPress: () => {
                        setAccounts(accounts.filter((acc) => acc.id !== accountId));
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        Birden fazla hesap arasında kolayca geçiş yapın
                    </Text>
                </View>

                {/* Active account */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aktif Hesap</Text>
                    {accounts
                        .filter((acc) => acc.isActive)
                        .map((account) => (
                            <View key={account.id} style={[styles.accountItem, styles.activeAccountItem]}>
                                <View style={styles.accountAvatar}>
                                    <Text style={styles.avatarText}>
                                        {account.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.accountInfo}>
                                    <Text style={styles.accountName}>{account.name}</Text>
                                    <Text style={styles.accountEmail}>{account.email}</Text>
                                    <Text style={styles.accountPhone}>{account.phone}</Text>
                                </View>
                                <Icon name="check-circle" size={24} color={COLORS.accent} />
                            </View>
                        ))}
                </View>

                {/* Other accounts */}
                {accounts.filter((acc) => !acc.isActive).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Diğer Hesaplar</Text>
                        {accounts
                            .filter((acc) => !acc.isActive)
                            .map((account) => (
                                <TouchableOpacity
                                    key={account.id}
                                    style={styles.accountItem}
                                    onPress={() => handleSwitchAccount(account.id)}
                                >
                                    <View style={styles.accountAvatar}>
                                        <Text style={styles.avatarText}>
                                            {account.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={styles.accountName}>{account.name}</Text>
                                        <Text style={styles.accountEmail}>{account.email}</Text>
                                        <Text style={styles.accountPhone}>{account.phone}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveAccount(account.id)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Icon name="close-circle" size={24} color={COLORS.textLight} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                    </View>
                )}

                {/* Add account button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                    <Icon name="plus-circle" size={24} color={COLORS.primary} />
                    <Text style={styles.addButtonText}>Hesap Ekle</Text>
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Icon name="information-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                        En fazla 5 hesap ekleyebilirsiniz. Hesaplar arasında geçiş yapmak
                        için üstüne dokunun.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 20,
        backgroundColor: '#F8F8F8',
    },
    headerText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    activeAccountItem: {
        backgroundColor: '#F0FFF0',
    },
    accountAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    accountInfo: {
        flex: 1,
        marginLeft: 16,
    },
    accountName: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    accountEmail: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2,
    },
    accountPhone: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 12,
        borderStyle: 'dashed',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 8,
    },
    infoCard: {
        flexDirection: 'row',
        margin: 20,
        padding: 16,
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text,
        marginLeft: 12,
        lineHeight: 20,
    },
});
