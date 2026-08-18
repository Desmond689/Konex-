/**
 * KONEX CommunitySquads Screen
 * Billion Dollar Code - Production Ready
 * 
 * Squads tab in community
 * 
 * Usage:
 * <CommunitySquads communityId={communityId} />
 */

import React from 'react';
import {
    FlatList,
    RefreshControl,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import Button from '../../../components/atoms/Button';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import SquadCard from '../../../components/organisms/squads/SquadCard';
import { useTheme } from '../../../hooks/useTheme';
import { useCommunity } from '../hooks/useCommunity';

// ============================================
// 1. TYPES
// ============================================

export interface CommunitySquadsProps {
  communityId: string;
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunitySquads: React.FC<CommunitySquadsProps> = ({
  communityId,
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    squads,
    isLoading,
    isRefreshing,
    refresh,
  } = useCommunity(communityId, { includeSquads: true });

  const handleRefresh = async () => {
    await refresh();
  };

  const renderItem = ({ item }: { item: any }) => (
    <SquadCard
      squad={item}
      onPress={(squadId) => navigation.navigate('SquadDetail', { squadId })}
      onJoin={() => {}}
      showActions={true}
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

  if (isLoading && squads.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>🛡️ Squads ({squads.length})</Text>
        <Button
          title="Create Squad"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('SquadCreation', { communityId })}
        />
      </View>

      {squads.length === 0 ? (
        <EmptyState
          title="No Squads"
          description="Be the first to create a squad in this community!"
          icon="🛡️"
          actionText="Create Squad"
          onAction={() => navigation.navigate('SquadCreation', { communityId })}
        />
      ) : (
        <FlatList
          data={squads}
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default CommunitySquads;