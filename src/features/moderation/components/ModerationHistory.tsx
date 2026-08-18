/**
 * KONEX ModerationHistory Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays moderation history for a user or squad
 * 
 * Usage:
 * <ModerationHistory
 *   history={history}
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
import Card from '../../../components/atoms/Card';
import Input from '../../../components/atoms/Input';
import Tag from '../../../components/atoms/Tag';
import EmptyState from '../../../components/molecules/EmptyState';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface ModerationAction {
  id: string;
  userId: string;
  userGamerTag: string;
  moderatorId: string;
  moderatorGamerTag: string;
  actionType: 'warning' | 'suspension' | 'ban' | 'unban';
  reason: string;
  details: string | null;
  duration: number | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface ModerationHistoryProps {
  /** List of moderation actions */
  history: ModerationAction[];
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

export const ModerationHistory: React.FC<ModerationHistoryProps> = ({
  history,
  onFilterChange,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getActionLabel = (type: ModerationAction['actionType']): string => {
    switch (type) {
      case 'warning':
        return '⚠️ Warning';
      case 'suspension':
        return '⏸️ Suspension';
      case 'ban':
        return '🚫 Ban';
      case 'unban':
        return '✅ Unban';
      default:
        return 'Unknown';
    }
  };

  const getActionColor = (type: ModerationAction['actionType']): string => {
    switch (type) {
      case 'warning':
        return colors.warning;
      case 'suspension':
        return colors.warning;
      case 'ban':
        return colors.error;
      case 'unban':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getActionSeverity = (type: ModerationAction['actionType']): 'error' | 'warning' | 'success' | 'neutral' => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'suspension':
        return 'warning';
      case 'ban':
        return 'error';
      case 'unban':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.userGamerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.moderatorGamerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const renderItem = ({ item }: { item: ModerationAction }) => {
    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

    return (
      <Card style={{ marginBottom: 8, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Tag
                label={getActionLabel(item.actionType)}
                variant={getActionSeverity(item.actionType)}
                size="sm"
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {item.userGamerTag}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>by</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                {item.moderatorGamerTag}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              {item.reason}
            </Text>
            {item.details && (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {item.details}
              </Text>
            )}
            {item.duration && (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Duration: {item.duration} days
                {item.expiresAt && (
                  <Text style={{ color: isExpired ? colors.error : colors.success }}>
                    {isExpired ? ' (Expired)' : ` (Expires ${format(new Date(item.expiresAt), 'MMM dd')})`}
                  </Text>
                )}
              </Text>
            )}
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

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

  return (
    <View style={containerStyle} testID={testID}>
      <Input
        placeholder="Search history..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        style={{ marginBottom: 12 }}
      />

      <View style={filterContainerStyle}>
        {['all', 'warning', 'suspension', 'ban', 'unban'].map((type) => {
          const isActive = filterType === type;
          const label = type === 'all' ? 'All' : getActionLabel(type as ModerationAction['actionType']);
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

      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No History Found"
          description={searchQuery ? 'Try adjusting your search' : 'No moderation history to display'}
          icon="📜"
        />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ModerationHistory;