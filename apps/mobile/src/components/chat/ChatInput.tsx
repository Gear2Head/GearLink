// components/chat/ChatInput.tsx
// WhatsApp-style message input with attach and emoji buttons

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onAttachPress: () => void;
    onVoicePress: () => void;
    onEmojiPress: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onAttachPress,
    onVoicePress,
    onEmojiPress,
}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            {/* Left actions - Emoji and Attach */}
            <View style={styles.leftActions}>
                <TouchableOpacity onPress={onEmojiPress} style={styles.iconButton}>
                    <Icon name="emoticon-happy-outline" size={26} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            {/* Input field */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Mesaj"
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    maxLength={1000}
                />

                <TouchableOpacity onPress={onAttachPress} style={styles.attachButton}>
                    <Icon name="paperclip" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            {/* Send or Voice button */}
            <TouchableOpacity
                onPress={message.trim() ? handleSend : onVoicePress}
                style={[styles.actionButton, message.trim() && styles.sendButton]}
            >
                <Icon
                    name={message.trim() ? 'send' : 'microphone'}
                    size={24}
                    color="#FFFFFF"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: COLORS.inputBg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        color: COLORS.text,
    },
    attachButton: {
        padding: 8,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: COLORS.primary,
    },
});
