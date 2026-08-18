/**
 * KONEX ModerationQueue Component
 * Billion Dollar Code - Production Ready
 * 
 * The moderation queue with filters and bulk actions
 * 
 * Usage:
 * <ModerationQueue
 *   reports={reports}
 *   onResolve={handleResolve}
 *   onDismiss={handleDismiss}
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Input from '../../../components/atoms/Input';
import EmptyState from '../../../components/molecules/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import ModerationItem, { ModerationReport } from './ModerationItem';

// ============================================
// 1. TYPES
// ============================================

export interface ModerationQueueProps {
  /** List of reports */
  reports: ModerationReport[];
  /** On resolve handler */
  onResolve: (reportId: string, decision: string, notes?: string) => Promise<void>;
  /** On dismiss handler */
  onDismiss: (reportId: string, reason: string) => Promise<void>;
  /** On view content handler */
  onViewContent?: (report: ModerationReport) => void;
  /** On filter change handler */
  onFilterChange?: (filters: any) => void;
  /** Is loading */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  reports,
  onResolve,
  onDismiss,
  onViewContent,
  onFilterChange,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.reportedUserName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending' || r.status === 'under_review').length;

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const filterContainerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return '🚨 Pending';
      case 'under_review':
        return '🔍 Under Review';
      case 'resolved':
        return '✅ Resolved';
      case 'dismissed':
        return '❌ Dismissed';
      default:
        return 'All';
    }
  };

  const statuses = ['all', 'pending', 'under_review', 'resolved', 'dismissed'];

  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          Moderation Queue ({pendingCount} pending)
        </Text>
      </View>

      <Input
        placeholder="Search reports..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        style={{ marginBottom: 12 }}
      />

      <View style={filterContainerStyle}>
        {statuses.map((status) => {
          const isActive = filterStatus === status;
          const label = status === 'all' ? 'All' : getStatusLabel(status);
          return (
            <TouchableOpacity
              key={status}
              style={filterButtonStyle(isActive)}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={filterTextStyle(isActive)}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredReports.length === 0 ? (
        <EmptyState
          title="No Reports"
          description={searchQuery ? 'Try adjusting your search' : 'The moderation queue is empty'}
          icon="🚩"
        />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ModerationItem
              report={item}
              onResolve={onResolve}
              onDismiss={onDismiss}
              onViewContent={onViewContent}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ModerationQueue;