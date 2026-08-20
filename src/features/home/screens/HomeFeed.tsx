/**
 * KONEX HomeFeed Screen
 * Billion Dollar Code - Production Ready
 * 
 * The main feed component for the home screen with infinite scroll
 * 
 * Usage:
 * <HomeFeed navigation={navigation} />
 */

import React, { useRef, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from '../../../components/atoms/Icon';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import FeedEmptyState from '../../../components/organisms/feed/FeedEmptyState';
import PostSkeleton from '../../../components/organisms/feed/PostSkeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import FeedFilter from '../components/FeedFilter';
import FeedPost from '../components/FeedPost';
import { useFeed } from '../hooks/useFeed';

// ============================================
// 1. TYPES
// ============================================

export interface HomeFeedProps {
  navigation: any;
  communityId?: string;
  squadId?: string;
  userId?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const HomeFeed: React.FC<HomeFeedProps> = ({
  navigation,
  communityId,
  squadId,
  userId,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    posts,
    feedType,
    isLoading,
    isRefreshing: isFeedRefreshing,
    hasMore,
    loadMore,
    refresh,
    setFeedType,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    sharePost,
    reportPost,
    error,
    clearError,
  } = useFeed({
    communityId,
    squadId,
    userId,
    autoFetch: true,
  });

  const flatListRef = useRef<FlatList>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      await loadMore();
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (post?.isLiked) {
      await unlikePost(postId);
    } else {
      await likePost(postId);
    }
  };

  const handleComment = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleShare = (postId: string) => {
    // Show share options
    navigation.navigate('ShareModal', { postId });
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const handleSquadPress = (squadId: string) => {
    navigation.navigate('SquadDetail', { squadId });
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost', { communityId });
  };

  const renderItem = ({ item }: { item: any }) => (
    <FeedPost
      post={item}
      onLike={handleLike}
      onUnlike={unlikePost}
      onComment={handleComment}
      onShare={handleShare}
      onUserPress={handleUserPress}
      onSquadPress={handleSquadPress}
    />
  );

  const renderSkeleton = () => (
    <View style={{ padding: 16 }}>
      {[1, 2, 3].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    if (posts.length === 0) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <LoadingSpinner size="small" />
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
          Loading more posts...
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 4 }}>
      <FeedFilter
        activeFilter={feedType}
        onFilterChange={setFeedType}
      />
    </View>
  );

  const renderEmpty = () => (
    <FeedEmptyState
      title="No Posts Yet"
      description="Follow more people or create a post to get started!"
      onCreatePost={handleCreatePost}
      onRefresh={handleRefresh}
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  // If loading and no posts, show skeletons
  if (isLoading && posts.length === 0) {
    return renderSkeleton();
  }

  // If error, show error state
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={{ fontSize: 16, color: colors.text, marginTop: 12, textAlign: 'center' }}>
          {error.message || 'Something went wrong'}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
          Please try again
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            paddingHorizontal: 24,
            paddingVertical: 10,
            backgroundColor: colors.primary,
            borderRadius: 8,
          }}
          onPress={handleRefresh}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isFeedRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
      />

      {/* Floating Create Post Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeFeed;