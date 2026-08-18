/**
 * KONEX ProfileTabs Component
 * Billion Dollar Code - Production Ready
 * 
 * Tab navigation for profile content
 * 
 * Usage:
 * <ProfileTabs
 *   activeTab={activeTab}
 *   onTabChange={handleTabChange}
 *   counts={{ posts: 10, clips: 5, lfg: 2 }}
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
import Badge from '../../../components/atoms/Badge';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type ProfileTab = 'posts' | 'clips' | 'lfg' | 'saved' | 'badges';

export interface ProfileTabCounts {
  posts?: number;
  clips?: number;
  lfg?: number;
  saved?: number;
  badges?: number;
}

export interface ProfileTabsProps {
  /** Active tab */
  activeTab: ProfileTab;
  /** On tab change handler */
  onTabChange: (tab: ProfileTab) => void;
  /** Counts for each tab */
  counts?: ProfileTabCounts;
  /** Show saved tab (only for own profile) */
  showSaved?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  counts = {},
  showSaved = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tabs: Array<{
    id: ProfileTab;
    label: string;
    icon: string;
    count?: number;
  }> = [
    { id: 'posts', label: 'Posts', icon: '📱', count: counts.posts },
    { id: 'clips', label: 'Clips', icon: '🎥', count: counts.clips },
    { id: 'lfg', label: 'LFG', icon: '🎮', count: counts.lfg },
  ];

  if (showSaved) {
    tabs.push({ id: 'saved', label: 'Saved', icon: '📌', count: counts.saved });
  }

  tabs.push({ id: 'badges', label: 'Badges', icon: '🏅', count: counts.badges });

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
    minWidth: 60,
  });

  const labelStyle = (isActive: boolean): TextStyle => ({
    fontSize: 13,
    fontWeight: isActive ? '600' : '500',
    color: isActive ? colors.primary : colors.textSecondary,
  });

  const countBadgeStyle: ViewStyle = {
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
        const hasCount = tab.count !== undefined && tab.count > 0;

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
              {hasCount && (
                <Badge
                  count={tab.count}
                  size="xs"
                  variant={isActive ? 'primary' : 'neutral'}
                  style={countBadgeStyle}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default ProfileTabs;