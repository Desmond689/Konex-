/**
 * KONEX FollowingScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen displaying following list
 * 
 * Usage:
 * <FollowingScreen navigation={navigation} route={route} />
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

export interface FollowingScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FollowingScreen: React.FC<FollowingScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { userId } = route.params || {};
  const { user } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    try {
      setIsLoading(true);
      const targetUserId = userId || user?.id;
      const data = await followService.getFollowing(targetUserId);
      setFollowing(data || []);
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFollowing();
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ListItem
      title={item.following.gamerTag}
      subtitle={`@${item.following.username}`}
      avatarSource={item.following.avatarUrl ? { uri: item.following.avatarUrl } : undefined}
      rightIcon="chevron-right"
      onPress={() => navigation.navigate('Profile', { userId: item.following.id })}
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
        title="Following"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {following.length === 0 ? (
        <EmptyState
          title="Not Following Anyone"
          description="This user isn't following anyone yet"
          icon="👤"
        />
      ) : (
        <FlatList
          data={following}
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

export default FollowingScreen;