/**
 * KONEX TournamentBracket Component
 * Billion Dollar Code - Production Ready
 *
 * Renders a tournament bracket (single or double elimination) as a
 * horizontally scrollable set of rounds, with each match rendered as a
 * compact card showing both competing squads, score, and status.
 *
 * Usage:
 * <TournamentBracket
 *   format="single_elimination"
 *   rounds={rounds}
 *   onMatchPress={handleMatchPress}
 * />
 */

import React, { useMemo } from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../../components/atoms/Avatar';
import Icon from '../../../components/atoms/Icon';
import Tag from '../../../components/atoms/Tag';
import EmptyState from '../../../components/molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export type BracketFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss';

export type BracketMatchStatus =
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'bye';

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  /** Which bracket this match belongs to (relevant for double elimination) */
  bracketType?: 'winners' | 'losers' | 'grand_final';
  squadAId: string | null;
  squadAName: string | null;
  squadAIcon: string | null;
  squadAScore?: number | null;
  squadBId: string | null;
  squadBName: string | null;
  squadBIcon: string | null;
  squadBScore?: number | null;
  winnerId: string | null;
  status: BracketMatchStatus;
  startTime?: string | null;
  /** Match this winner advances to, used purely for display purposes */
  nextMatchId?: string | null;
}

export interface BracketRound {
  round: number;
  /** Display label, e.g. "Round 1", "Quarterfinals", "Grand Final" */
  label: string;
  bracketType?: 'winners' | 'losers' | 'grand_final';
  matches: BracketMatch[];
}

export interface TournamentBracketProps {
  /** Tournament bracket format */
  format: BracketFormat;
  /** Rounds of the bracket, ordered from earliest to latest */
  rounds: BracketRound[];
  /** On match press handler */
  onMatchPress?: (matchId: string) => void;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** ID of the currently highlighted squad (e.g. current user's squad) */
  highlightSquadId?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. HELPERS
// ============================================

const getStatusMeta = (
  status: BracketMatchStatus,
  colors: any
): { label: string; variant: 'success' | 'error' | 'warning' | 'primary' | 'neutral' } => {
  switch (status) {
    case 'scheduled':
      return { label: 'Scheduled', variant: 'neutral' };
    case 'live':
      return { label: '🔴 Live', variant: 'error' };
    case 'completed':
      return { label: '✅ Final', variant: 'success' };
    case 'disputed':
      return { label: '⚠️ Disputed', variant: 'warning' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'neutral' };
    case 'bye':
      return { label: 'Bye', variant: 'neutral' };
    default:
      return { label: 'Unknown', variant: 'neutral' };
  }
};

// ============================================
// 3. SLOT SUB-COMPONENT
// ============================================

interface SquadSlotProps {
  name: string | null;
  icon: string | null;
  squadId: string | null;
  score?: number | null;
  isWinner: boolean;
  isHighlighted: boolean;
  onPress?: () => void;
  colors: any;
}

const SquadSlot: React.FC<SquadSlotProps> = ({
  name,
  icon,
  squadId,
  score,
  isWinner,
  isHighlighted,
  onPress,
  colors,
}) => {
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: isWinner
      ? colors.successBackground ?? colors.background
      : 'transparent',
    borderWidth: isHighlighted ? 1 : 0,
    borderColor: colors.primary,
  };

  const nameStyle: TextStyle = {
    flex: 1,
    fontSize: 13,
    fontWeight: isWinner ? '700' : '500',
    color: name ? colors.text : colors.textMuted,
    marginLeft: 8,
  };

  const scoreStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '700',
    color: isWinner ? colors.success : colors.textSecondary,
    marginLeft: 8,
  };

