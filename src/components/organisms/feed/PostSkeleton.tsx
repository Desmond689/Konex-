/**
 * KONEX PostSkeleton Component
 * Billion Dollar Code - Production Ready
 * 
 * Skeleton loading placeholder for posts
 * 
 * Usage:
 * <PostSkeleton />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Card from '../../atoms/Card';
import Skeleton from '../../atoms/Skeleton';

// ============================================
// 1. TYPES
// ============================================

export interface PostSkeletonProps {
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const PostSkeleton: React.FC<PostSkeletonProps> = ({
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    padding: 12,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  };

  const contentStyle: ViewStyle = {
    marginBottom: 12,
  };

  const mediaStyle: ViewStyle = {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  return (
    <Card style={cardStyle} elevation="sm" testID={testID}>
      <View style={headerStyle}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Skeleton width={120} height={14} borderRadius={4} />
          <Skeleton width={80} height={10} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={60} height={10} borderRadius={4} />
      </View>

      <View style={contentStyle}>
        <Skeleton width="100%" height={16} borderRadius={4} />
        <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      <Skeleton width="100%" height={200} borderRadius={8} style={mediaStyle} />

      <View style={actionsStyle}>
        <Skeleton width={50} height={20} borderRadius={4} />
        <Skeleton width={50} height={20} borderRadius={4} style={{ marginLeft: 16 }} />
        <Skeleton width={50} height={20} borderRadius={4} style={{ marginLeft: 16 }} />
        <Skeleton width={50} height={20} borderRadius={4} style={{ marginLeft: 'auto' }} />
      </View>
    </Card>
  );
};

export default PostSkeleton;