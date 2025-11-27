// components/chat/MessageBubble.tsx
// WhatsApp-identical message bubble component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/config';

interface MessageBubbleProps {
    message: {
        id: string;
        text: string;
        timestamp: string;
        senderId: string;
        isRead?: boolean;
        reactions?: Array<{ emoji: string; userId: string }>;
    };
    isOwnMessage: boolean;
    onLongPress?: () => void;
    onReactionPress?: () => void;
    isSelected?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
    onLongPress,
    onReactionPress,
    isSelected = false,
}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <TouchableOpacity
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={[
                styles.container,
                isOwnMessage ? styles.ownMessage : styles.otherMessage,
                isSelected && styles.selected,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                ]}
            >
                <Text style={styles.messageText}>{message.text}</Text>

                <View style={styles.metaContainer}>
                    <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>

                    {isOwnMessage && (
                        <View style={styles.checkmarks}>
                            {message.isRead ? (
                                // Double checkmark (read)
                                <Text style={[styles.checkmark, styles.readCheckmark]}>✓✓</Text>
                            ) : (
                                // Single checkmark (delivered)
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <TouchableOpacity
                        style={styles.reactionsContainer}
                        onPress={onReactionPress}
                    >
                        {message.reactions.slice(0, 3).map((reaction, index) => (
                            <Text key={index} style={styles.reactionEmoji}>
                                {reaction.emoji}
                            </Text>
                        ))}
                        {message.reactions.length > 3 && (
                            <Text style={styles.reactionCount}>+{message.reactions.length - 3}</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Message tail - WhatsApp style */}
            <View
                style={[
                    styles.tail,
                    isOwnMessage ? styles.ownTail : styles.otherTail,
                ]}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 2,
        marginHorizontal: 8,
        maxWidth: '75%',
    },
    ownMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    selected: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 10,
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    ownBubble: {
        backgroundColor: COLORS.senderBubble,
        borderTopRightRadius: 0,
    },
    otherBubble: {
        backgroundColor: COLORS.receiverBubble,
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 11,
        color: COLORS.timestamp,
        marginLeft: 4,
    },
    checkmarks: {
        marginLeft: 4,
    },
    checkmark: {
        fontSize: 12,
        color: COLORS.timestamp,
        fontWeight: 'bold',
    },
    readCheckmark: {
        color: COLORS.checkmark, // Blue when read
    },
    reactionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    reactionEmoji: {
        fontSize: 14,
        marginHorizontal: 2,
    },
    reactionCount: {
        fontSize: 11,
        color: COLORS.textLight,
        marginLeft: 2,
    },
    tail: {
        position: 'absolute',
        top: 0,
        width: 0,
        height: 0,
        borderStyle: 'solid',
    },
    ownTail: {
        right: -8,
        borderWidth: 8,
        borderColor: `transparent transparent transparent ${COLORS.senderBubble}`,
    },
    otherTail: {
        left: -8,
        borderWidth: 8,
        borderColor: `transparent ${COLORS.receiverBubble} transparent transparent`,
    },
});
