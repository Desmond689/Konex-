/**
 * KONEX CommunityMemberList Component
 * Billion Dollar Code - Production Ready
 * 
 * A list of community members with search and filtering
 * 
 * Usage:
 * <CommunityMemberList
 *   members={members}
 *   onMemberPress={handleMemberPress}
 *   onSearch={handleSearch}
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    View,
    ViewStyle
} from 'react-native';
import Input from '../../../components/atoms/Input';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import CommunityMemberItem, { CommunityMember } from './CommunityMemberItem';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityMemberListProps {
  /** List of members */
  members: CommunityMember[];
  /** On member press handler */
  onMemberPress?: (userId: string) => void;
  /** On search handler */
  onSearch?: (query: string) => void;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** Is loading */
  loading?: boolean;
  /** Has more data */
  hasMore?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityMemberList: React.FC<CommunityMemberListProps> = ({
  members,
  onMemberPress,
  onSearch,
  onLoadMore,
  loading = false,
  hasMore = false,
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

  const onlineMembers = members.filter((m) => m.onlineStatus === 'online');
  const offlineMembers = members.filter((m) => m.onlineStatus !== 'online');

  // If search is active, filter all members
  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.gamerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [...onlineMembers, ...offlineMembers];

  const renderSection = (title: string, data: CommunityMember[]) => {
    if (data.length === 0) return null;

    return (
      <View>
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 4,
            backgroundColor: colors.surface,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.textMuted,
            }}
          >
            {title} ({data.length})
          </Text>
        </View>
        {data.map((member) => (
          <CommunityMemberItem
            key={member.id}
            member={member}
            onPress={onMemberPress}
          />
        ))}
      </View>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      title={searchQuery ? 'No members found' : 'No members yet'}
      description={searchQuery ? 'Try adjusting your search' : 'Be the first to join!'}
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
          data={searchQuery ? filteredMembers : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommunityMemberItem
              member={item}
              onPress={onMemberPress}
            />
          )}
          ListHeaderComponent={
            !searchQuery ? (
              <View>
                {renderSection('🟢 Online', onlineMembers)}
                {renderSection('⚫ Offline', offlineMembers)}
              </View>
            ) : null
          }
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

export default CommunityMemberList;