// screens/ChatListScreen.tsx
// Updated with WhatsApp-style UI

import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UnreadBadge } from '../components/chat/UnreadBadge';
import { COLORS } from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Chat {
    id: string;
    name: string;
    lastMessage?: { content: string; timestamp: string };
    unreadCount: number;
    photoUrl?: string;
    isPinned?: boolean;
    isOnline?: boolean;
}

export default function ChatListScreen({ navigation }: any) {
    const conversations = useSelector((state: RootState) => state.chat.conversations);

    // Sample data with WhatsApp-like structure
    const [chats] = useState<Chat[]>([
        {
            id: '1',
            name: 'Selam',
            lastMessage: {
                content: 'Merhaba! Nasılsın?',
                timestamp: new Date(Date.now() - 300000).toISOString(),
            },
            unreadCount: 3,
            isOnline: true,
        },
        {
            id: '2',
            name: 'GearTest2',
            lastMessage: {
                content: 'Test mesajı',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            unreadCount: 0,
        },
        {
            id: '3',
            name: 'Kubra',
            lastMessage: {
                content: 'Son görülme: 1 gün',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            unreadCount: 0,
        },
    ]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} dk`;
        if (diffHours < 24) return `${diffHours} saat`;
        if (diffDays < 7) return `${diffDays} gün`;
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', {
                conversationId: item.id,
                contactName: item.name,
            })}
        >
            {/* Profile Photo */}
            <View style={styles.avatarContainer}>
                {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                {item.isOnline && <View style={styles.onlineDot} />}
            </View>

            {/* Chat Info */}
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    {item.lastMessage && (
                        <Text style={styles.timestamp}>
                            {formatTime(item.lastMessage.timestamp)}
                        </Text>
                    )}
                </View>

                <View style={styles.chatFooter}>
                    <Text
                        style={[
                            styles.lastMessage,
                            item.unreadCount > 0 && styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                    >
                        {item.lastMessage?.content || 'Mesaj yok'}
                    </Text>

                    {/* Unread badge */}
                    {item.unreadCount > 0 && <UnreadBadge count={item.unreadCount} />}

                    {/* Pinned icon */}
                    {item.isPinned && (
                        <Icon name="pin" size={16} color={COLORS.textLight} style={styles.pinIcon} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="message-text-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Henüz sohbet yok</Text>
                        <Text style={styles.emptySubtext}>
                            Bir sohbet seçin ve konuşmaya başlayın
                        </Text>
                    </View>
                }
            />

            {/* Floating action button - New chat */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => console.log('New chat')}
            >
                <Icon name="message-plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
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
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.online,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    timestamp: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    chatFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textLight,
    },
    unreadMessage: {
        color: COLORS.text,
        fontWeight: '500',
    },
    pinIcon: {
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
