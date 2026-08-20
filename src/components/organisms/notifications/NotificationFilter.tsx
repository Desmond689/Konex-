/**
 * KONEX NotificationFilter Component
 * Billion Dollar Code - Production Ready
 * 
 * Filter options for notifications
 * 
 * Usage:
 * <NotificationFilter
 *   activeFilter={activeFilter}
 *   onFilterChange={handleFilterChange}
 *   counts={counts}
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
import Badge from '../../atoms/Badge';

// ============================================
// 1. TYPES
// ============================================

export type NotificationFilterType = 
  | 'all' 
  | 'social' 
  | 'squad' 
  | 'content' 
  | 'achievement' 
  | 'system';

export interface NotificationCounts {
  all?: number;
  social?: number;
  squad?: number;
  content?: number;
  achievement?: number;
  system?: number;
}

export interface NotificationFilterProps {
  /** Active filter */
  activeFilter: NotificationFilterType;
  /** On filter change handler */
  onFilterChange: (filter: NotificationFilterType) => void;
  /** Counts for each filter */
  counts?: NotificationCounts;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const NotificationFilter: React.FC<NotificationFilterProps> = ({
  activeFilter,
  onFilterChange,
  counts = {},
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const filters: Array<{
    id: NotificationFilterType;
    label: string;
    icon: string;
    count?: number;
  }> = [
    { id: 'all', label: 'All', icon: '📬', count: counts.all },
    { id: 'social', label: 'Social', icon: '👤', count: counts.social },
    { id: 'squad', label: 'Squad', icon: '🛡️', count: counts.squad },
    { id: 'content', label: 'Content', icon: '📱', count: counts.content },
    { id: 'achievement', label: 'Achievements', icon: '🏆', count: counts.achievement },
    { id: 'system', label: 'System', icon: '⚙️', count: counts.system },
  ];

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 4,
    ...style,
  };

  const buttonStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isActive ? colors.primary : 'transparent',
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  });

  const textStyle = (isActive: boolean): TextStyle => ({
    fontSize: 13,
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#FFFFFF' : colors.textSecondary,
  });

  const countBadgeStyle: ViewStyle = {
    marginLeft: 4,
  };

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
        const hasCount = filter.count !== undefined && filter.count > 0;

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
            {hasCount && (
              <Badge
                count={filter.count}
                size="xs"
                variant={isActive ? 'neutral' : 'error'}
                style={countBadgeStyle}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default NotificationFilter;