/**
 * KONEX CommunityProfile Component
 * Billion Dollar Code - Production Ready
 * 
 * The profile/overview section for a community
 * 
 * Usage:
 * <CommunityProfile
 *   community={community}
 *   onEdit={handleEdit}
 * />
 */

import React from 'react';
import {
    ScrollView,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Tag from '../../atoms/Tag';
import CommunityJoinButton from './CommunityJoinButton';

// ============================================
// 1. TYPES
// ============================================

export interface Community {
  id: string;
  name: string;
  gameName: string;
  gameLogoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  rules: string[];
  memberCount: number;
  onlineCount: number;
  isVerified: boolean;
  isOfficial: boolean;
  isMember: boolean;
  createdAt: string;
}

export interface CommunityProfileProps {
  /** Community data */
  community: Community;
  /** On join handler */
  onJoin: () => Promise<void>;
  /** On leave handler */
  onLeave: () => Promise<void>;
  /** On edit handler */
  onEdit?: () => void;
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

export const CommunityProfile: React.FC<CommunityProfileProps> = ({
  community,
  onJoin,
  onLeave,
  onEdit,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  };

  const descriptionStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  };

  const statItemStyle: ViewStyle = {
    alignItems: 'center',
    flex: 1,
  };

  const statValueStyle: TextStyle = {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  };

  const statLabelStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  const ruleItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  };

  const ruleTextStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: 8,
  };

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      {/* Description */}
      {community.description && (
        <Card style={{ marginBottom: 12 }}>
          <Text style={sectionTitleStyle}>About</Text>
          <Text style={descriptionStyle}>{community.description}</Text>
        </Card>
      )}

      {/* Stats */}
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={statItemStyle}>
            <Text style={statValueStyle}>{community.memberCount.toLocaleString()}</Text>
            <Text style={statLabelStyle}>Members</Text>
          </View>
          <View style={statItemStyle}>
            <Text style={statValueStyle}>{community.onlineCount}</Text>
            <Text style={statLabelStyle}>Online</Text>
          </View>
          <View style={statItemStyle}>
            <Text style={statValueStyle}>
              {new Date(community.createdAt).toLocaleDateString()}
            </Text>
            <Text style={statLabelStyle}>Created</Text>
          </View>
        </View>
      </Card>

      {/* Join Button */}
      <Card style={{ marginBottom: 12 }}>
        <CommunityJoinButton
          isMember={community.isMember}
          onJoin={onJoin}
          onLeave={onLeave}
          loading={loading}
        />
        {onEdit && community.isMember && (
          <Button
            title="Edit Community"
            variant="ghost"
            size="sm"
            onPress={onEdit}
            style={{ marginTop: 8 }}
          />
        )}
      </Card>

      {/* Rules */}
      {community.rules && community.rules.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <Text style={sectionTitleStyle}>📋 Rules</Text>
          {community.rules.map((rule, index) => (
            <View key={index} style={ruleItemStyle}>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                {index + 1}.
              </Text>
              <Text style={ruleTextStyle}>{rule}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Verification Badges */}
      {(community.isVerified || community.isOfficial) && (
        <Card style={{ marginBottom: 12 }}>
          <Text style={sectionTitleStyle}>🏷️ Badges</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {community.isVerified && (
              <Tag label="✅ Verified" variant="primary" size="md" />
            )}
            {community.isOfficial && (
              <Tag label="⭐ Official" variant="primary" size="md" />
            )}
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

export default CommunityProfile;