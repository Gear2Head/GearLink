// components/chat/UnreadBadge.tsx
// WhatsApp-style unread message badge (green circle with count)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';

interface UnreadBadgeProps {
    count: number;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count }) => {
    if (count === 0) return null;

    const displayCount = count > 999 ? '999+' : count.toString();

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        backgroundColor: COLORS.unread,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
