/**
 * KONEX ProfileSkeleton Component
 * Billion Dollar Code - Production Ready
 * 
 * Skeleton loading placeholder for profile
 * 
 * Usage:
 * <ProfileSkeleton />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Skeleton from '../../atoms/Skeleton';

// ============================================
// 1. TYPES
// ============================================

export interface ProfileSkeletonProps {
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const coverStyle: ViewStyle = {
    height: 140,
    backgroundColor: colors.surfaceSecondary,
  };

  const avatarStyle: ViewStyle = {
    position: 'absolute',
    bottom: -40,
    left: 16,
  };

  const infoStyle: ViewStyle = {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  };

  const statsStyle: ViewStyle = {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View style={coverStyle} />
      <View style={avatarStyle}>
        <Skeleton width={80} height={80} borderRadius={40} />
      </View>
      <View style={infoStyle}>
        <Skeleton width={140} height={24} borderRadius={4} />
        <Skeleton width={100} height={16} borderRadius={4} style={{ marginTop: 4 }} />
        <Skeleton width="100%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
        <View style={statsStyle}>
          <Skeleton width={60} height={20} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Skeleton width={100} height={36} borderRadius={8} />
          <Skeleton width={100} height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

export default ProfileSkeleton;