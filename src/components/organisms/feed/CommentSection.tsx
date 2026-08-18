/**
 * KONEX CommentSection Component
 * Billion Dollar Code - Production Ready
 * 
 * A comment section with input and list of comments
 * 
 * Usage:
 * <CommentSection
 *   comments={comments}
 *   onAddComment={handleAddComment}
 *   onLikeComment={handleLikeComment}
 * />
 */

import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Icon from '../../atoms/Icon';
import EmptyState from '../../molecules/EmptyState';
import CommentItem, { Comment } from './CommentItem';

// ============================================
// 1. TYPES
// ============================================

export interface CommentSectionProps {
  /** List of comments */
  comments: Comment[];
  /** Current user avatar */
  userAvatar?: string | null;
  /** Current user gamer tag */
  userGamerTag?: string;
  /** On add comment handler */
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  /** On like comment handler */
  onLikeComment: (commentId: string) => Promise<void>;
  /** On unlike comment handler */
  onUnlikeComment: (commentId: string) => Promise<void>;
  /** On delete comment handler */
  onDeleteComment?: (commentId: string) => Promise<void>;
  /** On user press handler */
  onUserPress?: (userId: string) => void;
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

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  userAvatar,
  userGamerTag,
  onAddComment,
  onLikeComment,
  onUnlikeComment,
  onDeleteComment,
  onUserPress,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(commentText.trim(), replyingTo || undefined);
      setCommentText('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // Focus input
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    maxHeight: 100,
    minHeight: 40,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {comments.length === 0 ? (
        <EmptyState
          title="No Comments"
          description="Be the first to comment!"
          icon="💬"
          style={{ padding: 20 }}
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onReply={handleReply}
              onLike={onLikeComment}
              onUnlike={onUnlikeComment}
              onUserPress={onUserPress}
              onDelete={onDeleteComment}
              isAuthor={false}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {replyingTo && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 4,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textMuted, flex: 1 }}>
              Replying to comment...
            </Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <Icon name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={inputContainerStyle}>
          <Avatar
            source={userAvatar ? { uri: userAvatar } : undefined}
            name={userGamerTag}
            size="sm"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={inputStyle}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!isSubmitting}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!commentText.trim() || isSubmitting}
            style={{
              marginLeft: 8,
              padding: 8,
              borderRadius: 20,
              backgroundColor: commentText.trim() ? colors.primary : colors.disabled,
            }}
          >
            <Icon name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CommentSection;