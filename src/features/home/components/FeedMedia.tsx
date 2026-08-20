import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

type Props = {
  isActive: boolean;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: string | null;
  soundOn: boolean;
  onToggleSound: () => void;
};

function looksLikeVideo(url?: string | null, mediaType?: string | null) {
  if (mediaType === 'video') return true;
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes('.mp4') ||
    u.includes('.mov') ||
    u.includes('.webm') ||
    u.includes('api.video') ||
    u.includes('.m3u8')
  );
}

function FeedMediaInner({
  isActive,
  mediaUrl,
  thumbnailUrl,
  mediaType,
  soundOn,
  onToggleSound,
}: Props) {
  const videoRef = useRef<Video>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  /** Only mount Video when active (or was active once) to avoid 20 players */
  const [playerMounted, setPlayerMounted] = useState(false);

  const isVideo = looksLikeVideo(mediaUrl, mediaType) || mediaType === 'video';

  useEffect(() => {
    if (isActive && isVideo) {
      setPlayerMounted(true);
      setUserPaused(false);
    }
  }, [isActive, isVideo]);

  useEffect(() => {
    if (!isActive) setUserPaused(false);
  }, [isActive]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const v = videoRef.current;
      if (!v || !isVideo || !playerMounted) return;
      try {
        if (isActive && !userPaused) {
          await v.setStatusAsync({
            shouldPlay: true,
            isMuted: !soundOn,
            isLooping: true,
          });
        } else {
          await v.setStatusAsync({ shouldPlay: false, isMuted: !soundOn });
          if (!isActive) {
            // Release decoder when off-screen
            await v.unloadAsync();
            if (!cancelled) {
              setReady(false);
              setPlayerMounted(false);
              setIsPlaying(false);
            }
          }
        }
      } catch {
        /* race */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isActive, userPaused, soundOn, isVideo, playerMounted]);

  useEffect(() => {
    return () => {
      videoRef.current?.stopAsync?.().catch(() => undefined);
      videoRef.current?.unloadAsync?.().catch(() => undefined);
    };
  }, []);

  const togglePlayPause = () => {
    if (!isVideo || !isActive) return;
    setUserPaused((prev) => !prev);
  };

  if (!mediaUrl && !thumbnailUrl) return null;

  if (!isVideo) {
    // Prefer thumbnail_url (optimized) over full media when both exist
    return (
      <Image
        source={{ uri: thumbnailUrl || mediaUrl || undefined }}
        style={styles.media}
        resizeMode="cover"
      />
    );
  }

  const showPlaying = isActive && !userPaused && isPlaying;

  return (
    <View style={styles.wrap}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={[styles.media, styles.thumb]} resizeMode="cover" />
      ) : null}

      {playerMounted && mediaUrl ? (
        <Pressable onPress={togglePlayPause} style={styles.press}>
          <Video
            ref={videoRef}
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted={!soundOn}
            shouldPlay={false}
            onLoad={() => setReady(true)}
            onError={() => setError('Video unavailable')}
            onPlaybackStatusUpdate={(st: AVPlaybackStatus) => {
              if (st.isLoaded) {
                setIsPlaying(st.isPlaying);
                setReady(true);
              }
            }}
          />
          {isActive && userPaused ? (
            <View style={styles.centerBadge} pointerEvents="none">
              <Text style={styles.centerBadgeText}>Paused — tap to play</Text>
            </View>
          ) : null}
        </Pressable>
      ) : (
        <Pressable onPress={() => isActive && setPlayerMounted(true)} style={styles.press}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.media} resizeMode="cover" />
          ) : (
            <View style={[styles.media, styles.placeholder]} />
          )}
        </Pressable>
      )}

      {!ready && isActive && playerMounted ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox} pointerEvents="none">
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.soundBtn} onPress={onToggleSound} activeOpacity={0.85}>
        <Text style={styles.soundText}>{soundOn ? 'Sound on' : 'Muted'}</Text>
      </TouchableOpacity>

      {!isActive ? (
        <View style={styles.pausedBadge} pointerEvents="none">
          <Text style={styles.pausedText}>Paused</Text>
        </View>
      ) : showPlaying ? (
        <View style={styles.liveBadge} pointerEvents="none">
          <Text style={styles.liveText}>Playing</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E2A',
    marginBottom: 10,
  },
  press: { width: '100%', height: 220 },
  media: { width: '100%', height: 220 },
  thumb: { position: 'absolute', left: 0, right: 0, top: 0 },
  placeholder: { backgroundColor: '#1E1E2A' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  soundBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  soundText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  pausedBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pausedText: { color: '#D1D5DB', fontSize: 11, fontWeight: '600' },
  liveBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(124,58,237,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  centerBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerBadgeText: { color: '#fff', fontWeight: '700' },
  errorBox: { position: 'absolute', top: 8, left: 8, right: 8 },
  error: { color: '#FCA5A5', fontSize: 12 },
});

export default memo(FeedMediaInner);
