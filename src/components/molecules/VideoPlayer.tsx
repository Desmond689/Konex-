/**
 * KONEX VideoPlayer Component
 * Billion Dollar Code - Production Ready
 * 
 * A video player component with controls
 * 
 * Usage:
 * <VideoPlayer
 *   uri="https://example.com/video.mp4"
 *   thumbnail="https://example.com/thumbnail.jpg"
 * />
 */

import Slider from '@react-native-community/slider';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../atoms/Icon';
import Text from '../atoms/Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface VideoPlayerProps {
  /** Video URI */
  uri: string;
  /** Thumbnail URI */
  thumbnail?: string;
  /** Auto play */
  autoPlay?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** On load handler */
  onLoad?: () => void;
  /** On error handler */
  onError?: (error: any) => void;
  /** On end handler */
  onEnd?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom control style */
  controlStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  thumbnail,
  autoPlay = false,
  showControls = true,
  onLoad,
  onError,
  onEnd,
  style,
  controlStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showControlsInternal, setShowControlsInternal] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const videoRef = useRef<VideoRef>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLoad = (data: any) => {
    setIsLoading(false);
    setDuration(data.duration);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    onError?.(error);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    onEnd?.();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const showControlsTemporarily = () => {
    setShowControlsInternal(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControlsInternal(false);
      }
    }, 3000);
  };

  const handleSeek = (value: number) => {
    videoRef.current?.seek(value);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerStyle: ViewStyle = {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    ...style,
  };

  const controlsContainerStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...controlStyle,
  };

  const centerControlsStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={containerStyle} testID={testID}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        paused={!isPlaying}
        muted={isMuted}
        resizeMode="contain"
        onLoad={handleLoad}
        onError={handleError}
        onEnd={handleEnd}
        onProgress={(data) => setCurrentTime(data.currentTime)}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={centerControlsStyle}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {/* Thumbnail */}
      {!isLoading && thumbnail && !isPlaying && (
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        />
      )}

      {/* Center Play Button */}
      {!isLoading && showControlsInternal && (
        <TouchableOpacity
          style={centerControlsStyle}
          onPress={togglePlay}
          activeOpacity={0.8}
        >
          <Icon
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={64}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
      )}

      {/* Bottom Controls */}
      {showControls && showControlsInternal && (
        <View style={controlsContainerStyle}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor={colors.primary}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={togglePlay} style={{ marginRight: 12 }}>
                <Icon
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMute} style={{ marginRight: 12 }}>
                <Icon
                  name={isMuted ? 'volume-x' : 'volume-2'}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
            <TouchableOpacity>
              <Icon name="maximize-2" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default VideoPlayer;