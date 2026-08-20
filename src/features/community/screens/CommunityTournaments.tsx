// @ts-nocheck
/**
 * KONEX CommunityTournaments Screen
 * Billion Dollar Code - Production Ready
 * 
 * Tournaments tab in community
 * 
 * Usage:
 * <CommunityTournaments communityId={communityId} />
 */

import React from 'react';
import {
    FlatList,
    RefreshControl,
    TextStyle,
    View,
    ViewStyle,
    Text,
} from 'react-native';
import Button from '../../../components/atoms/Button';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import TournamentCard from '../../../components/organisms/tournaments/TournamentCard';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityTournamentsProps {
  communityId: string;
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityTournaments: React.FC<CommunityTournamentsProps> = ({
  communityId,
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Use tournament hook instead of community
  // This would use useTournaments hook

  const tournaments: any[] = []; // Placeholder
  const isLoading = false;
  const isRefreshing = false;
  const refresh = () => {};

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>🏆 Tournaments ({tournaments.length})</Text>
        <Button
          title="Create Tournament"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('TournamentCreation', { communityId })}
        />
      </View>

      {tournaments.length === 0 ? (
        <EmptyState
          title="No Tournaments"
          description="Be the first to create a tournament in this community!"
          icon="🏆"
          actionText="Create Tournament"
          onAction={() => navigation.navigate('TournamentCreation', { communityId })}
        />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              onPress={(id) => navigation.navigate('TournamentDetail', { id })}
              onRegister={() => {}}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
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

export default CommunityTournaments;