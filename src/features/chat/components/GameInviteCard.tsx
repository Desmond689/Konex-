/**
 * KONEX GameInviteCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card for displaying game invites in chat
 * 
 * Usage:
 * <GameInviteCard
 *   gameName="COD Mobile"
 *   mode="Ranked MP"
 *   players={3}
 *   maxPlayers={5}
 *   map="Standoff"
 *   onJoin={() => {}}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface GameInviteCardProps {
  /** Game name */
  gameName: string;
  /** Game mode */
  mode: string;
  /** Current number of players */
  players: number;
  /** Maximum number of players */
  maxPlayers: number;
  /** Map name */
  map?: string;
  /** Rank requirement */
  rankRequirement?: string;
  /** Mic required */
  micRequired?: boolean;
  /** On join handler */
  onJoin: () => void;
  /** On decline handler */
  onDecline?: () => void;
  /** Is the invite expired */
  isExpired?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const GameInviteCard: React.FC<GameInviteCardProps> = ({
  gameName,
  mode,
  players,
  maxPlayers,
  map,
  rankRequirement,
  micRequired = false,
  onJoin,
  onDecline,
  isExpired = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    padding: 12,
    marginVertical: 4,
    maxWidth: 300,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  };

  const titleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  };

  const detailStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  };

  const playersStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  };

  return (
    <Card style={containerStyle} elevation="sm" testID={testID}>
      <View style={headerStyle}>
        <Icon name="gamepad-2" size={24} color={colors.primary} />
        <Text style={titleStyle}>{gameName}</Text>
      </View>

      <Text style={detailStyle}>🎯 {mode}</Text>
      {map && <Text style={detailStyle}>🗺️ {map}</Text>}
      {rankRequirement && <Text style={detailStyle}>🏆 {rankRequirement}</Text>}
      {micRequired && <Text style={detailStyle}>🎤 Mic Required</Text>}

      <Text style={playersStyle}>
        👥 {players}/{maxPlayers} players
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {isExpired ? (
          <Text style={{ fontSize: 14, color: colors.error, fontWeight: '600' }}>
            ⏰ Invite Expired
          </Text>
        ) : (
          <>
            <Button
              title="Join"
              variant="primary"
              size="sm"
              onPress={onJoin}
              style={{ flex: 1, marginRight: 8 }}
            />
            {onDecline && (
              <Button
                title="Decline"
                variant="ghost"
                size="sm"
                onPress={onDecline}
                style={{ flex: 1 }}
              />
            )}
          </>
        )}
      </View>
    </Card>
  );
};

export default GameInviteCard;