  return (
    <TouchableOpacity
      style={rowStyle}
      onPress={onPress}
      disabled={!squadId || !onPress}
      activeOpacity={0.7}
    >
      <Avatar
        source={icon ? { uri: icon } : undefined}
        name={name ?? 'TBD'}
        size="xs"
        shape="rounded"
      />
      <Text style={nameStyle} numberOfLines={1}>
        {name ?? 'TBD'}
      </Text>
      {isWinner && <Icon name="trophy" size={12} color={colors.success} />}
      {score !== undefined && score !== null && (
        <Text style={scoreStyle}>{score}</Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// 4. MATCH SUB-COMPONENT
// ============================================

interface BracketMatchCardProps {
  match: BracketMatch;
  onPress?: (matchId: string) => void;
  onSquadPress?: (squadId: string) => void;
  highlightSquadId?: string;
  colors: any;
}

const BracketMatchCard: React.FC<BracketMatchCardProps> = ({
  match,
  onPress,
  onSquadPress,
  highlightSquadId,
  colors,
}) => {
  const statusMeta = getStatusMeta(match.status, colors);

  const cardStyle: ViewStyle = {
    width: 220,
    backgroundColor: colors.surface ?? colors.card ?? colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 16,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  };

  const matchLabelStyle: TextStyle = {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onPress?.(match.id)}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={headerStyle}>
        <Text style={matchLabelStyle}>Match {match.matchNumber}</Text>
        <Tag label={statusMeta.label} variant={statusMeta.variant} size="xs" />
      </View>

      <SquadSlot
        name={match.squadAName}
        icon={match.squadAIcon}
        squadId={match.squadAId}
        score={match.squadAScore}
        isWinner={!!match.winnerId && match.winnerId === match.squadAId}
        isHighlighted={!!highlightSquadId && match.squadAId === highlightSquadId}
        onPress={
          match.squadAId ? () => onSquadPress?.(match.squadAId as string) : undefined
        }
        colors={colors}
      />

      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

      <SquadSlot
        name={match.squadBName}
        icon={match.squadBIcon}
        squadId={match.squadBId}
        score={match.squadBScore}
        isWinner={!!match.winnerId && match.winnerId === match.squadBId}
        isHighlighted={!!highlightSquadId && match.squadBId === highlightSquadId}
        onPress={
          match.squadBId ? () => onSquadPress?.(match.squadBId as string) : undefined
        }
        colors={colors}
      />
    </TouchableOpacity>
  );
};

// ============================================
// 5. COMPONENT
// ============================================

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  format,
  rounds,
  onMatchPress,
  onSquadPress,
  highlightSquadId,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const formatLabelStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  };

  const roundsWrapperStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const roundColumnStyle: ViewStyle = {
    marginRight: 20,
  };

  const roundHeaderStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  };

  // Group rounds by bracket type so double elimination renders as two
  // stacked tracks (winners bracket on top, losers bracket below).
  const groupedByBracket = useMemo(() => {
    const groups: Record<string, BracketRound[]> = {};
    rounds.forEach((round) => {
      const key = round.bracketType ?? 'winners';
      if (!groups[key]) groups[key] = [];
      groups[key].push(round);
    });
    return groups;
  }, [rounds]);

  const getFormatLabel = (f: BracketFormat): string => {
    switch (f) {
      case 'single_elimination':
        return '🏆 Single Elimination';
      case 'double_elimination':
        return '🔁 Double Elimination';
      case 'round_robin':
        return '🔄 Round Robin';
      case 'swiss':
        return '♟️ Swiss';
      default:
        return f;
    }
  };

  const renderRoundColumn = (round: BracketRound) => (
    <View key={`${round.bracketType ?? 'winners'}-${round.round}`} style={roundColumnStyle}>
      <Text style={roundHeaderStyle}>{round.label}</Text>
      <View style={{ justifyContent: 'space-around', flexGrow: 1 }}>
        {round.matches.map((match) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            onPress={onMatchPress}
            onSquadPress={onSquadPress}
            highlightSquadId={highlightSquadId}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );

  const bracketOrder: Array<'winners' | 'losers' | 'grand_final'> = [
    'winners',
    'losers',
    'grand_final',
  ];

  const bracketSectionLabel: Record<string, string> = {
    winners: 'Winners Bracket',
    losers: 'Losers Bracket',
    grand_final: 'Grand Final',
  };

  const hasMatches = rounds.some((r) => r.matches.length > 0);

  if (loading) {
    return (
      <View style={containerStyle} testID={testID}>
        <EmptyState
          title="Loading Bracket…"
          description="The bracket is being generated"
          icon="⏳"
          style={{ padding: 24 }}
        />
      </View>
    );
  }

  if (!hasMatches) {
    return (
      <View style={containerStyle} testID={testID}>
        <EmptyState
          title="Bracket Not Ready"
          description="The bracket hasn't been generated for this tournament yet"
          icon="🧮"
          style={{ padding: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      <Text style={formatLabelStyle}>{getFormatLabel(format)}</Text>

      {bracketOrder
        .filter((key) => groupedByBracket[key]?.length)
        .map((key) => (
          <View key={key} style={{ marginBottom: 20 }}>
            {format === 'double_elimination' && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 10,
                }}
              >
                {bracketSectionLabel[key]}
              </Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={roundsWrapperStyle}>
                {groupedByBracket[key]
                  .slice()
                  .sort((a, b) => a.round - b.round)
                  .map(renderRoundColumn)}
              </View>
            </ScrollView>
          </View>
        ))}
    </View>
  );
};

export default TournamentBracket;
