// screens/ChatScreen.tsx
// Updated with WhatsApp-style UI components, Reactions, and Emoji Picker

import React, { useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Text,
} from 'react-native';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { ReactionPicker } from '../components/chat/ReactionPicker';
import { EmojiPicker } from '../components/chat/EmojiPicker';
import { COLORS } from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
    id: string;
    text: string;
    timestamp: string;
    senderId: string;
    isRead?: boolean;
    reactions?: Array<{ emoji: string; userId: string }>;
}

export default function ChatScreen({ route, navigation }: any) {
    const { conversationId, contactName } = route.params;
    const currentUserId = 'me'; // This would come from auth state

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Merhaba! Nasılsın?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            senderId: 'other',
            isRead: true,
        },
        {
            id: '2',
            text: 'İyiyim, sen nasılsın? 😊',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            senderId: currentUserId,
            isRead: true,
        },
        {
            id: '3',
            text: 'Ben de iyiyim, teşekkürler!',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            senderId: 'other',
            reactions: [{ emoji: '👍', userId: currentUserId }],
        },
    ]);

    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
    const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

    const handleSendMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            timestamp: new Date().toISOString(),
            senderId: currentUserId,
            isRead: false,
        };

        setMessages([newMessage, ...messages]);
    };

    const handleLongPress = (messageId: string) => {
        setSelectionMode(true);
        toggleMessageSelection(messageId);
    };

    const toggleMessageSelection = (messageId: string) => {
        const newSelection = new Set(selectedMessages);
        if (newSelection.has(messageId)) {
            newSelection.delete(messageId);
        } else {
            newSelection.add(messageId);
        }
        setSelectedMessages(newSelection);

        // Exit selection mode if no messages selected
        if (newSelection.size === 0) {
            setSelectionMode(false);
        }
    };

    const handleDeleteSelected = () => {
        const remainingMessages = messages.filter(m => !selectedMessages.has(m.id));
        setMessages(remainingMessages);
        setSelectedMessages(new Set());
        setSelectionMode(false);
    };

    const handleForwardSelected = () => {
        // TODO: Implement forward functionality
        console.log('Forward selected:', Array.from(selectedMessages));
    };

    const handleReactionPress = (messageId: string) => {
        setSelectedMessageForReaction(messageId);
        setReactionPickerVisible(true);
    };

    const handleSelectReaction = (emoji: string) => {
        if (!selectedMessageForReaction) return;

        setMessages(messages.map(msg => {
            if (msg.id === selectedMessageForReaction) {
                const reactions = msg.reactions || [];
                const existingReactionIndex = reactions.findIndex(
                    r => r.emoji === emoji && r.userId === currentUserId
                );

                let newReactions;
                if (existingReactionIndex >= 0) {
                    // Remove reaction
                    newReactions = reactions.filter((_, i) => i !== existingReactionIndex);
                } else {
                    // Add reaction
                    newReactions = [...reactions, { emoji, userId: currentUserId }];
                }

                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));
    };

    const handleAttachPress = () => {
        // TODO: Show attachment options (camera, gallery, document, etc.)
        console.log('Show attachment options');
    };

    const handleVoicePress = () => {
        // TODO: Start voice recording
        console.log('Start voice recording');
    };

    const handleEmojiPress = () => {
        setEmojiPickerVisible(true);
    };

    const handleEmojiSelect = (emoji: string) => {
        // This needs to be passed to ChatInput, but for now we'll just log it
        // In a real app, ChatInput would expose a ref or method to append text
        console.log('Emoji selected:', emoji);
        // Ideally, we would update the input text state here if it was lifted up
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: contactName || 'Chat',
            headerRight: () => (
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => navigation.navigate('Call', { contactName, isVideoCall: true })}>
                        <Icon name="video" size={24} color="#FFFFFF" style={styles.headerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Call', { contactName, isVideoCall: false })}>
                        <Icon name="phone" size={24} color="#FFFFFF" style={styles.headerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Icon name="dots-vertical" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, contactName]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            {/* WhatsApp background pattern */}
            <View style={styles.chatBackground} />

            {/* Selection toolbar */}
            {selectionMode && (
                <View style={styles.selectionToolbar}>
                    <TouchableOpacity onPress={() => {
                        setSelectionMode(false);
                        setSelectedMessages(new Set());
                    }}>
                        <Icon name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.selectionCount}>{selectedMessages.size} seçildi</Text>
                    <View style={styles.selectionActions}>
                        <TouchableOpacity onPress={handleDeleteSelected} style={styles.toolbarButton}>
                            <Icon name="delete" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleForwardSelected} style={styles.toolbarButton}>
                            <Icon name="share" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                data={messages}
                inverted
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MessageBubble
                        message={item}
                        isOwnMessage={item.senderId === currentUserId}
                        onLongPress={() => handleLongPress(item.id)}
                        onReactionPress={() => handleReactionPress(item.id)}
                        isSelected={selectedMessages.has(item.id)}
                    />
                )}
                contentContainerStyle={styles.messagesList}
            />

            <ChatInput
                onSendMessage={handleSendMessage}
                onAttachPress={handleAttachPress}
                onVoicePress={handleVoicePress}
                onEmojiPress={handleEmojiPress}
            />

            {/* Reaction Picker */}
            <ReactionPicker
                visible={reactionPickerVisible}
                onClose={() => setReactionPickerVisible(false)}
                onSelectReaction={handleSelectReaction}
                currentReactions={messages.find(m => m.id === selectedMessageForReaction)?.reactions?.map(r => r.emoji)}
            />

            {/* Emoji Picker */}
            <EmojiPicker
                visible={emojiPickerVisible}
                onClose={() => setEmojiPickerVisible(false)}
                onSelectEmoji={handleEmojiSelect}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    chatBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background,
        opacity: 0.6,
    },
    messagesList: {
        paddingVertical: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    headerIcon: {
        marginHorizontal: 12,
    },
    selectionToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    selectionCount: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    selectionActions: {
        flexDirection: 'row',
    },
    toolbarButton: {
        marginLeft: 20,
    },
});
