/**
 * KONEX SquadCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card displaying squad information with join/leave actions
 * 
 * Usage:
 * <SquadCard
 *   squad={squad}
 *   onJoin={handleJoin}
 *   onPress={handlePress}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import Tag from '../../../components/atoms/Tag';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface Squad {
  id: string;
  name: string;
  tag: string | null;
  description: string | null;
  iconUrl: string | null;
  communityId: string;
  memberCount: number;
  maxMembers: number;
  onlineCount: number;
  joinType: 'open' | 'approval' | 'inviteOnly';
  squadType: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  leaderId: string;
  leaderGamerTag: string;
  leaderAvatarUrl: string | null;
  averageRating: number;
  ratingCount: number;
  isMember: boolean;
  isPending: boolean;
  createdAt: string;
}

export interface SquadCardProps {
  /** Squad data */
  squad: Squad;
  /** On press handler */
  onPress: (squadId: string) => void;
  /** On join handler */
  onJoin: (squadId: string) => Promise<void>;
  /** On leave handler */
  onLeave?: (squadId: string) => Promise<void>;
  /** On cancel request handler */
  onCancelRequest?: (squadId: string) => Promise<void>;
  /** On leader press handler */
  onLeaderPress?: (userId: string) => void;
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

export const SquadCard: React.FC<SquadCardProps> = ({
  squad,
  onPress,
  onJoin,
  onLeave,
  onCancelRequest,
  onLeaderPress,
  showActions = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = React.useState(false);

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      await onJoin(squad.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    if (onLeave) {
      try {
        setIsLoading(true);
        await onLeave(squad.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelRequest = async () => {
    if (onCancelRequest) {
      try {
        setIsLoading(true);
        await onCancelRequest(squad.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  };

  const tagStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  };

  const descriptionStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  };

  const statsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  };

  const statStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
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

  const getJoinButton = () => {
    if (squad.isMember) {
      return (
        <Button
          title="Joined ✓"
          variant="success"
          size="sm"
          onPress={handleLeave}
          loading={isLoading}
        />
      );
    }

    if (squad.isPending) {
      return (
        <Button
          title="Requested"
          variant="outline"
          size="sm"
          onPress={handleCancelRequest}
          loading={isLoading}
        />
      );
    }

    if (squad.joinType === 'inviteOnly') {
      return (
        <Button
          title="Invite Only"
          variant="neutral"
          size="sm"
          disabled
        />
      );
    }

    const label = squad.joinType === 'approval' ? 'Request to Join' : 'Join Squad';
    return (
      <Button
        title={label}
        variant="primary"
        size="sm"
        onPress={handleJoin}
        loading={isLoading}
      />
    );
  };

  const getJoinTypeLabel = (type: Squad['joinType']): string => {
    switch (type) {
      case 'open':
        return '🟢 Open';
      case 'approval':
        return '🟡 Approval';
      case 'inviteOnly':
        return '🔴 Invite Only';
      default:
        return 'Unknown';
    }
  };

  const getSquadTypeColor = (type: Squad['squadType']): string => {
    switch (type) {
      case 'Competitive':
        return colors.error;
      case 'Casual':
        return colors.success;
      case 'Ranked':
        return colors.warning;
      case 'Clan':
        return colors.primary;
      case 'Social':
        return colors.info;
      default:
        return colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onPress(squad.id)}
      activeOpacity={0.8}
      testID={testID}
    >
      <Card style={{ padding: 0, marginBottom: 0 }} elevation="sm">
        <View style={{ padding: 12 }}>
          <View style={headerStyle}>
            <Avatar
              source={squad.iconUrl ? { uri: squad.iconUrl } : undefined}
              name={squad.name}
              size="md"
              shape="rounded"
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={nameStyle} numberOfLines={1}>
                  {squad.name}
                </Text>
                {squad.tag && (
                  <Text style={tagStyle}>[{squad.tag}]</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <Tag
                  label={squad.squadType}
                  variant="neutral"
                  size="xs"
                  textStyle={{ color: getSquadTypeColor(squad.squadType) }}
                />
                <Tag
                  label={getJoinTypeLabel(squad.joinType)}
                  variant="neutral"
                  size="xs"
                />
                {squad.averageRating > 0 && (
                  <Tag
                    label={`⭐ ${squad.averageRating.toFixed(1)}`}
                    variant="neutral"
                    size="xs"
                  />
                )}
              </View>
            </View>
          </View>

          {squad.description && (
            <Text style={descriptionStyle} numberOfLines={2}>
              {squad.description}
            </Text>
          )}

          <View style={statsStyle}>
            <Text style={statStyle}>👥 {squad.memberCount}/{squad.maxMembers}</Text>
            <Text style={statStyle}>🟢 {squad.onlineCount} online</Text>
            <TouchableOpacity
              onPress={() => onLeaderPress?.(squad.leaderId)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={statStyle}>👑 {squad.leaderGamerTag}</Text>
            </TouchableOpacity>
          </View>

          {showActions && (
            <View style={footerStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="calendar" size={14} color={colors.textMuted} />
                <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 4 }}>
                  {new Date(squad.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {getJoinButton()}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default SquadCard;