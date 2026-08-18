/**
 * KONEX LFGCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card displaying an LFG post with details and actions
 * 
 * Usage:
 * <LFGCard
 *   lfg={lfg}
 *   onJoin={handleJoin}
 *   onUserPress={handleUserPress}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import Tag from '../../atoms/Tag';

// ============================================
// 1. TYPES
// ============================================

export interface LFG {
  id: string;
  authorId: string;
  authorGamerTag: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorSkillLevel: string;
  gameMode: string;
  playersNeeded: number;
  currentPartySize: number;
  rankRequirement: string | null;
  micRequired: boolean;
  message: string;
  status: 'active' | 'filled' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  squadId: string | null;
  squadName: string | null;
  squadIcon: string | null;
}

export interface LFGCardProps {
  /** LFG data */
  lfg: LFG;
  /** On join handler */
  onJoin: (lfgId: string) => void;
  /** On user press handler */
  onUserPress: (userId: string) => void;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** Is the current user the author */
  isAuthor?: boolean;
  /** On cancel handler */
  onCancel?: (lfgId: string) => void;
  /** On mark filled handler */
  onMarkFilled?: (lfgId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGCard: React.FC<LFGCardProps> = ({
  lfg,
  onJoin,
  onUserPress,
  onSquadPress,
  isAuthor = false,
  onCancel,
  onMarkFilled,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const isActive = lfg.status === 'active';
  const isFilled = lfg.status === 'filled';
  const isExpired = lfg.status === 'expired';
  const isCancelled = lfg.status === 'cancelled';
  const slotsAvailable = lfg.playersNeeded - lfg.currentPartySize;

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    padding: 12,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const nameStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  };

  const usernameStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const timeStyle: TextStyle = {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 'auto',
  };

  const detailsStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  };

  const messageStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
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

  const partyStyle: TextStyle = {
    fontSize: 13,
    color: colors.text,
  };

  const getStatusColor = (status: LFG['status']): string => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'filled':
        return colors.info;
      case 'expired':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: LFG['status']): string => {
    switch (status) {
      case 'active':
        return '🟢 Active';
      case 'filled':
        return '✅ Filled';
      case 'expired':
        return '⏰ Expired';
      case 'cancelled':
        return '❌ Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card style={cardStyle} elevation="sm" testID={testID}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => onUserPress(lfg.authorId)}>
          <Avatar
            source={lfg.authorAvatarUrl ? { uri: lfg.authorAvatarUrl } : undefined}
            name={lfg.authorGamerTag}
            size="md"
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <TouchableOpacity onPress={() => onUserPress(lfg.authorId)}>
            <Text style={nameStyle}>{lfg.authorGamerTag}</Text>
          </TouchableOpacity>
          <Text style={usernameStyle}>@{lfg.authorUsername} • {lfg.authorSkillLevel}</Text>
        </View>
        <Text style={timeStyle}>
          {formatDistanceToNow(new Date(lfg.createdAt), { addSuffix: true })}
        </Text>
      </View>

      <View style={detailsStyle}>
        <Tag label={`🎮 ${lfg.gameMode}`} variant="primary" size="sm" />
        {lfg.rankRequirement && (
          <Tag label={`🏆 ${lfg.rankRequirement}`} variant="neutral" size="sm" />
        )}
        {lfg.micRequired && (
          <Tag label="🎤 Mic Required" variant="warning" size="sm" />
        )}
        <Tag label={getStatusLabel(lfg.status)} variant={lfg.status === 'active' ? 'success' : lfg.status === 'filled' ? 'info' : 'neutral'} size="sm" />
      </View>

      {lfg.message && (
        <Text style={messageStyle}>{lfg.message}</Text>
      )}

      <View style={footerStyle}>
        <Text style={partyStyle}>
          👥 {lfg.currentPartySize}/{lfg.playersNeeded} players
          {isActive && slotsAvailable > 0 && (
            <Text style={{ color: colors.success }}> ({slotsAvailable} slots left)</Text>
          )}
        </Text>

        {lfg.squadId && lfg.squadName && (
          <TouchableOpacity
            onPress={() => onSquadPress?.(lfg.squadId!)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Icon name="users" size={14} color={colors.textMuted} />
            <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>
              {lfg.squadName}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
        {isActive && !isAuthor && (
          <Button
            title={`Join (${slotsAvailable} slots)`}
            variant="primary"
            size="sm"
            onPress={() => onJoin(lfg.id)}
            style={{ flex: 1 }}
            disabled={slotsAvailable <= 0}
          />
        )}

        {isAuthor && isActive && (
          <>
            <Button
              title="Mark Filled"
              variant="success"
              size="sm"
              onPress={() => onMarkFilled?.(lfg.id)}
              style={{ flex: 1 }}
            />
            <Button
              title="Cancel"
              variant="danger"
              size="sm"
              onPress={() => onCancel?.(lfg.id)}
              style={{ flex: 1 }}
            />
          </>
        )}

        {(isFilled || isExpired || isCancelled) && (
          <Text style={{ fontSize: 13, color: colors.textMuted, fontStyle: 'italic', flex: 1, textAlign: 'center' }}>
            {isFilled ? 'Party is full' : isExpired ? 'LFG expired' : 'Cancelled'}
          </Text>
        )}
      </View>
    </Card>
  );
};

export default LFGCard;