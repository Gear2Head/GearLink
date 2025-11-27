// components/chat/EmojiPicker.tsx
// Emoji picker for message input

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import { COLORS } from '../../constants/config';

interface EmojiPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
    'Yüz İfadeleri': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
        '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    ],
    'El İşaretleri': [
        '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
        '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆',
        '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙',
        '💪', '🦾', '🙏', '✍️', '👏', '👐', '🙌', '🤲',
    ],
    'Kalp': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗',
        '💖', '💘', '💝', '💟', '♥️', '💌',
    ],
    'Nesneler': [
        '🎉', '🎊', '🎁', '🎈', '🎀', '🎂', '🍰', '🧁',
        '🔥', '💯', '⭐', '✨', '🌟', '💫', '⚡', '💥',
        '🎵', '🎶', '🎤', '🎧', '📱', '💻', '⌚', '📷',
    ],
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
    visible,
    onClose,
    onSelectEmoji,
}) => {
    const [activeCategory, setActiveCategory] = React.useState('Yüz İfadeleri');

    const handleEmojiSelect = (emoji: string) => {
        onSelectEmoji(emoji);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.container}>
                    {/* Category tabs */}
                    <View style={styles.categories}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Object.keys(EMOJI_CATEGORIES).map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryTab,
                                        activeCategory === category && styles.activeCategoryTab,
                                    ]}
                                    onPress={() => setActiveCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            activeCategory === category && styles.activeCategoryText,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Emoji grid */}
                    <ScrollView style={styles.emojiScroll}>
                        <View style={styles.emojiGrid}>
                            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map(
                                (emoji, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.emojiButton}
                                        onPress={() => handleEmojiSelect(emoji)}
                                    >
                                        <Text style={styles.emoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </ScrollView>

                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
        paddingBottom: 20,
    },
    categories: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    activeCategoryTab: {
        backgroundColor: COLORS.primary,
    },
    categoryText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    activeCategoryText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    emojiScroll: {
        flex: 1,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    emojiButton: {
        width: '12.5%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 28,
    },
    closeButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    closeText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
