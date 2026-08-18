/**
 * KONEX SquadMemberList Component
 * Billion Dollar Code - Production Ready
 * 
 * A list of squad members with role-based sorting
 * 
 * Usage:
 * <SquadMemberList
 *   members={members}
 *   onMemberPress={handleMemberPress}
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Input from '../../atoms/Input';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import EmptyState from '../../molecules/EmptyState';
import SquadMemberItem from './SquadMemberItem';

// ============================================
// 1. TYPES
// ============================================

export interface SquadMember {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  onlineStatus: 'online' | 'away' | 'offline';
  role: 'Leader' | 'Admin' | 'Member';
  joinedAt: string;
  skillLevel: string;
  roleTag: string;
}

export interface SquadMemberListProps {
  /** List of members */
  members: SquadMember[];
  /** On member press handler */
  onMemberPress?: (userId: string) => void;
  /** Is the current user the squad leader */
  isLeader?: boolean;
  /** On kick handler */
  onKick?: (userId: string) => void;
  /** On promote handler */
  onPromote?: (userId: string) => void;
  /** On demote handler */
  onDemote?: (userId: string) => void;
  /** On search handler */
  onSearch?: (query: string) => void;
  /** Is loading */
  loading?: boolean;
  /** Has more data */
  hasMore?: boolean;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadMemberList: React.FC<SquadMemberListProps> = ({
  members,
  onMemberPress,
  isLeader = false,
  onKick,
  onPromote,
  onDemote,
  onSearch,
  loading = false,
  hasMore = false,
  onLoadMore,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !onLoadMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.gamerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  const roleOrder: Record<SquadMember['role'], number> = {
    Leader: 0,
    Admin: 1,
    Member: 2,
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const roleDiff = roleOrder[a.role] - roleOrder[b.role];
    if (roleDiff !== 0) return roleDiff;
    return a.gamerTag.localeCompare(b.gamerTag);
  });

  const renderEmpty = () => (
    <EmptyState
      title={searchQuery ? 'No members found' : 'No members yet'}
      description={searchQuery ? 'Try adjusting your search' : 'This squad has no members'}
      icon="👥"
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  return (
    <View style={containerStyle} testID={testID}>
      {onSearch && (
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon="search"
          style={{ marginBottom: 8 }}
        />
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size="large" />
        </View>
      ) : (
        <FlatList
          data={sortedMembers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SquadMemberItem
              member={item}
              onPress={onMemberPress}
              isLeader={isLeader}
              onKick={onKick}
              onPromote={onPromote}
              onDemote={onDemote}
            />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

export default SquadMemberList;