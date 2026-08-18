import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert,
  RefreshControl, ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';
import { supabase } from '../../../api/client/supabase.client';
import * as ImagePicker from 'expo-image-picker';
import { mediaUploadService } from '../../../api/media/mediaUpload.service';
import { MEDIA_TOO_LARGE_MESSAGE, MEDIA_MAX_BYTES } from '../../../api/media/media.constants';
import VideoEditorModal from '../../media/components/VideoEditorModal';
import FeedMedia from '../components/FeedMedia';
import { getFileSizeBytes } from '../../media/utils/videoSize';
import { postService } from '../../../api/services/post.service';
import { likeService } from '../../../api/services/like.service';

type FeedPost = {
  id: string;
  content: string;
  author_id?: string;
  authorId?: string;
  like_count?: number;
  comment_count?: number;
  created_at?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const navigateRoot = (name: string, params?: object) => {
    // Prefer parent stack screens (Admin, LFG, ...) when inside tabs
    const parent = navigation.getParent?.();
    if (parent) parent.navigate(name, params);
    else navigation.navigate(name, params);
  };
  const user = useAuthStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const [roleState, setRoleState] = useState('');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        if (!cancelled && data) {
          setProfile(data as any);
          setRoleState((data as any).role || '');
        }
      } catch {
        /* ignore — admin chip simply hidden */
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, setProfile]);
  const role = (roleState || (profile as any)?.role || '').toLowerCase();
  const canAdmin = role === 'admin' || role === 'super_admin' || role === 'moderator';
  const PAGE_SIZE = 15;
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [pendingMedia, setPendingMedia] = useState<{
    uri: string;
    kind: 'image' | 'video';
    mime?: string;
  } | null>(null);
  const cancelRef = useRef({ cancelled: false });
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorUri, setEditorUri] = useState<string | null>(null);
  const [editorMime, setEditorMime] = useState<string | undefined>(undefined);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const isVideoItem = (item: any) => {
      const c = item?.content;
      const type = item?.type || c?.type;
      if (type === 'video') return true;
      const url = String(c?.media_url || c?.hls_url || '');
      if (!url) return false;
      const u = url.toLowerCase();
      return (
        u.includes('.mp4') ||
        u.includes('.mov') ||
        u.includes('.m3u8') ||
        u.includes('api.video') ||
        u.includes('.webm')
      );
    };
    const visibleVideos = (viewableItems || []).filter((v: any) => isVideoItem(v?.item));
    const first = visibleVideos[0];
    setActiveVideoId(first?.item?.id ?? null);
  }).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 250,
  }).current;

  const loadPage = useCallback(async (reset: boolean) => {
    if (!user?.id) {
      setPosts([]);
      setHasMore(false);
      return;
    }
    if (!reset && (loadingMoreRef.current || !hasMore)) return;
    if (reset) {
      setLoading(true);
      setError(null);
      offsetRef.current = 0;
    } else {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    try {
      const data = (await postService.getFeed(user.id, PAGE_SIZE, offsetRef.current)) as any[];
      const page = data || [];
      if (reset) {
        setPosts(page);
      } else {
        setPosts((prev) => {
          const seen = new Set(prev.map((x) => x.id));
          const merged = [...prev];
          for (const row of page) {
            if (!seen.has(row.id)) merged.push(row);
          }
          return merged;
        });
      }
      offsetRef.current += page.length;
      setHasMore(page.length >= PAGE_SIZE);
    } catch (e: any) {
      if (reset) {
        setError(e?.userMessage || e?.message || 'Failed to load feed');
        setPosts([]);
      }
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [user?.id, hasMore]);

  useEffect(() => {
    loadPage(true);
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadPage(true);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!loading && !loadingMoreRef.current && hasMore) {
      loadPage(false);
    }
  };


  const pickMedia = async (kind: 'image' | 'video') => {
    cancelRef.current.cancelled = false;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Photo library access is required to attach media.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        kind === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      videoMaxDuration: 90,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || (kind === 'video' ? 'video/mp4' : 'image/jpeg');

    let size = asset.fileSize || 0;
    if (!size && asset.uri) {
      try {
        size = await getFileSizeBytes(asset.uri);
      } catch {
        size = 0;
      }
    }

    if (kind === 'image') {
      if (size > MEDIA_MAX_BYTES) {
        Alert.alert('File too large', MEDIA_TOO_LARGE_MESSAGE);
        return;
      }
      setPendingMedia({ uri: asset.uri, kind: 'image', mime });
      return;
    }

    if (size > 0 && size <= MEDIA_MAX_BYTES) {
      setPendingMedia({ uri: asset.uri, kind: 'video', mime });
      return;
    }

    setEditorUri(asset.uri);
    setEditorMime(mime);
    setEditorVisible(true);
  };

  const createPost = async () => {
    const content = draft.trim();
    if (!content && !pendingMedia) return;
    if (!user?.id) {
      Alert.alert('Sign in required');
      return;
    }
    setPosting(true);
    setUploadProgress(null);
    cancelRef.current.cancelled = false;
    try {
      let mediaMeta: any = null;
      if (pendingMedia) {
        mediaMeta = await mediaUploadService.uploadLocalMedia({
          userId: user.id,
          uri: pendingMedia.uri,
          mime: pendingMedia.mime,
          kind: pendingMedia.kind,
          bucket: 'posts',
          folder: user.id,
          cancelRef: cancelRef.current,
          onProgress: (p) => {
            if (p.phase === 'uploading' && p.percent != null) {
              setUploadProgress(`Uploading… ${p.percent}%`);
            } else if (p.phase === 'processing') {
              setUploadProgress(p.message || 'Processing…');
            } else if (p.phase === 'completed') {
              setUploadProgress('Ready');
            } else if (p.phase === 'cancelled') {
              setUploadProgress('Cancelled');
            }
          },
        });
      }

      const isVideo = pendingMedia?.kind === 'video';
      await postService.createPost({
        author: user.id,
        content: {
          text: content || '',
          type: isVideo ? 'video' : pendingMedia ? 'image' : 'text',
          media_url: mediaMeta?.public_url,
          thumbnail_url: mediaMeta?.thumbnail_url,
          media_id: mediaMeta?.id,
          video_id: mediaMeta?.video_id,
          hls_url: mediaMeta?.hls_url,
          duration_sec: mediaMeta?.duration_sec,
          processing_status: mediaMeta?.status,
        },
        type: isVideo ? 'video' : pendingMedia ? 'image' : 'text',
        category: 'general',
      } as any);
      setDraft('');
      setPendingMedia(null);
      setUploadProgress(null);
      await loadPage(true);
    } catch (e: any) {
      if (e?.code === 'UPLOAD_CANCELLED' || e?.message === 'Upload cancelled') {
        setUploadProgress(null);
      } else {
        Alert.alert('Post failed', e?.userMessage || e?.message || 'Could not save post to server');
      }
    } finally {
      setPosting(false);
    }
  };

  const cancelUpload = () => {
    cancelRef.current.cancelled = true;
    setPendingMedia(null);
    setUploadProgress(null);
    setPosting(false);
  };

  const like = async (postId: string) => {
    if (!user?.id) return;
    // Optimistic local update — do not rebuild feed from network
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likes = Array.isArray((p as any).likes) ? [...(p as any).likes] : [];
        if (!likes.includes(user.id)) likes.push(user.id);
        return { ...p, likes, like_count: likes.length } as any;
      })
    );
    try {
      await likeService.likePost(postId, user.id);
      await (postService as any).likePost?.(postId, user.id);
    } catch (e: any) {
      Alert.alert('Like failed', e?.message || 'Could not like post');
      // soft refresh first page only
      loadPage(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>KONEX</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => navigateRoot('Search')} style={styles.chip}>
            <Text style={styles.chipText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateRoot('Notifications')} style={styles.chip}>
            <Text style={styles.chipText}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateRoot('LFG')} style={styles.chip}>
            <Text style={styles.chipText}>LFG</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateRoot('Tournaments')} style={styles.chip}>
            <Text style={styles.chipText}>Cups</Text>
          </TouchableOpacity>
          {canAdmin ? (
            <TouchableOpacity onPress={() => navigateRoot('Admin')} style={styles.chip}>
              <Text style={styles.chipText}>Admin</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Share an update with the community..."
          placeholderTextColor="#6B7280"
          multiline
        />
        {pendingMedia ? (
          <Text style={styles.mediaHint}>
            Attached {pendingMedia.kind}
            {uploadProgress ? ` · ${uploadProgress}` : ''}
          </Text>
        ) : null}
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('image')} disabled={posting}>
            <Text style={styles.mediaBtnText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('video')} disabled={posting}>
            <Text style={styles.mediaBtnText}>Video</Text>
          </TouchableOpacity>
          {posting ? (
            <TouchableOpacity style={styles.mediaBtn} onPress={cancelUpload}>
              <Text style={styles.mediaBtnText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.postBtn, posting && { opacity: 0.6 }]} onPress={createPost} disabled={posting}>
            <Text style={styles.postBtnText}>{posting ? (uploadProgress || 'Posting…') : 'Post'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <VideoEditorModal
        visible={editorVisible}
        uri={editorUri || ''}
        mime={editorMime}
        onCancel={() => {
          setEditorVisible(false);
          setEditorUri(null);
        }}
        onContinue={({ uri, mime, sizeBytes, durationSec }) => {
          setEditorVisible(false);
          setEditorUri(null);
          setPendingMedia({
            uri,
            kind: 'video',
            mime: mime || 'video/mp4',
          });
        }}
      />

      {loading && posts.length === 0 ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#7C3AED" style={{ marginVertical: 16 }} />
            ) : null
          }
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews
          windowSize={7}
          maxToRenderPerBatch={4}
          initialNumToRender={4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
          contentContainerStyle={posts.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>
                {user ? 'Create the first post above. Data comes from Supabase only.' : 'Sign in to see your feed.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <FeedMedia
                isActive={activeVideoId === item.id}
                mediaUrl={(item.content as any)?.media_url || (item.content as any)?.hls_url}
                thumbnailUrl={(item.content as any)?.thumbnail_url}
                mediaType={item.type || (item.content as any)?.type}
                soundOn={soundOn}
                onToggleSound={() => setSoundOn((s) => !s)}
              />
              <Text style={styles.cardBody}>{
                typeof item.content === 'string'
                  ? item.content
                  : (item.content as any)?.text || ''
              }</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => like(item.id)}>
                  <Text style={styles.action}>♥ {item.like_count ?? (Array.isArray((item as any).likes) ? (item as any).likes.length : 0)}</Text>
                </TouchableOpacity>
                <Text style={styles.meta}>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  topBar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  logo: { color: '#F9FAFB', fontSize: 24, fontWeight: '800' },
  topActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { backgroundColor: '#1E1E2A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  chipText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  composer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  input: { backgroundColor: '#12121A', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E2A', color: '#F9FAFB', padding: 12, minHeight: 72, textAlignVertical: 'top', marginBottom: 10 },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' },
  mediaBtn: { backgroundColor: '#1E1E2A', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  mediaBtnText: { color: '#E5E7EB', fontWeight: '600', fontSize: 13 },
  mediaHint: { color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  mediaPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10, backgroundColor: '#1E1E2A' },
  postBtn: { alignSelf: 'flex-end', backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  postBtnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#EF4444', padding: 12, textAlign: 'center' },
  list: { padding: 16 },
  emptyWrap: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '600' },
  emptySub: { color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1E1E2A' },
  cardBody: { color: '#F9FAFB', fontSize: 15, lineHeight: 22 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  action: { color: '#A78BFA', fontWeight: '600' },
  meta: { color: '#6B7280', fontSize: 11 },
});
