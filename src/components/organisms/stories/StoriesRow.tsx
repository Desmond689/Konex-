/**
 * KONEX StoriesRow Component
 * Billion Dollar Code - Production Ready
 * 
 * A horizontal scrollable row of story circles
 * 
 * Usage:
 * <StoriesRow
 *   stories={stories}
 *   onStoryPress={handleStoryPress}
 *   onCreateStory={handleCreateStory}
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
import StoryCircle from './StoryCircle';

// ============================================
// 1. TYPES
// ============================================

export interface Story {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  hasViewed: boolean;
  hasStory: boolean;
  createdAt?: string;
}

export interface StoriesRowProps {
  /** List of stories */
  stories: Story[];
  /** On story press handler */
  onStoryPress: (userId: string) => void;
  /** On create story handler */
  onCreateStory: () => void;
  /** Is the current user's story available */
  hasCurrentUserStory?: boolean;
  /** Current user's gamer tag */
  currentUserGamerTag?: string;
  /** Current user's avatar URL */
  currentUserAvatarUrl?: string | null;
  /** Loading state */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const StoriesRow: React.FC<StoriesRowProps> = ({
  stories,
  onStoryPress,
  onCreateStory,
  hasCurrentUserStory = false,
  currentUserGamerTag = 'Your Story',
  currentUserAvatarUrl = null,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.surface,
    ...style,
  };

  const emptyStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  };

  const emptyTextStyle: TextStyle = {
    fontSize: 13,
    color: colors.textMuted,
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ alignItems: 'center', opacity: 0.5 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.surfaceSecondary,
                  marginBottom: 4,
                }}
              />
              <View
                style={{
                  width: 48,
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: colors.surfaceSecondary,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Only show stories that have content (hasStory is true)
  const validStories = stories.filter((s) => s.hasStory);

  // If no stories and no current user story, show empty state
  if (validStories.length === 0 && !hasCurrentUserStory) {
    return (
      <View style={[containerStyle, emptyStyle]} testID={testID}>
        <Text style={emptyTextStyle}>No stories to show</Text>
      </View>
    );
  }

  // Sort: Unseen first, then by most recent
  const sortedStories = [...validStories].sort((a, b) => {
    if (a.hasViewed !== b.hasViewed) {
      return a.hasViewed ? 1 : -1; // Unseen first
    }
    return 0;
  });

  return (
    <View style={containerStyle} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
      >
        {/* Current User's Story */}
        <StoryCircle
          userId="current"
          gamerTag={currentUserGamerTag}
          avatarUrl={currentUserAvatarUrl}
          hasViewed={false}
          hasStory={hasCurrentUserStory}
          isOwnStory={true}
          onPress={onCreateStory}
          size="md"
        />

        {/* Other Stories */}
        {sortedStories.map((story) => (
          <StoryCircle
            key={story.userId}
            userId={story.userId}
            gamerTag={story.gamerTag}
            avatarUrl={story.avatarUrl}
            hasViewed={story.hasViewed}
            hasStory={story.hasStory}
            onPress={() => onStoryPress(story.userId)}
            size="md"
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default StoriesRow;