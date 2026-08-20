/**
 * KONEX AdminDashboard Component
 * Billion Dollar Code - Production Ready
 * 
 * Admin dashboard with stats and quick actions
 * 
 * Usage:
 * <AdminDashboard
 *   stats={stats}
 *   onQuickAction={handleQuickAction}
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
import { formatNumber } from '../../../utils/formatters';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface DashboardStats {
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

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export interface AdminDashboardProps {
  stats: DashboardStats;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  quickActions = [],
  onQuickAction,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'users', color: colors.primary },
    { label: 'Active Users', value: stats.activeUsers, icon: 'user-check', color: colors.success },
    { label: 'New Today', value: stats.newUsersToday, icon: 'user-plus', color: colors.info },
    { label: 'Total Squads', value: stats.totalSquads, icon: 'users', color: colors.secondary },
    { label: 'Total Posts', value: stats.totalPosts, icon: 'file-text', color: colors.warning },
    { label: 'New Posts Today', value: stats.newPostsToday, icon: 'plus-circle', color: colors.success },
    { label: 'Pending Reports', value: stats.pendingReports, icon: 'flag', color: colors.error },
    { label: 'Active Suspensions', value: stats.activeSuspensions, icon: 'clock', color: colors.warning },
    { label: 'Total Bans', value: stats.totalBans, icon: 'ban', color: colors.error },
    { label: 'Pending Appeals', value: stats.pendingAppeals, icon: 'message-square', color: colors.info },
  ];

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  };

  const cardStyle: ViewStyle = {
    width: '48%',
    marginHorizontal: 6,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  };

  const valueStyle: TextStyle = {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  };

  const labelStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  const quickActionStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  };

  const quickActionTextStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  };

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
        Dashboard Overview
      </Text>

      {quickActions.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Quick Actions
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={quickActionStyle}
                onPress={() => onQuickAction?.(action.id)}
              >
                <Icon name={action.icon} size={20} color={action.color} />
                <Text style={quickActionTextStyle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={gridStyle}>
        {statCards.map((stat, index) => (
          <Card key={index} style={cardStyle} elevation="sm">
            <Icon name={stat.icon} size={24} color={stat.color} />
            <Text style={valueStyle}>{formatNumber(stat.value)}</Text>
            <Text style={labelStyle}>{stat.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;