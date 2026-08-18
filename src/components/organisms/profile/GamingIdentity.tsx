/**
 * KONEX GamingIdentity Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays a user's gaming identity with badges and stats
 * 
 * Usage:
 * <GamingIdentity
 *   user={user}
 *   onEdit={handleEdit}
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
import Card from '../../atoms/Card';
import Tag from '../../atoms/Tag';

// ============================================
// 1. TYPES
// ============================================

export interface GamingIdentityData {
  gameId: string;
  gameName: string;
  gamingStyle: string;
  skillLevel: string;
  role: string;
  squadId: string | null;
  squadName: string | null;
  squadRole: string | null;
  badges: string[];
  featuredBadges: string[];
}

export interface GamingIdentityProps {
  /** Gaming identity data */
  identity: GamingIdentityData;
  /** Is the current user */
  isOwn?: boolean;
  /** On edit handler */
  onEdit?: () => void;
  /** On squad press handler */
  onSquadPress?: () => void;
  /** On badges press handler */
  onBadgesPress?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const GamingIdentity: React.FC<GamingIdentityProps> = ({
  identity,
  isOwn = false,
  onEdit,
  onSquadPress,
  onBadgesPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const sectionStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  };

  const labelStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  };

  const valueStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
  };

  const cardStyle: ViewStyle = {
    padding: 16,
    marginBottom: 12,
  };

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  };

  const badgeGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  };

  const badgeItemStyle: ViewStyle = {
    alignItems: 'center',
    width: 48,
  };

  const badgeIconStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const badgeLabelStyle: TextStyle = {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  };

  const badgeEmojis: Record<string, string> = {
    sniper: '🎯',
    rusher: '🏃',
    support: '🛡️',
    flex: '🔄',
    clutch_king: '🏆',
    team_player: '🤝',
    content_creator: '🎥',
    engager: '❤️',
    commentator: '💬',
    helpful: '🌟',
    mentor: '📚',
    newbie: '🌱',
    loyal: '🎂',
    veteran: '👑',
  };

  return (
    <View style={containerStyle} testID={testID}>
      {/* Game & Style */}
      <Card style={cardStyle} elevation="sm">
        <View style={rowStyle}>
          <Text style={labelStyle}>Game</Text>
          <Text style={valueStyle}>🎮 {identity.gameName}</Text>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Style</Text>
          <Text style={valueStyle}>{identity.gamingStyle}</Text>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Skill Level</Text>
          <Text style={valueStyle}>{identity.skillLevel}</Text>
        </View>
        <View style={rowStyle}>
          <Text style={labelStyle}>Role</Text>
          <Text style={valueStyle}>{identity.role}</Text>
        </View>
      </Card>

      {/* Squad */}
      {identity.squadId && identity.squadName && (
        <Card style={cardStyle} elevation="sm">
          <View style={rowStyle}>
            <View>
              <Text style={labelStyle}>Squad</Text>
              <TouchableOpacity onPress={onSquadPress}>
                <Text style={[valueStyle, { color: colors.primary, fontWeight: '600' }]}>
                  🛡️ {identity.squadName}
                </Text>
              </TouchableOpacity>
            </View>
            {identity.squadRole && (
              <Tag
                label={identity.squadRole}
                variant="primary"
                size="sm"
              />
            )}
          </View>
        </Card>
      )}

      {/* Badges */}
      {identity.featuredBadges && identity.featuredBadges.length > 0 && (
        <Card style={cardStyle} elevation="sm">
          <View style={rowStyle}>
            <Text style={labelStyle}>Featured Badges</Text>
            {isOwn && onBadgesPress && (
              <TouchableOpacity onPress={onBadgesPress}>
                <Text style={{ fontSize: 12, color: colors.primary }}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={badgeGridStyle}>
            {identity.featuredBadges.slice(0, 6).map((badgeId) => (
              <View key={badgeId} style={badgeItemStyle}>
                <View style={badgeIconStyle}>
                  <Text style={{ fontSize: 20 }}>
                    {badgeEmojis[badgeId] || '🏅'}
                  </Text>
                </View>
                <Text style={badgeLabelStyle} numberOfLines={1}>
                  {badgeId.replace('_', ' ')}
                </Text>
              </View>
            ))}
            {identity.featuredBadges.length > 6 && (
              <TouchableOpacity
                style={badgeItemStyle}
                onPress={onBadgesPress}
              >
                <View style={[badgeIconStyle, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={{ fontSize: 16, color: colors.primary }}>
                    +{identity.featuredBadges.length - 6}
                  </Text>
                </View>
                <Text style={badgeLabelStyle}>More</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {isOwn && onEdit && (
        <Button
          title="Edit Gaming Identity"
          variant="outline"
          onPress={onEdit}
          fullWidth
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  );
};

export default GamingIdentity;