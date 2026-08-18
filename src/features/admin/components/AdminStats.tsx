/**
 * KONEX AdminStats Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays key statistics for the admin dashboard
 * 
 * Usage:
 * <AdminStats stats={stats} loading={loading} />
 */

import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';
import { formatNumber } from '../../../utils/formatters';

// ============================================
// 1. TYPES
// ============================================

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalSquads: number;
  totalPosts: number;
  newPostsToday: number;
  pendingReports: number;
  activeSuspensions: number;
  totalBans: number;
  pendingAppeals: number;
}

export interface AdminStatsProps {
  /** Statistics data */
  stats: AdminStatsData | null;
  /** Is loading */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. STAT ITEMS
// ============================================

interface StatItem {
  key: keyof AdminStatsData;
  label: string;
  icon: string;
  color: string;
  subtitle?: string;
}

const STAT_ITEMS: StatItem[] = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: 'users',
    color: '#3B82F6',
    subtitle: 'All registered users',
  },
  {
    key: 'activeUsers',
    label: 'Active Users',
    icon: 'user-check',
    color: '#10B981',
    subtitle: 'Online now',
  },
  {
    key: 'newUsersToday',
    label: 'New Today',
    icon: 'user-plus',
    color: '#8B5CF6',
    subtitle: 'Joined in 24h',
  },
  {
    key: 'totalSquads',
    label: 'Total Squads',
    icon: 'users',
    color: '#EC4899',
    subtitle: 'Active squads',
  },
  {
    key: 'totalPosts',
    label: 'Total Posts',
    icon: 'file-text',
    color: '#F59E0B',
    subtitle: 'All posts',
  },
  {
    key: 'newPostsToday',
    label: 'New Posts Today',
    icon: 'plus-circle',
    color: '#10B981',
    subtitle: 'Posted in 24h',
  },
  {
    key: 'pendingReports',
    label: 'Pending Reports',
    icon: 'flag',
    color: '#EF4444',
    subtitle: 'Needs review',
  },
  {
    key: 'activeSuspensions',
    label: 'Active Suspensions',
    icon: 'clock',
    color: '#F59E0B',
    subtitle: 'Temporary bans',
  },
  {
    key: 'totalBans',
    label: 'Total Bans',
    icon: 'ban',
    color: '#EF4444',
    subtitle: 'Permanent bans',
  },
  {
    key: 'pendingAppeals',
    label: 'Pending Appeals',
    icon: 'message-square',
    color: '#8B5CF6',
    subtitle: 'Awaiting review',
  },
];

// ============================================
// 3. COMPONENT
// ============================================

export const AdminStats: React.FC<AdminStatsProps> = ({
  stats,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  };

  const cardStyle: ViewStyle = {
    width: '48%',
    marginHorizontal: 4,
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
  };

  const iconContainerStyle = (color: string): ViewStyle => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  });

  const valueStyle: TextStyle = {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  };

  const labelStyle: TextStyle = {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  };

  const subtitleStyle: TextStyle = {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
    opacity: 0.7,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  };

  const loadingContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  };

  if (loading) {
    return (
      <View style={loadingContainerStyle} testID={testID}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Loading statistics...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={loadingContainerStyle} testID={testID}>
        <Text style={{ color: colors.textSecondary }}>
          No statistics available
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>📊 Dashboard Overview</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          Updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>

      <View style={gridStyle}>
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key];
          const isHighlight = item.key === 'pendingReports' || 
                             item.key === 'activeSuspensions' || 
                             item.key === 'pendingAppeals';

          return (
            <Card
              key={item.key}
              style={[
                cardStyle,
                isHighlight && {
                  borderWidth: 1,
                  borderColor: item.color + '40',
                },
              ]}
              elevation="sm"
            >
              <View style={iconContainerStyle(item.color)}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={valueStyle}>
                {formatNumber(value || 0)}
              </Text>
              <Text style={labelStyle}>{item.label}</Text>
              {item.subtitle && (
                <Text style={subtitleStyle}>{item.subtitle}</Text>
              )}
            </Card>
          );
        })}
      </View>
    </View>
  );
};

export default AdminStats;