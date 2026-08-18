/**
 * KONEX FeedEmptyState Component
 * Billion Dollar Code - Production Ready
 * 
 * Empty state for feed with actions
 * 
 * Usage:
 * <FeedEmptyState
 *   onRefresh={handleRefresh}
 *   onCreatePost={handleCreatePost}
 * />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface FeedEmptyStateProps {
  /** On refresh handler */
  onRefresh?: () => void;
  /** On create post handler */
  onCreatePost?: () => void;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FeedEmptyState: React.FC<FeedEmptyStateProps> = ({
  onRefresh,
  onCreatePost,
  title = 'No Posts Yet',
  description = "There's nothing in your feed right now. Follow more people or create a post!",
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    paddingVertical: 40,
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <EmptyState
        title={title}
        description={description}
        icon="📱"
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 }}>
        {onRefresh && (
          <Button
            title="Refresh"
            variant="outline"
            size="md"
            onPress={onRefresh}
          />
        )}
        {onCreatePost && (
          <Button
            title="Create Post"
            variant="primary"
            size="md"
            onPress={onCreatePost}
          />
        )}
      </View>
    </View>
  );
};

export default FeedEmptyState;