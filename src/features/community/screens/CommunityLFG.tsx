/**
 * KONEX CommunityLFG Screen
 * Billion Dollar Code - Production Ready
 * 
 * LFG tab in community
 * 
 * Usage:
 * <CommunityLFG communityId={communityId} />
 */

import React from 'react';
import {
    FlatList,
    RefreshControl,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import LFGCard from '../../../components/organisms/lfg/LFGCard';
import { useLFG } from '../../../hooks/useLFG';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityLFGProps {
  communityId: string;
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityLFG: React.FC<CommunityLFGProps> = ({
  communityId,
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    posts,
    isLoading,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    joinLFG,
    getLFG,
  } = useLFG({ communityId, autoFetch: true });

  const handleJoin = async (lfgId: string) => {
    await joinLFG(lfgId);
  };

  const renderItem = ({ item }: { item: any }) => (
    <LFGCard
      lfg={item}
      onJoin={handleJoin}
      onUserPress={(userId) => navigation.navigate('Profile', { userId })}
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>🎮 Looking for Group</Text>
        <Button
          title="Post LFG"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('LFGCreation', { communityId })}
        />
      </View>

      {posts.length === 0 ? (
        <EmptyState
          title="No LFG Posts"
          description="Be the first to post an LFG!"
          icon="🎮"
          actionText="Post LFG"
          onAction={() => navigation.navigate('LFGCreation', { communityId })}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isLoading ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <LoadingSpinner size="small" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default CommunityLFG;