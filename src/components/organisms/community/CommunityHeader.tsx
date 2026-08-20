/**
 * KONEX CommunityHeader Component
 * Billion Dollar Code - Production Ready
 * 
 * The header component for a community page
 * 
 * Usage:
 * <CommunityHeader
 *   community={community}
 *   onBack={handleBack}
 *   onSearch={handleSearch}
 * />
 */

import React from 'react';
import {
    Image,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    ImageStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Badge from '../../atoms/Badge';
import Icon from '../../atoms/Icon';

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
  memberCount: number;
  onlineCount: number;
  isVerified: boolean;
  isOfficial: boolean;
  isMember: boolean;
}

export interface CommunityHeaderProps {
  /** Community data */
  community: Community;
  /** On back press handler */
  onBack?: () => void;
  /** On search press handler */
  onSearch?: () => void;
  /** On notification press handler */
  onNotification?: () => void;
  /** On share press handler */
  onShare?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  onBack,
  onSearch,
  onNotification,
  onShare,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...style,
  };

  const coverStyle: ViewStyle = {
    width: '100%',
    height: 120,
    backgroundColor: colors.primarySurface,
    position: 'relative',
  };

  const coverImageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
  };

  const overlayStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  };

  const avatarContainerStyle: ViewStyle = {
    marginRight: 12,
  };

  const infoStyle: ViewStyle = {
    flex: 1,
  };

  const nameStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const gameNameStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  };

  const verifiedBadgeStyle: ViewStyle = {
    marginLeft: 6,
  };

  const statsStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  };

  const actionButtonStyle: ViewStyle = {
    padding: 8,
    marginRight: 8,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {/* Cover Image */}
      <View style={coverStyle}>
        {community.coverImageUrl ? (
          <Image
            source={{ uri: community.coverImageUrl }}
            style={coverImageStyle as any}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.primarySurface }} />
        )}
        <View style={overlayStyle}>
          <View style={avatarContainerStyle}>
            <Avatar
              source={community.gameLogoUrl ? { uri: community.gameLogoUrl } : undefined}
              name={community.gameName}
              size="lg"
              shape="rounded"
            />
          </View>
          <View style={infoStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={nameStyle}>{community.name}</Text>
              {community.isVerified && (
                <Badge
                  label="✓"
                  variant="primary"
                  size="xs"
                  style={verifiedBadgeStyle}
                />
              )}
              {community.isOfficial && (
                <Badge
                  label="Official"
                  variant="primary"
                  size="xs"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <Text style={gameNameStyle}>{community.gameName}</Text>
            <Text style={statsStyle}>
              👥 {community.memberCount.toLocaleString()} members • 🟢 {community.onlineCount} online
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={actionsStyle}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={actionButtonStyle}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {onSearch && (
          <TouchableOpacity onPress={onSearch} style={actionButtonStyle}>
            <Icon name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {onNotification && (
          <TouchableOpacity onPress={onNotification} style={actionButtonStyle}>
            <Icon name="bell" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {onShare && (
          <TouchableOpacity onPress={onShare} style={actionButtonStyle}>
            <Icon name="share-2" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CommunityHeader;