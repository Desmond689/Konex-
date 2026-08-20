/**
 * KONEX CommunityTabs Component
 * Billion Dollar Code - Production Ready
 * 
 * Tab navigation for community pages
 * 
 * Usage:
 * <CommunityTabs
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   counts={{ posts: 10, squads: 5, members: 100 }}
 * />
 */

import React from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Badge from '../../atoms/Badge';

// ============================================
// 1. TYPES
// ============================================

export type CommunityTab = 'posts' | 'squads' | 'lfg' | 'tournaments' | 'members';

export interface CommunityTabCounts {
  posts?: number;
  squads?: number;
  lfg?: number;
  tournaments?: number;
  members?: number;
}

export interface CommunityTabsProps {
  /** Active tab */
  activeTab: CommunityTab;
  /** On tab change handler */
  onTabChange: (tab: CommunityTab) => void;
  /** Counts for each tab */
  counts?: CommunityTabCounts;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityTabs: React.FC<CommunityTabsProps> = ({
  activeTab,
  onTabChange,
  counts = {},
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tabs: Array<{
    id: CommunityTab;
    label: string;
    icon: string;
    count?: number;
  }> = [
    { id: 'posts', label: 'Posts', icon: '📱', count: counts.posts },
    { id: 'squads', label: 'Squads', icon: '🛡️', count: counts.squads },
    { id: 'lfg', label: 'LFG', icon: '🎮', count: counts.lfg },
    { id: 'tournaments', label: 'Tournaments', icon: '🏆', count: counts.tournaments },
    { id: 'members', label: 'Members', icon: '👥', count: counts.members },
  ];

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...style,
  };

  const tabStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: isActive ? colors.primary : 'transparent',
    minWidth: 70,
  });

  const labelStyle = (isActive: boolean): TextStyle => ({
    fontSize: 13,
    fontWeight: isActive ? '600' : '400',
    color: isActive ? colors.primary : colors.textSecondary,
  });

  const countStyle: ViewStyle = {
    marginLeft: 4,
  };

  return (
    <ScrollView
      style={containerStyle}
      horizontal
      showsHorizontalScrollIndicator={false}
      testID={testID}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            style={tabStyle(isActive)}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, marginRight: 4 }}>{tab.icon}</Text>
              <Text style={labelStyle(isActive)}>{tab.label}</Text>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge count={tab.count} size="xs" variant="neutral" style={countStyle} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CommunityTabs;