/**
 * KONEX CommentItem Component
 * Billion Dollar Code - Production Ready
 * 
 * A single comment item with reply support
 * 
 * Usage:
 * <CommentItem
 *   comment={comment}
 *   onReply={handleReply}
 *   onLike={handleLike}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Icon from '../../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface Comment {
  id: string;
  authorId: string;
  authorGamerTag: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CommentItemProps {
  /** Comment data */
  comment: Comment;
  /** On reply handler */
  onReply?: (commentId: string) => void;
  /** On like handler */
  onLike?: (commentId: string) => void;
  /** On unlike handler */
  onUnlike?: (commentId: string) => void;
  /** On user press handler */
  onUserPress?: (userId: string) => void;
  /** Is the current user the author */
  isAuthor?: boolean;
  /** On delete handler */
  onDelete?: (commentId: string) => void;
  /** Show replies */
  showReplies?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onLike,
  onUnlike,
  onUserPress,
  isAuthor = false,
  onDelete,
  showReplies = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showAllReplies, setShowAllReplies] = useState(false);

  const handleLike = () => {
    if (comment.isLiked) {
      onUnlike?.(comment.id);
    } else {
      onLike?.(comment.id);
    }
  };

  const containerStyle: ViewStyle = {
    paddingVertical: 8,
    paddingHorizontal: 4,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  };

  const nameStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  };

  const usernameStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  };

  const timeStyle: TextStyle = {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8,
  };

  const contentStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 48,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 48,
  };

  const actionButtonStyle: ViewStyle = {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const actionTextStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  };

  const replyContainerStyle: ViewStyle = {
    marginLeft: 48,
    marginTop: 4,
  };

  const renderReply = (reply: Comment) => (
    <CommentItem
      key={reply.id}
      comment={reply}
      onReply={onReply}
      onLike={onLike}
      onUnlike={onUnlike}
      onUserPress={onUserPress}
      showReplies={false}
    />
  );

  const hasReplies = comment.replies && comment.replies.length > 0;
  const displayReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, 2);

  return (
    <View style={containerStyle} testID={testID}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => onUserPress?.(comment.authorId)}>
          <Avatar
            source={comment.authorAvatarUrl ? { uri: comment.authorAvatarUrl } : undefined}
            name={comment.authorGamerTag}
            size="sm"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onUserPress?.(comment.authorId)}>
          <Text style={nameStyle}>{comment.authorGamerTag}</Text>
        </TouchableOpacity>
        <Text style={usernameStyle}>@{comment.authorUsername}</Text>
        <Text style={timeStyle}>
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </Text>
        {isAuthor && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(comment.id)}
            style={{ marginLeft: 8 }}
          >
            <Icon name="x" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={contentStyle}>{comment.content}</Text>

      <View style={actionsStyle}>
        <TouchableOpacity style={actionButtonStyle} onPress={handleLike}>
          <Icon
            name={comment.isLiked ? 'heart' : 'heart'}
            size={16}
            color={comment.isLiked ? colors.error : colors.textMuted}
          />
          {comment.likesCount > 0 && (
            <Text style={actionTextStyle}>{comment.likesCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={actionButtonStyle}
          onPress={() => onReply?.(comment.id)}
        >
          <Icon name="message-circle" size={16} color={colors.textMuted} />
          <Text style={actionTextStyle}>Reply</Text>
        </TouchableOpacity>
      </View>

      {hasReplies && showReplies && (
        <View style={replyContainerStyle}>
          {displayReplies?.map(renderReply)}
          {comment.replies && comment.replies.length > 2 && (
            <TouchableOpacity
              onPress={() => setShowAllReplies(!showAllReplies)}
              style={{ paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '500' }}>
                {showAllReplies
                  ? 'Show less'
                  : `View ${comment.replies.length - 2} more replies`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default CommentItem;