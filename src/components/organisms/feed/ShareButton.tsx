/**
 * KONEX ShareButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Share button with share options
 * 
 * Usage:
 * <ShareButton
 *   count={sharesCount}
 *   onShare={handleShare}
 * />
 */

import React, { useState } from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';
import Modal from '../../atoms/Modal';

// ============================================
// 1. TYPES
// ============================================

export interface ShareButtonProps {
  /** Number of shares */
  count: number;
  /** On share handler */
  onShare: (target: 'squad' | 'dm' | 'external') => void;
  /** Size of the icon */
  size?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ShareButton: React.FC<ShareButtonProps> = ({
  count,
  onShare,
  size = 22,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...style,
  };

  const countStyle: TextStyle = {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 4,
    ...textStyle,
  };

  const shareOptions = [
    { id: 'squad', label: 'Share to Squad', icon: 'users' },
    { id: 'dm', label: 'Share to DM', icon: 'message-circle' },
    { id: 'external', label: 'Share External', icon: 'share-2' },
  ];

  return (
    <View>
      <TouchableOpacity
        style={buttonStyle}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
        testID={testID}
      >
        <Icon name="share-2" size={size} color={colors.textMuted} />
        {count > 0 && <Text style={countStyle}>{count}</Text>}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Share"
        contentStyle={{ maxWidth: 350 }}
      >
        {shareOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => {
              onShare(option.id as 'squad' | 'dm' | 'external');
              setIsModalVisible(false);
            }}
          >
            <Icon name={option.icon} size={22} color={colors.primary} />
            <Text style={{ fontSize: 15, color: colors.text, marginLeft: 12 }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => setIsModalVisible(false)}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </View>
  );
};

export default ShareButton;