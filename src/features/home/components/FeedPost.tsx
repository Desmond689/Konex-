/**
 * KONEX FeedPost Component
 * Billion Dollar Code - Production Ready
 * 
 * A feed post component for the home screen
 * 
 * Usage:
 * <FeedPost
 *   post={post}
 *   onLike={handleLike}
 *   onComment={handleComment}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import {
    Image,
    ImageStyle,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import LikeButton from '../../../components/organisms/feed/LikeButton';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface Post {
  id: string;
  authorId: string;
  authorGamerTag: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  content: string | null;
  postType: 'text' | 'image' | 'clip' | 'poll' | 'lfg' | 'tournament' | 'recruitment';
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  squadId: string | null;
  squadName: string | null;
  squadIcon: string | null;
}

export interface FeedPostProps {
  /** Post data */
  post: Post;
  /** On like handler */
  onLike: (postId: string) => Promise<void>;
  /** On unlike handler */
  onUnlike: (postId: string) => Promise<void>;
  /** On comment handler */
  onComment: (postId: string) => void;
  /** On share handler */
  onShare: (postId: string) => void;
  /** On user press handler */
  onUserPress: (userId: string) => void;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onUserPress,
  onSquadPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showOptions, setShowOptions] = useState(false);

  const handleLike = () => {
    if (post.isLiked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  };

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  };

  const contentStyle: TextStyle = {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingBottom: 8,
  };

  const mediaStyle: ImageStyle = {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceSecondary,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  const actionButtonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  };

  const actionTextStyle: TextStyle = {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  const squadStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const squadNameStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  };

  return (
    <Card style={cardStyle} elevation="sm" testID={testID}>
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => onUserPress(post.authorId)}>
          <Avatar
            source={post.authorAvatarUrl ? { uri: post.authorAvatarUrl } : undefined}
            name={post.authorGamerTag}
            size="md"
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <TouchableOpacity onPress={() => onUserPress(post.authorId)}>
            <Text style={nameStyle}>{post.authorGamerTag}</Text>
          </TouchableOpacity>
          <Text style={usernameStyle}>@{post.authorUsername}</Text>
        </View>
        <Text style={timeStyle}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </Text>
      </View>

      {/* Content */}
      {post.content && <Text style={contentStyle}>{post.content}</Text>}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Image
          source={{ uri: post.mediaUrls[0] }}
          style={mediaStyle}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={actionsStyle}>
        <LikeButton
          isLiked={post.isLiked}
          count={post.likesCount}
          onPress={handleLike}
        />

        <TouchableOpacity
          style={actionButtonStyle}
          onPress={() => onComment(post.id)}
        >
          <Icon name="message-circle" size={20} color={colors.textMuted} />
          {post.commentsCount > 0 && (
            <Text style={actionTextStyle}>{post.commentsCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={actionButtonStyle}
          onPress={() => onShare(post.id)}
        >
          <Icon name="share-2" size={20} color={colors.textMuted} />
          {post.sharesCount > 0 && (
            <Text style={actionTextStyle}>{post.sharesCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={footerStyle}>
        {post.squadId && post.squadName && (
          <TouchableOpacity
            style={squadStyle}
            onPress={() => onSquadPress?.(post.squadId!)}
          >
            <Icon name="users" size={14} color={colors.textMuted} />
            <Text style={squadNameStyle}>{post.squadName}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

export default FeedPost;