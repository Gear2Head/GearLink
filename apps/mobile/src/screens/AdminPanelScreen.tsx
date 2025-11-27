// screens/AdminPanelScreen.tsx
// Admin panel - ONLY accessible to senerkadiralper@gmail.com

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { COLORS } from '../constants/config';
import { isAdmin } from '../utils/adminAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AdminPanelScreenProps {
    navigation: any;
    userEmail: string;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation, userEmail }) => {
    // Check admin access
    if (!isAdmin(userEmail)) {
        return (
            <View style={styles.unauthorized}>
                <Icon name="lock" size={64} color={COLORS.textLight} />
                <Text style={styles.unauthorizedText}>Yetkisiz Erişim</Text>
                <Text style={styles.unauthorizedSubtext}>
                    Admin paneline sadece yetkili kullanıcılar erişebilir
                </Text>
            </View>
        );
    }

    const [activeTab, setActiveTab] = useState<'database' | 'users' | 'deleted' | 'server'>('database');
    const [searchQuery, setSearchQuery] = useState('');

    // Draggable panel
    const pan = useRef(new Animated.ValueXY({ x: 50, y: 100 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: () => {
                Animated.spring(pan, {
                    toValue: { x: pan.x._value, y: pan.y._value },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    // Sample data
    const [users] = useState([
        {
            id: '1',
            name: 'Selam',
            email: 'selam@example.com',
            phone: '+90 555 111 2233',
            lastSeen: new Date(),
            location: { latitude: 41.0082, longitude: 28.9784, name: 'Istanbul' },
        },
        {
            id: '2',
            name: 'GearTest2',
            email: 'test@example.com',
            phone: '+90 555 444 5566',
            lastSeen: new Date(Date.now() - 7200000),
            location: { latitude: 39.9334, longitude: 32.8597, name: 'Ankara' },
        },
        {
            id: '3',
            name: 'Kubra',
            email: 'kubra@example.com',
            phone: '+90 555 777 8899',
            lastSeen: new Date(Date.now() - 86400000),
            location: { latitude: 29.7604, longitude: -95.3698, name: 'Houston, TX' },
        },
    ]);

    const [deletedMessages] = useState([
        {
            id: '1',
            sender: 'Selam',
            recipient: 'You',
            content: 'Bu mesaj silindi',
            deletedAt: new Date(Date.now() - 3600000),
            deletedBy: 'Selam',
        },
        {
            id: '2',
            sender: 'You',
            recipient: 'GearTest2',
            content: 'Test mesajı - silindi',
            deletedAt: new Date(Date.now() - 7200000),
            deletedBy: 'You',
        },
    ]);

    const [databaseTables] = useState([
        { name: 'users', count: 3, size: '1.2 KB' },
        { name: 'messages', count: 145, size: '45.3 KB' },
        { name: 'conversations', count: 12, size: '8.1 KB' },
        { name: 'media', count: 23, size: '2.3 MB' },
        { name: 'deleted_messages', count: 2, size: '512 B' },
    ]);

    const renderDatabaseTab = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Database Tables</Text>
            {databaseTables.map((table, index) => (
                <TouchableOpacity key={index} style={styles.dbTableItem}>
                    <View style={styles.dbTableInfo}>
                        <Icon name="table" size={24} color={COLORS.primary} />
                        <View style={styles.dbTableDetails}>
                            <Text style={styles.dbTableName}>{table.name}</Text>
                            <Text style={styles.dbTableMeta}>
                                {table.count} kayıt • {table.size}
                            </Text>
                        </View>
                    </View>
                    <Icon name="chevron-right" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderUsersTab = () => (
        <ScrollView style={styles.tabContent}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={COLORS.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Kullanıcı ara..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <Text style={styles.sectionTitle}>Registered Users ({users.length})</Text>
            {users.map((user) => (
                <View key={user.id} style={styles.userItem}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <Text style={styles.userPhone}>{user.phone}</Text>
                        <Text style={styles.userLocation}>
                            📍 {user.location.name}
                        </Text>
                        <Text style={styles.userLastSeen}>
                            Son görülme: {user.lastSeen.toLocaleString('tr-TR')}
                        </Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderDeletedTab = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Deleted Messages Archive</Text>
            {deletedMessages.map((msg) => (
                <View key={msg.id} style={styles.deletedMessageItem}>
                    <View style={styles.deletedMessageHeader}>
                        <Text style={styles.deletedMessageSender}>
                            {msg.sender} → {msg.recipient}
                        </Text>
                        <Text style={styles.deletedMessageTime}>
                            {msg.deletedAt.toLocaleString('tr-TR')}
                        </Text>
                    </View>
                    <Text style={styles.deletedMessageContent}>{msg.content}</Text>
                    <Text style={styles.deletedMessageFooter}>
                        Silindi: {msg.deletedBy}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );

    const renderServerTab = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Server Status</Text>

            <View style={styles.statusCard}>
                <View style={styles.statusItem}>
                    <Icon name="server" size={32} color={COLORS.accent} />
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>Server</Text>
                        <Text style={styles.statusValue}>Online</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.statusItem}>
                    <Icon name="database" size={32} color={COLORS.accent} />
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>Database</Text>
                        <Text style={styles.statusValue}>Connected</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.statusItem}>
                    <Icon name="access-point" size={32} color={COLORS.accent} />
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>WebSocket</Text>
                        <Text style={styles.statusValue}>Active (3 connections)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.statusItem}>
                    <Icon name="memory" size={32} color={COLORS.accent} />
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>Memory Usage</Text>
                        <Text style={styles.statusValue}>45% (512 MB / 1 GB)</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="shield-crown" size={24} color="#FFFFFF" />
                    <Text style={styles.headerTitle}>Admin Panel</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'database' && styles.activeTab]}
                    onPress={() => setActiveTab('database')}
                >
                    <Icon name="database" size={20} color={activeTab === 'database' ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.tabText, activeTab === 'database' && styles.activeTabText]}>
                        Database
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Icon name="account-multiple" size={20} color={activeTab === 'users' ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                        Users
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'deleted' && styles.activeTab]}
                    onPress={() => setActiveTab('deleted')}
                >
                    <Icon name="delete-restore" size={20} color={activeTab === 'deleted' ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.tabText, activeTab === 'deleted' && styles.activeTabText]}>
                        Deleted
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'server' && styles.activeTab]}
                    onPress={() => setActiveTab('server')}
                >
                    <Icon name="server" size={20} color={activeTab === 'server' ? COLORS.primary : COLORS.textLight} />
                    <Text style={[styles.tabText, activeTab === 'server' && styles.activeTabText]}>
                        Server
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'database' && renderDatabaseTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'deleted' && renderDeletedTab()}
            {activeTab === 'server' && renderServerTab()}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        height: SCREEN_HEIGHT * 0.7,
        maxHeight: 600,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    tabContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F8F8',
    },
    dbTableItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dbTableInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dbTableDetails: {
        marginLeft: 12,
    },
    dbTableName: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    dbTableMeta: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8F8F8',
        margin: 12,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    userItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    userPhone: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    userLocation: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 4,
    },
    userLastSeen: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
    },
    deletedMessageItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF9F9',
    },
    deletedMessageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    deletedMessageSender: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    deletedMessageTime: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    deletedMessageContent: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
    },
    deletedMessageFooter: {
        fontSize: 11,
        color: '#FF3B30',
        fontStyle: 'italic',
    },
    statusCard: {
        margin: 12,
        padding: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusInfo: {
        marginLeft: 16,
    },
    statusLabel: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 4,
    },
    unauthorized: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 40,
    },
    unauthorizedText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 16,
    },
    unauthorizedSubtext: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
});
