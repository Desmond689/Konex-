/**
 * KONEX ProfileStats Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays user statistics with icons and counts
 * 
 * Usage:
 * <ProfileStats
 *   stats={stats}
 *   onStatPress={handleStatPress}
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
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface UserStats {
  posts: number;
  likes: number;
  comments: number;
  badges: number;
  squads: number;
}

export interface ProfileStatsProps {
  /** User stats */
  stats: UserStats;
  /** On stat press handler */
  onStatPress?: (statKey: keyof UserStats) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  onStatPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const statItems: Array<{
    key: keyof UserStats;
    label: string;
    icon: string;
    color: string;
  }> = [
    { key: 'posts', label: 'Posts', icon: 'file-text', color: colors.primary },
    { key: 'likes', label: 'Likes', icon: 'heart', color: colors.error },
    { key: 'comments', label: 'Comments', icon: 'message-circle', color: colors.info },
    { key: 'badges', label: 'Badges', icon: 'award', color: colors.success },
    { key: 'squads', label: 'Squads', icon: 'users', color: colors.secondary },
  ];

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    ...style,
  };

  const itemStyle = (isPressable: boolean): ViewStyle => ({
    width: '18%',
    alignItems: 'center',
    paddingVertical: 8,
    opacity: isPressable ? 1 : 0.8,
  });

  const valueStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  };

  const labelStyle: TextStyle = {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  };

  const iconContainerStyle = (color: string): ViewStyle => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color + '15',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <Card style={containerStyle} elevation="sm" testID={testID}>
      {statItems.map((item) => {
        const value = stats[item.key];
        const isPressable = onStatPress && value > 0;

        const content = (
          <View style={itemStyle(!!isPressable)}>
            <View style={iconContainerStyle(item.color)}>
              <Icon name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={valueStyle}>{value}</Text>
            <Text style={labelStyle}>{item.label}</Text>
          </View>
        );

        if (isPressable) {
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onStatPress?.(item.key)}
              activeOpacity={0.7}
            >
              {content}
            </TouchableOpacity>
          );
        }

        return <View key={item.key}>{content}</View>;
      })}
    </Card>
  );
};

export default ProfileStats;