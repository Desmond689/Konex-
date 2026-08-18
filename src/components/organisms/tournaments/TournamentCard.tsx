/**
 * KONEX TournamentCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card displaying tournament information
 * 
 * Usage:
 * <TournamentCard
 *   tournament={tournament}
 *   onPress={handlePress}
 *   onRegister={handleRegister}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import ProgressBar from '../../atoms/ProgressBar';
import Tag from '../../atoms/Tag';

// ============================================
// 1. TYPES
// ============================================

export interface Tournament {
  id: string;
  name: string;
  game: string;
  gameMode: string;
  format: string;
  maxSquads: number;
  registeredSquads: number;
  date: string;
  startTime: string;
  region: string;
  entryFee: string;
  prize: string;
  requirements: string[];
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'check_in' | 'bracket_generated' | 'live' | 'completed' | 'cancelled' | 'archived';
  creatorId: string;
  creatorGamerTag: string;
  communityId: string;
  communityName: string;
  createdAt: string;
  isRegistered: boolean;
}

export interface TournamentCardProps {
  /** Tournament data */
  tournament: Tournament;
  /** On press handler */
  onPress: (tournamentId: string) => void;
  /** On register handler */
  onRegister: (tournamentId: string) => Promise<void>;
  /** On unregister handler */
  onUnregister?: (tournamentId: string) => Promise<void>;
  /** On creator press handler */
  onCreatorPress?: (userId: string) => void;
  /** Show actions */
  showActions?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onPress,
  onRegister,
  onUnregister,
  onCreatorPress,
  showActions = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await onRegister(tournament.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (onUnregister) {
      try {
        setIsLoading(true);
        await onUnregister(tournament.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status: Tournament['status']): string => {
    switch (status) {
      case 'draft':
        return colors.textMuted;
      case 'published':
        return colors.info;
      case 'registration_open':
        return colors.success;
      case 'registration_closed':
        return colors.warning;
      case 'check_in':
        return colors.primary;
      case 'bracket_generated':
        return colors.primary;
      case 'live':
        return colors.error;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'archived':
        return colors.textMuted;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: Tournament['status']): string => {
    switch (status) {
      case 'draft':
        return '📝 Draft';
      case 'published':
        return '📢 Published';
      case 'registration_open':
        return '📋 Registration Open';
      case 'registration_closed':
        return '🔒 Registration Closed';
      case 'check_in':
        return '✅ Check-in';
      case 'bracket_generated':
        return '🧮 Bracket Ready';
      case 'live':
        return '🔴 Live';
      case 'completed':
        return '🏆 Completed';
      case 'cancelled':
        return '❌ Cancelled';
      case 'archived':
        return '📦 Archived';
      default:
        return 'Unknown';
    }
  };

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    padding: 12,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const nameStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  };

  const detailsStyle: ViewStyle = {
    marginTop: 8,
    gap: 4,
  };

  const detailStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
  };

  const prizeStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  };

  const slotsStyle: ViewStyle = {
    marginTop: 8,
  };

  const slotsTextStyle: TextStyle = {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  const creatorStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const creatorTextStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  };

  const isRegistrationOpen = tournament.status === 'registration_open';
  const slotsAvailable = tournament.maxSquads - tournament.registeredSquads;
  const progress = tournament.maxSquads > 0 ? tournament.registeredSquads / tournament.maxSquads : 0;

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onPress(tournament.id)}
      activeOpacity={0.8}
      testID={testID}
    >
      <Card style={{ padding: 0, marginBottom: 0 }} elevation="sm">
        <View style={{ padding: 12 }}>
          <View style={headerStyle}>
            <Text style={nameStyle} numberOfLines={1}>
              🏆 {tournament.name}
            </Text>
            <Tag
              label={getStatusLabel(tournament.status)}
              variant={tournament.status === 'live' ? 'error' : tournament.status === 'registration_open' ? 'success' : tournament.status === 'completed' ? 'primary' : 'neutral'}
              size="sm"
            />
          </View>

          <View style={detailsStyle}>
            <Text style={detailStyle}>🎮 {tournament.game} • {tournament.gameMode}</Text>
            <Text style={detailStyle}>📅 {new Date(tournament.date).toLocaleDateString()} at {tournament.startTime}</Text>
            <Text style={detailStyle}>📍 {tournament.region}</Text>
            <Text style={detailStyle}>🎯 {tournament.format}</Text>
            <Text style={prizeStyle}>💰 {tournament.prize}</Text>
            {tournament.entryFee !== 'Free' && (
              <Text style={detailStyle}>🎫 Entry: {tournament.entryFee}</Text>
            )}
          </View>

          <View style={slotsStyle}>
            <Text style={slotsTextStyle}>
              📋 {tournament.registeredSquads}/{tournament.maxSquads} squads registered
              {slotsAvailable > 0 && ` (${slotsAvailable} slots left)`}
            </Text>
            <ProgressBar
              progress={progress}
              height={4}
              progressColor={slotsAvailable > 0 ? colors.success : colors.error}
            />
          </View>

          <View style={footerStyle}>
            <TouchableOpacity
              style={creatorStyle}
              onPress={() => onCreatorPress?.(tournament.creatorId)}
            >
              <Icon name="user" size={14} color={colors.textMuted} />
              <Text style={creatorTextStyle}>by {tournament.creatorGamerTag}</Text>
            </TouchableOpacity>

            {showActions && (
              <View>
                {isRegistrationOpen && !tournament.isRegistered && slotsAvailable > 0 && (
                  <Button
                    title="Register"
                    variant="primary"
                    size="sm"
                    onPress={handleRegister}
                    loading={isLoading}
                  />
                )}
                {tournament.isRegistered && onUnregister && (
                  <Button
                    title="Registered ✓"
                    variant="success"
                    size="sm"
                    onPress={handleUnregister}
                    loading={isLoading}
                  />
                )}
                {tournament.isRegistered && !onUnregister && (
                  <Tag label="✅ Registered" variant="success" size="sm" />
                )}
                {isRegistrationOpen && slotsAvailable === 0 && (
                  <Tag label="Full" variant="error" size="sm" />
                )}
                {!isRegistrationOpen && !tournament.isRegistered && tournament.status !== 'completed' && (
                  <Tag label="Registration Closed" variant="neutral" size="sm" />
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default TournamentCard;