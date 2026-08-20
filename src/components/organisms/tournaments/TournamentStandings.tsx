/**
 * KONEX TournamentStandings Component
 * Billion Dollar Code - Production Ready
 * 
 * A component displaying tournament standings
 * 
 * Usage:
 * <TournamentStandings
 *   standings={standings}
 *   onSquadPress={handleSquadPress}
 * />
 */

import React from 'react';
import {
    FlatList,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface Standing {
  id: string;
  squadId: string;
  squadName: string;
  squadIcon: string | null;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  matchesPlayed: number;
  goalDifference?: number;
}

export interface TournamentStandingsProps {
  /** List of standings */
  standings: Standing[];
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** Is loading */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentStandings: React.FC<TournamentStandingsProps> = ({
  standings,
  onSquadPress,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getRankColor = (rank: number): string => {
    if (rank === 1) return colors.success;
    if (rank === 2) return colors.info;
    if (rank === 3) return colors.warning;
    return colors.textSecondary;
  };

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const headerTextStyle: TextStyle = {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  };

  const rankHeaderStyle: TextStyle = {
    ...headerTextStyle,
    width: 40,
  };

  const squadHeaderStyle: TextStyle = {
    ...headerTextStyle,
    flex: 1,
    marginLeft: 8,
  };

  const statHeaderStyle: TextStyle = {
    ...headerTextStyle,
    width: 36,
    textAlign: 'center',
  };

  const pointsHeaderStyle: TextStyle = {
    ...headerTextStyle,
    width: 44,
    textAlign: 'center',
  };

  const itemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const rankStyle = (rank: number): TextStyle => ({
    fontSize: 14,
    fontWeight: '700',
    color: getRankColor(rank),
    width: 40,
  });

  const squadInfoStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  };

  const squadNameStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  };

  const statStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    width: 36,
    textAlign: 'center',
  };

  const pointsStyle = (rank: number): TextStyle => ({
    fontSize: 16,
    fontWeight: '700',
    color: getRankColor(rank),
    width: 44,
    textAlign: 'center',
  });

  const renderItem = ({ item }: { item: Standing }) => (
    <TouchableOpacity
      style={itemStyle}
      onPress={() => onSquadPress?.(item.squadId)}
      activeOpacity={0.7}
    >
      <Text style={rankStyle(item.rank)}>{getRankEmoji(item.rank)}</Text>

      <View style={squadInfoStyle}>
        <Avatar
          source={item.squadIcon ? { uri: item.squadIcon } : undefined}
          name={item.squadName}
          size="sm"
          shape="rounded"
        />
        <Text style={squadNameStyle} numberOfLines={1}>
          {item.squadName}
        </Text>
      </View>

      <Text style={statStyle}>{item.matchesPlayed}</Text>
      <Text style={statStyle}>{item.wins}</Text>
      <Text style={statStyle}>{item.draws}</Text>
      <Text style={statStyle}>{item.losses}</Text>
      <Text style={pointsStyle(item.rank)}>{item.points}</Text>
    </TouchableOpacity>
  );

  const sortedStandings = [...standings].sort((a, b) => {
    // Sort by points descending, then wins descending
    if (a.points !== b.points) return b.points - a.points;
    return b.wins - a.wins;
  }).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <View style={containerStyle} testID={testID}>
      {/* Header */}
      <View style={headerStyle}>
        <Text style={rankHeaderStyle}>#</Text>
        <Text style={squadHeaderStyle}>Squad</Text>
        <Text style={statHeaderStyle}>P</Text>
        <Text style={statHeaderStyle}>W</Text>
        <Text style={statHeaderStyle}>D</Text>
        <Text style={statHeaderStyle}>L</Text>
        <Text style={pointsHeaderStyle}>Pts</Text>
      </View>

      {sortedStandings.length === 0 ? (
        <EmptyState
          title="No Standings"
          description="No standings data available"
          icon="🏆"
          style={{ padding: 20 }}
        />
      ) : (
        <FlatList
          data={sortedStandings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}
    </View>
  );
};

export default TournamentStandings;