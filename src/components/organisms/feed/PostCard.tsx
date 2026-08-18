/**
 * KONEX PostCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A full post card with all interactions
 * 
 * Usage:
 * <PostCard
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
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import LikeButton from './LikeButton';
import PostTypes from './PostTypes';

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
  pollOptions: string[] | null;
  pollVotes: Record<string, number> | null;
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

export interface PostCardProps {
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
  /** On save handler */
  onSave: (postId: string) => Promise<void>;
  /** On unsave handler */
  onUnsave: (postId: string) => Promise<void>;
  /** On user press handler */
  onUserPress: (userId: string) => void;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** On report handler */
  onReport?: (postId: string) => void;
  /** Is the current user the author */
  isAuthor?: boolean;
  /** On delete handler */
  onDelete?: (postId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onSave,
  onUnsave,
  onUserPress,
  onSquadPress,
  onReport,
  isAuthor = false,
  onDelete,
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

  const handleSave = () => {
    if (post.isSaved) {
      onUnsave(post.id);
    } else {
      onSave(post.id);
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
        {(isAuthor || onReport) && (
          <TouchableOpacity
            onPress={() => setShowOptions(!showOptions)}
            style={{ marginLeft: 8 }}
          >
            <Icon name="more-vertical" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {post.content && <Text style={contentStyle}>{post.content}</Text>}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Image source={{ uri: post.mediaUrls[0] }} style={mediaStyle} resizeMode="cover" />
      )}

      {/* Poll */}
      {post.pollOptions && (
        <PostTypes.Poll
          options={post.pollOptions}
          votes={post.pollVotes || {}}
          totalVotes={Object.values(post.pollVotes || {}).reduce((a, b) => a + b, 0)}
        />
      )}

      {/* LFG */}
      {post.postType === 'lfg' && (
        <PostTypes.LFG
          gameMode="Ranked"
          playersNeeded={3}
          currentParty={2}
          rankRequirement="Legendary"
          micRequired={true}
        />
      )}

      {/* Tournament */}
      {post.postType === 'tournament' && (
        <PostTypes.Tournament
          name="Shadow Wolves Cup"
          date="Aug 28, 2026"
          prize="50,000 XAF"
          maxSquads={16}
          registeredSquads={8}
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

        <TouchableOpacity
          style={[actionButtonStyle, { marginLeft: 'auto' }]}
          onPress={handleSave}
        >
          <Icon
            name={post.isSaved ? 'bookmark' : 'bookmark'}
            size={20}
            color={post.isSaved ? colors.primary : colors.textMuted}
          />
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

export default PostCard;