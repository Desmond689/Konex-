// @ts-nocheck
/**
 * KONEX StoryViewer Component
 * Billion Dollar Code - Production Ready
 * 
 * A full-screen story viewer with navigation and controls
 * 
 * Usage:
 * <StoryViewer
 *   stories={stories}
 *   initialIndex={0}
 *   onClose={handleClose}
 *   onViewStory={handleViewStory}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Icon from '../../../components/atoms/Icon';
import StoryProgressBar from '../../../components/organisms/stories/StoryProgressBar';
import { useTheme } from '../../../hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface StoryView {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  mediaUrl: string;
  type: 'image' | 'video';
  text: string | null;
  createdAt: string;
  expiresAt: string;
  hasViewed: boolean;
}

export interface StoryViewerProps {
  /** List of stories to view */
  stories: StoryView[];
  /** Initial index to start from */
  initialIndex?: number;
  /** On close handler */
  onClose: () => void;
  /** On view story handler */
  onViewStory: (storyId: string) => Promise<void>;
  /** On next user stories handler */
  onNextUser?: () => void;
  /** On previous user stories handler */
  onPrevUser?: () => void;
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

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex = 0,
  onClose,
  onViewStory,
  onNextUser,
  onPrevUser,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const currentStory = stories[currentIndex];
  const totalStories = stories.length;

  const handleComplete = () => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenWidth = SCREEN_WIDTH;
    
    if (locationX < screenWidth / 3) {
      handlePrev();
    } else if (locationX > (screenWidth * 2) / 3) {
      handleNext();
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
  };

  const handleLongPressRelease = () => {
    setIsPaused(false);
  };

  const handleViewStory = async () => {
    if (currentStory && !currentStory.hasViewed) {
      try {
        await onViewStory(currentStory.id);
      } catch (error) {
        console.error('Failed to view story:', error);
      }
    }
  };

  useEffect(() => {
    if (currentStory) {
      setIsImageLoaded(false);
      handleViewStory();
    }
  }, [currentIndex]);

  useEffect(() => {
    // Reset progress when index changes
    setProgress(0);
  }, [currentIndex]);

  if (!currentStory) {
    return null;
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: '#000',
    ...style,
  };

  const headerStyle: ViewStyle = {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  };

  const headerInfoStyle: ViewStyle = {
    flex: 1,
    marginLeft: 10,
  };

  const headerNameStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const headerTimeStyle: TextStyle = {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  };

  const progressContainerStyle: ViewStyle = {
    flexDirection: 'row',
    position: 'absolute',
    top: 44,
    left: 12,
    right: 12,
    gap: 4,
    zIndex: 10,
  };

  const progressItemStyle = (index: number): ViewStyle => ({
    flex: 1,
    height: 2,
    backgroundColor: index <= currentIndex ? colors.primary : 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  });

  const mediaStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imageStyle: ViewStyle = {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  };

  const textOverlayStyle: ViewStyle = {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 8,
  };

  const textOverlayStyleCombined: TextStyle = {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  };

  const closeButtonStyle: ViewStyle = {
    padding: 8,
  };

  const actionButtonsStyle: ViewStyle = {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  };

  const actionButtonStyle: ViewStyle = {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  };

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="fade"
      testID={testID}
    >
      <View style={containerStyle}>
        {/* Progress Bar */}
        <View style={progressContainerStyle}>
          {stories.map((_, index) => (
            <View key={index} style={progressItemStyle(index)}>
              {index === currentIndex && (
                <StoryProgressBar
                  progress={progress}
                  duration={5000}
                  isPaused={isPaused}
                  onComplete={handleComplete}
                />
              )}
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={headerStyle}>
          <TouchableOpacity onPress={onClose} style={closeButtonStyle}>
            <Icon name="x" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Avatar
            source={currentStory.avatarUrl ? { uri: currentStory.avatarUrl } : undefined}
            name={currentStory.gamerTag}
            size="sm"
            shape="circle"
          />

          <View style={headerInfoStyle}>
            <Text style={headerNameStyle}>{currentStory.gamerTag}</Text>
            <Text style={headerTimeStyle}>
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </Text>
          </View>

          <TouchableOpacity onPress={onNextUser} style={{ padding: 8 }}>
            <Icon name="chevron-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Media */}
        <TouchableOpacity
          style={mediaStyle}
          onPress={handleTap}
          onLongPress={handleLongPress}
          onPressOut={handleLongPressRelease}
          activeOpacity={1}
          disabled={loading}
        >
          {currentStory.type === 'image' ? (
            <Image
              source={{ uri: currentStory.mediaUrl }}
              style={imageStyle}
              resizeMode="contain"
              onLoad={() => setIsImageLoaded(true)}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name="play-circle" size={64} color="rgba(255,255,255,0.5)" />
              <Text style={{ color: '#FFFFFF', marginTop: 16 }}>Video placeholder</Text>
            </View>
          )}

          {currentStory.text && (
            <View style={textOverlayStyle}>
              <Text style={textOverlayStyleCombined}>{currentStory.text}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={actionButtonsStyle}>
          {onPrevUser && (
            <TouchableOpacity style={actionButtonStyle} onPress={onPrevUser}>
              <Icon name="chevron-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {onNextUser && (
            <TouchableOpacity style={actionButtonStyle} onPress={onNextUser}>
              <Icon name="chevron-right" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StoryViewer;