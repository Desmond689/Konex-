/**
 * KONEX StoryCircle Component
 * Billion Dollar Code - Production Ready
 * 
 * A single story circle with ring indicator
 * 
 * Usage:
 * <StoryCircle
 *   userId="123"
 *   gamerTag="SniperKing"
 *   hasViewed={false}
 *   hasStory={true}
 *   onPress={handlePress}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface StoryCircleProps {
  /** User ID */
  userId: string;
  /** User's gamer tag */
  gamerTag: string;
  /** User's avatar URL */
  avatarUrl?: string | null;
  /** Has the user viewed this story */
  hasViewed: boolean;
  /** Does the user have a story available */
  hasStory: boolean;
  /** Is this the current user's own story */
  isOwnStory?: boolean;
  /** On press handler */
  onPress: () => void;
  /** Size of the circle */
  size?: 'sm' | 'md' | 'lg';
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. SIZE MAPPING
// ============================================

const SIZE_MAP: Record<'sm' | 'md' | 'lg', { avatarSize: number; ringWidth: number }> = {
  sm: { avatarSize: 48, ringWidth: 3 },
  md: { avatarSize: 64, ringWidth: 3 },
  lg: { avatarSize: 80, ringWidth: 4 },
};

// ============================================
// 3. COMPONENT
// ============================================

export const StoryCircle: React.FC<StoryCircleProps> = ({
  userId,
  gamerTag,
  avatarUrl,
  hasViewed,
  hasStory,
  isOwnStory = false,
  onPress,
  size = 'md',
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const sizeMap = SIZE_MAP[size];

  // Determine ring colors
  const getRingColors = () => {
    if (isOwnStory) {
      return {
        ring: colors.primary,
        innerRing: 'transparent',
        gradient: true,
      };
    }

    if (!hasStory) {
      return {
        ring: colors.border,
        innerRing: colors.border,
        gradient: false,
      };
    }

    if (hasViewed) {
      return {
        ring: colors.border,
        innerRing: colors.border,
        gradient: false,
      };
    }

    return {
      ring: colors.primary,
      innerRing: colors.primary,
      gradient: false,
    };
  };

  const ringColors = getRingColors();

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    ...style,
  };

  const ringStyle: ViewStyle = {
    width: sizeMap.avatarSize + sizeMap.ringWidth * 2,
    height: sizeMap.avatarSize + sizeMap.ringWidth * 2,
    borderRadius: (sizeMap.avatarSize + sizeMap.ringWidth * 2) / 2,
    padding: sizeMap.ringWidth,
    backgroundColor: ringColors.ring,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: hasStory || isOwnStory ? 1 : 0.5,
  };

  const innerRingStyle: ViewStyle = {
    backgroundColor: ringColors.innerRing,
    borderRadius: sizeMap.avatarSize / 2,
    overflow: 'hidden',
  };

  const nameStyle: TextStyle = {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
    maxWidth: sizeMap.avatarSize + sizeMap.ringWidth * 2,
    textAlign: 'center',
  };

  const ownStoryLabelStyle: TextStyle = {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  };

  // Don't render if no story and not own
  if (!hasStory && !isOwnStory) {
    return null;
  }

  // For own story, show a plus indicator
  const avatarContent = isOwnStory ? (
    <View style={{ position: 'relative' }}>
      <Avatar
        source={avatarUrl ? { uri: avatarUrl } : undefined}
        name={gamerTag}
        size={sizeMap.avatarSize}
        shape="circle"
      />
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          backgroundColor: colors.primary,
          borderRadius: 12,
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.surface,
        }}
      >
        <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '700' }}>+</Text>
      </View>
    </View>
  ) : (
    <Avatar
      source={avatarUrl ? { uri: avatarUrl } : undefined}
      name={gamerTag}
      size={sizeMap.avatarSize}
      shape="circle"
    />
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      disabled={!hasStory && !isOwnStory}
    >
      {isOwnStory ? (
        <View style={ringStyle}>
          <View style={innerRingStyle}>
            {avatarContent}
          </View>
        </View>
      ) : (
        <View style={ringStyle}>
          <View style={innerRingStyle}>
            {avatarContent}
          </View>
        </View>
      )}
      <Text style={nameStyle} numberOfLines={1}>
        {isOwnStory ? 'Your Story' : gamerTag}
      </Text>
      {isOwnStory && !hasStory && (
        <Text style={ownStoryLabelStyle}>Add</Text>
      )}
    </TouchableOpacity>
  );
};

export default StoryCircle;