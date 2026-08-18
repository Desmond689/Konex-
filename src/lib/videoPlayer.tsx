/**
 * KONEX VideoPlayer Library
 * Billion Dollar Code - Production Ready
 * 
 * Video player utilities with controls and state management
 * 
 * Usage:
 * import { useVideoPlayer, VideoPlayer } from '@lib/videoPlayer';
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface VideoPlayerState {
  /** Is video loading */
  isLoading: boolean;
  /** Is video playing */
  isPlaying: boolean;
  /** Is video paused */
  isPaused: boolean;
  /** Current position in seconds */
  position: number;
  /** Total duration in seconds */
  duration: number;
  /** Is video buffering */
  isBuffering: boolean;
  /** Is video muted */
  isMuted: boolean;
  /** Is video looping */
  isLooping: boolean;
  /** Is video in fullscreen */
  isFullscreen: boolean;
  /** Playback rate */
  rate: number;
  /** Volume (0-1) */
  volume: number;
}

export interface VideoPlayerControls {
  /** Play the video */
  play: () => Promise<void>;
  /** Pause the video */
  pause: () => Promise<void>;
  /** Toggle play/pause */
  togglePlay: () => Promise<void>;
  /** Seek to a specific time */
  seekTo: (position: number) => Promise<void>;
  /** Toggle mute */
  toggleMute: () => Promise<void>;
  /** Toggle loop */
  toggleLoop: () => Promise<void>;
  /** Toggle fullscreen */
  toggleFullscreen: () => Promise<void>;
  /** Set playback rate */
  setRate: (rate: number) => Promise<void>;
  /** Set volume */
  setVolume: (volume: number) => Promise<void>;
  /** Replay the video */
  replay: () => Promise<void>;
  /** Load a new video */
  loadVideo: (uri: string) => Promise<void>;
  /** Unload the video */
  unloadVideo: () => Promise<void>;
}

export interface UseVideoPlayerReturn extends VideoPlayerState, VideoPlayerControls {
  /** Reference to the video component */
  videoRef: React.RefObject<Video>;
  /** Video status */
  status: AVPlaybackStatus | null;
}

export interface VideoPlayerProps {
  /** Video URI */
  uri?: string;
  /** Autoplay */
  autoplay?: boolean;
  /** Loop */
  loop?: boolean;
  /** Muted */
  muted?: boolean;
  /** Resize mode */
  resizeMode?: ResizeMode;
  /** Volume (0-1) */
  volume?: number;
  /** Playback rate */
  rate?: number;
  /** On play status change */
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  /** On error */
  onError?: (error: Error) => void;
  /** On load */
  onLoad?: () => void;
}

// ============================================
// 2. HOOK
// ============================================

/**
 * Hook for video player
 */
