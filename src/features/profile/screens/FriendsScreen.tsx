/**
 * KONEX FriendsScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen displaying friends list
 * 
 * Usage:
 * <FriendsScreen navigation={navigation} route={route} />
 */

import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    View,
    ViewStyle
} from 'react-native';
import { friendService } from '../../../api/services/friend.service';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import ListItem from '../../../components/molecules/ListItem';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface FriendsScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { userId } = route.params || {};
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const targetUserId = userId || user?.id;
      const data = await friendService.getFriends(targetUserId);
      setFriends(data || []);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFriends();
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ListItem
      title={item.friend.gamerTag}
      subtitle={`@${item.friend.username}`}
      avatarSource={item.friend.avatarUrl ? { uri: item.friend.avatarUrl } : undefined}
      rightIcon="chevron-right"
      onPress={() => navigation.navigate('Profile', { userId: item.friend.id })}
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
        title="Friends"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {friends.length === 0 ? (
        <EmptyState
          title="No Friends"
          description="You haven't added any friends yet"
          icon="👥"
        />
      ) : (
        <FlatList
          data={friends}
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

export default FriendsScreen;