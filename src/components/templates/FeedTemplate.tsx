/**
 * KONEX FeedTemplate Component
 * Billion Dollar Code - Production Ready
 * 
 * A feed layout template with header, feed content, and optional floating action
 * 
 * Usage:
 * <FeedTemplate
 *   title="Feed"
 *   feedItems={posts}
 *   renderItem={({ item }) => <PostCard post={item} />}
 *   onRefresh={refreshFeed}
 *   loading={isLoading}
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../atoms/Icon';
import LoadingSpinner from '../atoms/LoadingSpinner';
import EmptyState from '../molecules/EmptyState';
import NavigationHeader from '../navigation/NavigationHeader';

// ============================================
// 1. TYPES
// ============================================

export interface FeedTemplateProps<T> {
  /** Feed data */
  data: T[];
  /** Render item function */
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string;
  /** Page title */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** On back press handler */
  onBackPress?: () => void;
  /** Right header actions */
  headerActions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
  }>;
  /** On refresh handler */
  onRefresh?: () => Promise<void>;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** Is loading */
  loading?: boolean;
  /** Is refreshing */
  refreshing?: boolean;
  /** Has more data */
  hasMore?: boolean;
  /** Empty state configuration */
  emptyState?: {
    title: string;
    description?: string;
    actionText?: string;
    onAction?: () => void;
  };
  /** Show floating action button */
  showFAB?: boolean;
  /** FAB icon */
  fabIcon?: string;
  /** On FAB press handler */
  onFabPress?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom content style */
  contentStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export function FeedTemplate<T>({
  data,
  renderItem,
  keyExtractor,
  title,
  showBack = false,
  onBackPress,
  headerActions = [],
  onRefresh,
  onLoadMore,
  loading = false,
  refreshing = false,
  hasMore = true,
  emptyState,
  showFAB = false,
  fabIcon = 'plus',
  onFabPress,
  style,
  contentStyle,
  testID,
}: FeedTemplateProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...style,
  };

  const contentContainerStyle: ViewStyle = {
    flex: 1,
    ...contentStyle,
  };

  const fabStyle: ViewStyle = {
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
  };

  const renderEmpty = () => {
    if (emptyState) {
      return (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          actionText={emptyState.actionText}
          onAction={emptyState.onAction}
        />
      );
    }
    return <EmptyState title="No items to display" />;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  return (
    <SafeAreaView style={containerStyle} testID={testID}>
      <NavigationHeader
        title={title}
        showBack={showBack}
        onBackPress={onBackPress}
        rightActions={headerActions}
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor || ((item: any, index: number) => `${index}`)}
        style={contentContainerStyle}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing || refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        onEndReached={onLoadMore ? handleLoadMore : undefined}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
      {showFAB && onFabPress && (
        <TouchableOpacity style={fabStyle} onPress={onFabPress} activeOpacity={0.8}>
          <Icon name={fabIcon} size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default FeedTemplate;