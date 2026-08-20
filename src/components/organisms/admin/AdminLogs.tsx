/**
 * KONEX AdminLogs Component
 * Billion Dollar Code - Production Ready
 * 
 * Admin component for viewing moderation logs
 * 
 * Usage:
 * <AdminLogs
 *   logs={logs}
 *   onFilterChange={handleFilterChange}
 * />
 */

import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  FlatList,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Card from '../../atoms/Card';
import Input from '../../atoms/Input';
import Tag from '../../atoms/Tag';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface LogEntry {
  id: string;
  adminId: string;
  adminName: string;
  actionType: 'warning' | 'suspension' | 'ban' | 'unban' | 'report_resolved' | 'report_dismissed' | 'appeal_resolved';
  targetId: string;
  targetName: string;
  targetType: 'user' | 'squad' | 'post' | 'comment';
  reason: string;
  details: string;
  createdAt: string;
}

export interface AdminLogsProps {
  logs: LogEntry[];
  onFilterChange?: (filters: any) => void;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AdminLogs: React.FC<AdminLogsProps> = ({
  logs,
  onFilterChange,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getActionLabel = (type: LogEntry['actionType']): string => {
    switch (type) {
      case 'warning':
        return '⚠️ Warning';
      case 'suspension':
        return '⏸️ Suspension';
      case 'ban':
        return '🚫 Ban';
      case 'unban':
        return '✅ Unban';
      case 'report_resolved':
        return '📋 Report Resolved';
      case 'report_dismissed':
        return '📋 Report Dismissed';
      case 'appeal_resolved':
        return '📋 Appeal Resolved';
      default:
        return 'Unknown';
    }
  };

  const getActionColor = (type: LogEntry['actionType']): string => {
    switch (type) {
      case 'warning':
        return colors.warning;
      case 'suspension':
        return colors.warning;
      case 'ban':
        return colors.error;
      case 'unban':
        return colors.success;
      case 'report_resolved':
        return colors.success;
      case 'report_dismissed':
        return colors.warning;
      case 'appeal_resolved':
        return colors.info;
      default:
        return colors.textMuted;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const renderItem = ({ item }: { item: LogEntry }) => (
    <Card style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Tag label={getActionLabel(item.actionType)} variant="neutral" size="sm" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              {item.adminName}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>→</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
              {item.targetName}
            </Text>
            <Tag label={item.targetType} variant="neutral" size="sm" />
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            {item.reason}
          </Text>
          {item.details && (
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              {item.details}
            </Text>
          )}
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm:ss')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const filterContainerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  };

  const filterButtonStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: isActive ? colors.primary : colors.border,
  });

  const filterTextStyle = (isActive: boolean): TextStyle => ({
    fontSize: 12,
    fontWeight: '500',
    color: isActive ? '#FFFFFF' : colors.text,
  });

  return (
    <View style={containerStyle} testID={testID}>
      <Input
        placeholder="Search logs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        style={{ marginBottom: 12 }}
      />

      <View style={filterContainerStyle}>
        {['all', 'warning', 'suspension', 'ban', 'unban', 'report_resolved', 'report_dismissed', 'appeal_resolved'].map((type) => {
          const isActive = filterType === type;
          const label = type === 'all' ? 'All' : getActionLabel(type as LogEntry['actionType']);
          return (
            <TouchableOpacity
              key={type}
              style={filterButtonStyle(isActive)}
              onPress={() => setFilterType(type)}
            >
              <Text style={filterTextStyle(isActive)}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Logs Found"
          description={searchQuery ? 'Try adjusting your search' : 'No logs to display'}
          icon="📜"
        />
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: any) => (
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' }}>
              <Text style={{ color: '#7C3AED', fontSize: 12, fontWeight: '700' }}>{item.type || item.action}</Text>
              <Text style={{ color: '#F9FAFB', fontSize: 14, marginTop: 4 }}>{item.message || item.details}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>{item.createdAt || item.created_at}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

export default AdminLogs;
