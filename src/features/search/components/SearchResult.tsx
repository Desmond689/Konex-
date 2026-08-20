/**
 * KONEX SearchResult Component
 * Billion Dollar Code - Production Ready
 * 
 * A single search result item with type-specific rendering
 * 
 * Usage:
 * <SearchResult
 *   result={result}
 *   type="user"
 *   onPress={handlePress}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
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
import Tag from '../../../components/atoms/Tag';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type SearchResultType = 'user' | 'squad' | 'post' | 'community' | 'hashtag';

export interface SearchResultData {
  id: string;
  type: SearchResultType;
  // User fields
  gamerTag?: string;
  username?: string;
  avatarUrl?: string | null;
  onlineStatus?: 'online' | 'away' | 'offline';
  skillLevel?: string;
  role?: string;
  // Squad fields
  name?: string;
  tag?: string | null;
  iconUrl?: string | null;
  memberCount?: number;
  onlineCount?: number;
  description?: string | null;
  squadType?: string;
  // Post fields
  content?: string | null;
  authorGamerTag?: string;
  authorAvatarUrl?: string | null;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  // Community fields
  gameName?: string;
  gameLogoUrl?: string | null;
  memberCountCommunity?: number;
  // Hashtag fields
  hashtag?: string;
  postCount?: number;
}

export interface SearchResultProps {
  /** Result data */
  result: SearchResultData;
  /** Type of result */
  type: SearchResultType;
  /** On press handler */
  onPress: (result: SearchResultData) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SearchResult: React.FC<SearchResultProps> = ({
  result,
  type,
  onPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...style,
  };

  const infoStyle: ViewStyle = {
    flex: 1,
    marginLeft: 12,
  };

  const nameStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  };

  const detailStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  const renderUser = () => {
    const user = result;

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(result)}
        activeOpacity={0.7}
        testID={testID}
      >
        <Avatar
          source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
          name={user.gamerTag}
          size="md"
          online={user.onlineStatus === 'online'}
        />
        <View style={infoStyle}>
          <Text style={nameStyle}>{user.gamerTag}</Text>
          <Text style={subtitleStyle}>@{user.username}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
            {user.skillLevel && (
              <Tag label={`📊 ${user.skillLevel}`} variant="neutral" size="xs" />
            )}
            {user.role && (
              <Tag label={`🎯 ${user.role}`} variant="neutral" size="xs" />
            )}
            {user.onlineStatus === 'online' && (
              <Tag label="🟢 Online" variant="success" size="xs" />
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderSquad = () => {
    const squad = result;

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(result)}
        activeOpacity={0.7}
        testID={testID}
      >
        <Avatar
          source={squad.iconUrl ? { uri: squad.iconUrl } : undefined}
          name={squad.name}
          size="md"
          shape="rounded"
        />
        <View style={infoStyle}>
          <Text style={nameStyle}>
            {squad.name}
            {squad.tag && <Text style={{ fontSize: 13, color: colors.textMuted }}> [{squad.tag}]</Text>}
          </Text>
          <Text style={subtitleStyle}>{squad.squadType || 'Squad'}</Text>
          <Text style={detailStyle}>
            👥 {squad.memberCount || 0} members • 🟢 {squad.onlineCount || 0} online
          </Text>
          {squad.description && (
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
              {squad.description}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderPost = () => {
    const post = result;

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(result)}
        activeOpacity={0.7}
        testID={testID}
      >
        <Avatar
          source={post.authorAvatarUrl ? { uri: post.authorAvatarUrl } : undefined}
          name={post.authorGamerTag}
          size="sm"
        />
        <View style={infoStyle}>
          <Text style={nameStyle}>{post.authorGamerTag}</Text>
          <Text style={{ fontSize: 13, color: colors.text, marginTop: 2 }} numberOfLines={2}>
            {post.content}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
            <Text style={detailStyle}>❤️ {post.likesCount || 0}</Text>
            <Text style={detailStyle}>💬 {post.commentsCount || 0}</Text>
            {post.createdAt && (
              <Text style={detailStyle}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Text>
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderCommunity = () => {
    const community = result;

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(result)}
        activeOpacity={0.7}
        testID={testID}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: colors.primarySurface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {community.gameLogoUrl ? (
            <Image
              source={{ uri: community.gameLogoUrl }}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 24 }}>🎮</Text>
          )}
        </View>
        <View style={infoStyle}>
          <Text style={nameStyle}>{community.name}</Text>
          <Text style={subtitleStyle}>{community.gameName}</Text>
          <Text style={detailStyle}>
            👥 {community.memberCountCommunity || 0} members
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderHashtag = () => {
    const hashtag = result;

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(result)}
        activeOpacity={0.7}
        testID={testID}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primarySurface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 24 }}>#️⃣</Text>
        </View>
        <View style={infoStyle}>
          <Text style={nameStyle}>#{hashtag.hashtag}</Text>
          <Text style={detailStyle}>
            {hashtag.postCount || 0} posts
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  switch (type) {
    case 'user':
      return renderUser();
    case 'squad':
      return renderSquad();
    case 'post':
      return renderPost();
    case 'community':
      return renderCommunity();
    case 'hashtag':
      return renderHashtag();
    default:
      return null;
  }
};

export default SearchResult;