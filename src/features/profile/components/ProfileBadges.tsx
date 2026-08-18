/**
 * KONEX ProfileBadges Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays badges earned by a user
 * 
 * Usage:
 * <ProfileBadges
 *   badges={badges}
 *   featuredBadges={featuredBadges}
 *   onSelectBadge={handleSelectBadge}
 * />
 */

import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Modal from '../../../components/atoms/Modal';
import Tag from '../../../components/atoms/Tag';
import EmptyState from '../../../components/molecules/EmptyState';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface Badge {
  id: string;
  name: string;
  category: 'identity' | 'activity' | 'community' | 'competition' | 'milestone';
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface ProfileBadgesProps {
  /** List of all badges */
  badges: Badge[];
  /** List of featured badge IDs */
  featuredBadgeIds: string[];
  /** On select badge handler */
  onSelectBadge?: (badge: Badge) => void;
  /** On feature badge handler */
  onFeatureBadge?: (badgeId: string) => void;
  /** Is the current user */
  isOwn?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  badges,
  featuredBadgeIds,
  onSelectBadge,
  onFeatureBadge,
  isOwn = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const categoryColors: Record<Badge['category'], string> = {
    identity: colors.primary,
    activity: colors.info,
    community: colors.success,
    competition: colors.warning,
    milestone: colors.secondary,
  };

  const categoryLabels: Record<Badge['category'], string> = {
    identity: 'Identity',
    activity: 'Activity',
    community: 'Community',
    competition: 'Competition',
    milestone: 'Milestone',
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

  const getBadgeIcon = (badge: Badge): string => {
    return badgeEmojis[badge.id] || '🏅';
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalVisible(true);
    if (onSelectBadge) {
      onSelectBadge(badge);
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: 16,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  };

  const badgeGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  };

  const badgeItemStyle = (isEarned: boolean): ViewStyle => ({
    alignItems: 'center',
    width: 72,
    padding: 8,
    borderRadius: 8,
    backgroundColor: isEarned ? colors.surfaceSecondary : colors.surfaceSecondary + '40',
    opacity: isEarned ? 1 : 0.5,
    borderWidth: 1,
    borderColor: isEarned ? colors.primary : colors.border,
  });

  const badgeIconStyle = (isEarned: boolean): ViewStyle => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isEarned ? colors.primarySurface : colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  });

  const badgeNameStyle: TextStyle = {
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  };

  const badgeCategoryStyle: TextStyle = {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  };

  const featuredBadges = badges.filter((b) => featuredBadgeIds.includes(b.id) && b.earned);
  const earnedBadges = badges.filter((b) => b.earned && !featuredBadgeIds.includes(b.id));
  const unearnedBadges = badges.filter((b) => !b.earned);

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      {/* Featured Badges */}
      {featuredBadges.length > 0 && (
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>⭐ Featured Badges</Text>
          <View style={badgeGridStyle}>
            {featuredBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={badgeItemStyle(true)}
                onPress={() => handleBadgePress(badge)}
              >
                <View style={badgeIconStyle(true)}>
                  <Text style={{ fontSize: 24 }}>{getBadgeIcon(badge)}</Text>
                </View>
                <Text style={badgeNameStyle} numberOfLines={1}>
                  {badge.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>🏅 Earned Badges ({earnedBadges.length})</Text>
          <View style={badgeGridStyle}>
            {earnedBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={badgeItemStyle(true)}
                onPress={() => handleBadgePress(badge)}
              >
                <View style={badgeIconStyle(true)}>
                  <Text style={{ fontSize: 24 }}>{getBadgeIcon(badge)}</Text>
                </View>
                <Text style={badgeNameStyle} numberOfLines={1}>
                  {badge.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Unearned Badges */}
      {unearnedBadges.length > 0 && isOwn && (
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>🔒 Locked Badges</Text>
          <View style={badgeGridStyle}>
            {unearnedBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={badgeItemStyle(false)}
                onPress={() => handleBadgePress(badge)}
              >
                <View style={badgeIconStyle(false)}>
                  <Text style={{ fontSize: 24, opacity: 0.5 }}>❓</Text>
                </View>
                <Text style={badgeNameStyle} numberOfLines={1}>
                  {badge.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {badges.length === 0 && (
        <EmptyState
          title="No Badges"
          description={isOwn ? "You haven't earned any badges yet" : "This user hasn't earned any badges yet"}
          icon="🏅"
        />
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          title={selectedBadge.name}
          contentStyle={{ maxWidth: 380 }}
        >
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: selectedBadge.earned ? colors.primarySurface : colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 40 }}>
                {selectedBadge.earned ? getBadgeIcon(selectedBadge) : '❓'}
              </Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              {selectedBadge.name}
            </Text>

            <Tag
              label={categoryLabels[selectedBadge.category]}
              variant="neutral"
              size="sm"
              style={{ marginTop: 4 }}
            />

            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
              {selectedBadge.description}
            </Text>

            {selectedBadge.earned && selectedBadge.earnedAt && (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
                Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
              </Text>
            )}

            {!selectedBadge.earned && (
              <Text style={{ fontSize: 13, color: colors.warning, marginTop: 8 }}>
                🔒 Not yet earned
              </Text>
            )}

            {isOwn && selectedBadge.earned && (
              <Button
                title={featuredBadgeIds.includes(selectedBadge.id) ? 'Remove from Featured' : 'Feature Badge'}
                variant={featuredBadgeIds.includes(selectedBadge.id) ? 'outline' : 'primary'}
                size="sm"
                onPress={() => {
                  if (onFeatureBadge) {
                    onFeatureBadge(selectedBadge.id);
                    setIsModalVisible(false);
                  }
                }}
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

export default ProfileBadges;