export const useVideoPlayer = (props: VideoPlayerProps = {}): UseVideoPlayerReturn => {
  const {
    uri: initialUri,
    autoplay = false,
    loop = false,
    muted = false,
    resizeMode = ResizeMode.CONTAIN,
    volume: initialVolume = 1,
    rate: initialRate = 1,
    onPlaybackStatusUpdate,
    onError,
    onLoad,
  } = props;

  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    position: 0,
    duration: 0,
    isBuffering: false,
    isMuted: muted,
    isLooping: loop,
    isFullscreen: false,
    rate: initialRate,
    volume: initialVolume,
  });

  // ============================================
  // VIDEO METHODS
  // ============================================

  const play = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.playAsync();
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
        logger.debug('▶️ Video playing');
      }
    } catch (error) {
      logger.error('❌ Failed to play video', { error });
      onError?.(error as Error);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
        logger.debug('⏸️ Video paused');
      }
    } catch (error) {
      logger.error('❌ Failed to pause video', { error });
      onError?.(error as Error);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seekTo = useCallback(async (position: number) => {
    try {
      if (videoRef.current) {
        const positionMillis = position * 1000;
        await videoRef.current.setPositionAsync(positionMillis);
        setState((prev) => ({ ...prev, position }));
        logger.debug('⏭️ Video seeked', { position });
      }
    } catch (error) {
      logger.error('❌ Failed to seek video', { error });
      onError?.(error as Error);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      if (videoRef.current) {
        const newMuted = !state.isMuted;
        await videoRef.current.setIsMutedAsync(newMuted);
        setState((prev) => ({ ...prev, isMuted: newMuted }));
        logger.debug('🔇 Video muted', { muted: newMuted });
      }
    } catch (error) {
      logger.error('❌ Failed to toggle mute', { error });
      onError?.(error as Error);
    }
  }, [state.isMuted]);

  const toggleLoop = useCallback(async () => {
    try {
      if (videoRef.current) {
        const newLoop = !state.isLooping;
        await videoRef.current.setIsLoopingAsync(newLoop);
        setState((prev) => ({ ...prev, isLooping: newLoop }));
        logger.debug('🔁 Video loop', { looping: newLoop });
      }
    } catch (error) {
      logger.error('❌ Failed to toggle loop', { error });
      onError?.(error as Error);
    }
  }, [state.isLooping]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (videoRef.current) {
        // Fullscreen implementation depends on platform
        const newFullscreen = !state.isFullscreen;
        setState((prev) => ({ ...prev, isFullscreen: newFullscreen }));
        logger.debug('⛶ Fullscreen toggled', { fullscreen: newFullscreen });
      }
    } catch (error) {
      logger.error('❌ Failed to toggle fullscreen', { error });
      onError?.(error as Error);
    }
  }, [state.isFullscreen]);

  const setRate = useCallback(async (rate: number) => {
    try {
      if (videoRef.current) {
        await videoRef.current.setRateAsync(rate, true);
        setState((prev) => ({ ...prev, rate }));
        logger.debug('⏱️ Rate set', { rate });
      }
    } catch (error) {
      logger.error('❌ Failed to set rate', { error });
      onError?.(error as Error);
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    try {
      if (videoRef.current) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        await videoRef.current.setVolumeAsync(clampedVolume);
        setState((prev) => ({ ...prev, volume: clampedVolume }));
        logger.debug('🔊 Volume set', { volume: clampedVolume });
      }
    } catch (error) {
      logger.error('❌ Failed to set volume', { error });
      onError?.(error as Error);
    }
  }, []);

  const replay = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.replayAsync();
        setState((prev) => ({ ...prev, position: 0, isPlaying: true, isPaused: false }));
        logger.debug('🔁 Video replaying');
      }
    } catch (error) {
      logger.error('❌ Failed to replay video', { error });
      onError?.(error as Error);
    }
  }, []);

  const loadVideo = useCallback(async (uri: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      if (videoRef.current) {
        await videoRef.current.loadAsync(
          { uri },
          {
            shouldPlay: autoplay,
            isLooping: loop,
            isMuted: muted,
            resizeMode,
            volume: initialVolume,
            rate: initialRate,
          }
        );
        onLoad?.();
      }
    } catch (error) {
      logger.error('❌ Failed to load video', { error });
      onError?.(error as Error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [autoplay, loop, muted, resizeMode, initialVolume, initialRate, onLoad, onError]);

  const unloadVideo = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.unloadAsync();
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          position: 0,
          duration: 0,
        }));
        logger.debug('📤 Video unloaded');
      }
    } catch (error) {
      logger.error('❌ Failed to unload video', { error });
      onError?.(error as Error);
    }
  }, []);

  // ============================================
  // STATUS HANDLER
  // ============================================

  const handleStatusUpdate = useCallback((newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    
    if (newStatus.isLoaded) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: newStatus.isPlaying,
        position: newStatus.positionMillis ? newStatus.positionMillis / 1000 : 0,
        duration: newStatus.durationMillis ? newStatus.durationMillis / 1000 : 0,
        isBuffering: newStatus.isBuffering || false,
      }));
    }

    onPlaybackStatusUpdate?.(newStatus);
  }, [onPlaybackStatusUpdate]);

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    if (initialUri) {
      loadVideo(initialUri);
    }

    return () => {
      unloadVideo();
    };
  }, [initialUri]);

  // ============================================
  // RETURN
  // ============================================

  return {
    ...state,
    videoRef,
    status,
    play,
    pause,
    togglePlay,
    seekTo,
    toggleMute,
    toggleLoop,
    toggleFullscreen,
    setRate,
    setVolume,
    replay,
    loadVideo,
    unloadVideo,
  };
};

// ============================================
// 3. COMPONENT
// ============================================

import { View, ViewStyle } from 'react-native';

export interface VideoPlayerComponentProps extends VideoPlayerProps {
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export const VideoPlayer: React.FC<VideoPlayerComponentProps> = ({
  uri,
  autoplay = false,
  loop = false,
  muted = false,
  resizeMode = ResizeMode.CONTAIN,
  volume = 1,
  rate = 1,
  style,
  testID,
  ...props
}) => {
  const { videoRef, isLoading, isPlaying, isPaused } = useVideoPlayer({
    uri,
    autoplay,
    loop,
    muted,
    resizeMode,
    volume,
    rate,
    ...props,
  });

  const containerStyle: ViewStyle = {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Video
        ref={videoRef}
        style={{ width: '100%', height: '100%' }}
        resizeMode={resizeMode}
        useNativeControls
        {...props}
      />
    </View>
  );
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  useVideoPlayer,
  VideoPlayer,
  ResizeMode,
};