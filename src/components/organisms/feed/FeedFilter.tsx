/**
 * KONEX FeedFilter Component
 * Billion Dollar Code - Production Ready
 * 
 * Filter options for feed
 * 
 * Usage:
 * <FeedFilter
 *   activeFilter={activeFilter}
 *   onFilterChange={handleFilterChange}
 * />
 */

import React from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type FeedFilterType = 'for_you' | 'following' | 'trending' | 'latest';

export interface FeedFilterProps {
  /** Active filter */
  activeFilter: FeedFilterType;
  /** On filter change handler */
  onFilterChange: (filter: FeedFilterType) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FeedFilter: React.FC<FeedFilterProps> = ({
  activeFilter,
  onFilterChange,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const filters: Array<{ id: FeedFilterType; label: string; icon: string }> = [
    { id: 'for_you', label: 'For You', icon: '🔥' },
    { id: 'following', label: 'Following', icon: '👤' },
    { id: 'trending', label: 'Trending', icon: '📈' },
    { id: 'latest', label: 'Latest', icon: '🕐' },
  ];

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 4,
    ...style,
  };

  const buttonStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isActive ? colors.primary : 'transparent',
    marginHorizontal: 4,
  });

  const textStyle = (isActive: boolean): TextStyle => ({
    fontSize: 13,
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#FFFFFF' : colors.textSecondary,
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={containerStyle}
      testID={testID}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <TouchableOpacity
            key={filter.id}
            style={buttonStyle(isActive)}
            onPress={() => onFilterChange(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={textStyle(isActive)}>
              {filter.icon} {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default FeedFilter;