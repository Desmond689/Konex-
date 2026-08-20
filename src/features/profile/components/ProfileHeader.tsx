/**
 * KONEX ProfileHeader Component
 * Billion Dollar Code - Production Ready
 * 
 * The header section of a user profile with avatar, name, and stats
 * 
 * Usage:
 * <ProfileHeader
 *   user={user}
 *   onAvatarPress={handleAvatarPress}
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
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface ProfileUser {
  id: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  onlineStatus: 'online' | 'away' | 'offline';
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  squadId: string | null;
  squadName: string | null;
  squadRole: string | null;
  createdAt: string;
}

export interface ProfileHeaderProps {
  /** User data */
  user: ProfileUser;
  /** On avatar press handler */
  onAvatarPress?: () => void;
  /** On cover press handler */
  onCoverPress?: () => void;
  /** On follower press handler */
  onFollowerPress?: () => void;
  /** On following press handler */
  onFollowingPress?: () => void;
  /** On friend press handler */
  onFriendPress?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onAvatarPress,
  onCoverPress,
  onFollowerPress,
  onFollowingPress,
  onFriendPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const coverStyle: ViewStyle = {
    height: 140,
    backgroundColor: colors.primarySurface,
    position: 'relative',
  };

  const coverImageStyle: ViewStyle = {
    width: '100%',
    height: '100%',
  };

  const avatarContainerStyle: ViewStyle = {
    position: 'absolute',
    bottom: -40,
    left: 16,
  };

  const infoStyle: ViewStyle = {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  };

  const nameStyle: TextStyle = {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  };

  const usernameStyle: TextStyle = {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  };

  const bioStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  };

  const statsStyle: ViewStyle = {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  };

  const statItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const statValueStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  };

  const statLabelStyle: TextStyle = {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  };

  const squadStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  };

  const squadTextStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  };

  const statusColor = user.onlineStatus === 'online' 
    ? colors.success 
    : user.onlineStatus === 'away' 
      ? colors.warning 
      : colors.textMuted;

  const statusLabel = user.onlineStatus === 'online' 
    ? 'Online' 
    : user.onlineStatus === 'away' 
      ? 'Away' 
      : 'Offline';

  return (
    <View style={containerStyle} testID={testID}>
      {/* Cover Image */}
      <TouchableOpacity
        style={coverStyle}
        onPress={onCoverPress}
        activeOpacity={0.8}
        disabled={!onCoverPress}
      >
        {user.coverImageUrl ? (
          <Image source={{ uri: user.coverImageUrl }} style={coverImageStyle} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.primarySurface }} />
        )}
        {onCoverPress && (
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: 6,
              borderRadius: 12,
            }}
          >
            <Icon name="camera" size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar */}
      <View style={avatarContainerStyle}>
        <TouchableOpacity onPress={onAvatarPress} disabled={!onAvatarPress}>
          <Avatar
            source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
            name={user.gamerTag}
            size="xl"
            shape="circle"
            borderWidth={3}
            borderColor={colors.surface}
            online={user.onlineStatus === 'online'}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={infoStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={nameStyle}>{user.gamerTag}</Text>
            <Text style={usernameStyle}>@{user.username}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: statusColor + '20',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColor,
                marginRight: 4,
              }}
            />
            <Text style={{ fontSize: 12, color: statusColor }}>{statusLabel}</Text>
          </View>
        </View>

        {user.bio && <Text style={bioStyle}>{user.bio}</Text>}

        {user.squadId && user.squadName && (
          <View style={squadStyle}>
            <Icon name="users" size={16} color={colors.textMuted} />
            <Text style={squadTextStyle}>
              🛡️ {user.squadName}
              {user.squadRole && ` • ${user.squadRole}`}
            </Text>
          </View>
        )}

        <View style={statsStyle}>
          <TouchableOpacity
            style={statItemStyle}
            onPress={onFollowerPress}
            disabled={!onFollowerPress}
          >
            <Text style={statValueStyle}>{user.followersCount}</Text>
            <Text style={statLabelStyle}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={statItemStyle}
            onPress={onFollowingPress}
            disabled={!onFollowingPress}
          >
            <Text style={statValueStyle}>{user.followingCount}</Text>
            <Text style={statLabelStyle}>Following</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={statItemStyle}
            onPress={onFriendPress}
            disabled={!onFriendPress}
          >
            <Text style={statValueStyle}>{user.friendsCount}</Text>
            <Text style={statLabelStyle}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;