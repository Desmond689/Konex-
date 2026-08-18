/**
 * KONEX CommunityPosts Screen
 * Billion Dollar Code - Production Ready
 * 
 * Posts tab in community
 * 
 * Usage:
 * <CommunityPosts communityId={communityId} />
 */

import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    View,
    ViewStyle
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import FeedEmptyState from '../../../components/organisms/feed/FeedEmptyState';
import FeedFilter, { FeedFilterType } from '../../../components/organisms/feed/FeedFilter';
import PostCard from '../../../components/organisms/feed/PostCard';
import { useTheme } from '../../../hooks/useTheme';
import { useCommunity } from '../hooks/useCommunity';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityPostsProps {
  communityId: string;
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityPosts: React.FC<CommunityPostsProps> = ({
  communityId,
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('latest');

  const {
    posts,
    isLoading,
    isRefreshing,
    refresh,
  } = useCommunity(communityId, { includePosts: true });

  const handleRefresh = async () => {
    await refresh();
  };

  const renderItem = ({ item }: { item: any }) => (
    <PostCard
      post={item}
      onLike={() => {}}
      onUnlike={() => {}}
      onComment={(postId) => navigation.navigate('PostDetail', { postId })}
      onShare={() => {}}
      onSave={() => {}}
      onUnsave={() => {}}
      onUserPress={(userId) => navigation.navigate('Profile', { userId })}
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
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
      <FeedFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {posts.length === 0 ? (
        <FeedEmptyState
          title="No Posts Yet"
          description="Be the first to post in this community!"
          onCreatePost={() => navigation.navigate('CreatePost', { communityId })}
          onRefresh={handleRefresh}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default CommunityPosts;