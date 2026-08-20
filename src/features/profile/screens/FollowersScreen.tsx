/**
 * KONEX FollowersScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen displaying followers list
 * 
 * Usage:
 * <FollowersScreen navigation={navigation} route={route} />
 */

import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    View,
    ViewStyle
} from 'react-native';
import { followService } from '../../../api/services/follow.service';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import ListItem from '../../../components/molecules/ListItem';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface FollowersScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FollowersScreen: React.FC<FollowersScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { userId } = route.params || {};
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async () => {
    try {
      setIsLoading(true);
      const targetUserId = userId || user?.id;
      const data = await followService.getFollowers(targetUserId);
      setFollowers(data || []);
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFollowers();
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ListItem
      title={item.follower.gamerTag}
      subtitle={`@${item.follower.username}`}
      avatarSource={item.follower.avatarUrl ? { uri: item.follower.avatarUrl } : undefined}
      rightIcon="chevron-right"
      onPress={() => navigation.navigate('Profile', { userId: item.follower.id })}
      showDivider
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Followers"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {followers.length === 0 ? (
        <EmptyState
          title="No Followers"
          description="No one is following this user yet"
          icon="👤"
        />
      ) : (
        <FlatList
          data={followers}
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
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

export default FollowersScreen;