// components/chat/ReactionPicker.tsx
// Emoji reaction picker for messages

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { COLORS } from '../../constants/config';

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  currentReactions?: string[];
}

const AVAILABLE_REACTIONS = [
  '👍', '❤️', '😂', '😮', '😢', '🙏',
  '👏', '🔥', '🎉', '💯', '✨', '⭐',
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  visible,
  onClose,
  onSelectReaction,
  currentReactions = [],
}) => {
  const handleReactionSelect = (emoji: string) => {
    onSelectReaction(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>Tepki Seç</Text>
          
          <View style={styles.reactionsGrid}>
            {AVAILABLE_REACTIONS.map((emoji) => {
              const isSelected = currentReactions.includes(emoji);
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.reactionButton,
                    isSelected && styles.selectedReaction,
                  ]}
                  onPress={() => handleReactionSelect(emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  reactionButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: '#F8F8F8',
  },
  selectedReaction: {
    backgroundColor: COLORS.senderBubble,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
