/**
 * KONEX LFGScreen
 * Billion Dollar Code - Production Ready
 * 
 * Main LFG listing screen with filters
 * 
 * Usage:
 * <LFGScreen navigation={navigation} route={route} />
 */

import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import LFGCard from '../components/LFGCard';
import LFGFilter from '../components/LFGFilter';
import { useLFG } from '../hooks/useLFG';

// ============================================
// 1. TYPES
// ============================================

export interface LFGScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGScreen: React.FC<LFGScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { communityId, squadId } = route.params || {};
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    gameMode: undefined as string | undefined,
    rankRequirement: undefined as string | undefined,
    micRequired: undefined as boolean | undefined,
    status: 'active' as 'active' | 'filled' | 'all',
  });

  const {
    posts,
    myPosts,
    isLoading,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    joinLFG,
  } = useLFG({
    communityId,
    squadId,
    autoFetch: true,
  });

  const handleJoin = async (lfgId: string) => {
    await joinLFG(lfgId);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    // Apply filters to the list
    refresh();
  };

  const filteredPosts = posts.filter((post: any) => {
    if (filters.gameMode && post.gameMode !== filters.gameMode) return false;
    if (filters.rankRequirement && post.rankRequirement !== filters.rankRequirement) return false;
    if (filters.micRequired !== undefined && post.micRequired !== filters.micRequired) return false;
    if (filters.status === 'active' && post.status !== 'active') return false;
    if (filters.status === 'filled' && post.status !== 'filled') return false;
    return true;
  });

  const renderItem = ({ item }: { item: any }) => (
    <LFGCard
      lfg={item}
      onJoin={handleJoin}
      onUserPress={(userId) => navigation.navigate('Profile', { userId })}
      onSquadPress={(squadId) => navigation.navigate('SquadDetail', { squadId })}
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  };

  const myPostsBadgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  };

  const myPostsBadgeTextStyle: TextStyle = {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  };

  const renderEmpty = () => (
    <EmptyState
      title="No LFG Posts"
      description={filters.status !== 'all' ? 'No active LFG posts match your filters' : 'No one is looking for players right now'}
      icon="🎮"
      actionText={filters.status !== 'all' ? 'Clear Filters' : 'Create LFG'}
      onAction={filters.status !== 'all' ? () => handleFilterChange({ status: 'all' }) : () => navigation.navigate('LFGCreation', { communityId })}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    if (filteredPosts.length === 0) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <LoadingSpinner size="small" />
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
          Loading more...
        </Text>
      </View>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Looking for Group"
        rightActions={[
          {
            icon: 'plus',
            onPress: () => navigation.navigate('LFGCreation', { communityId }),
          },
        ]}
      />

      <View style={headerStyle}>
        <Text style={headerTitleStyle}>
          🎮 LFG ({filteredPosts.length})
        </Text>
        {myPosts.length > 0 && (
          <TouchableOpacity
            style={myPostsBadgeStyle}
            onPress={() => navigation.navigate('MyLFGPosts')}
          >
            <Text style={myPostsBadgeTextStyle}>My LFGs ({myPosts.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      <LFGFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        gameModes={['Ranked MP', 'Battle Royale', 'Zombies', 'Scrims', 'Casual', 'Clan Wars']}
        rankRequirements={['Any', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master', 'Legendary']}
      />

      {filteredPosts.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filteredPosts}
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
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default LFGScreen;