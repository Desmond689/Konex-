import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { storyService } from '../../../api/services/story.service';

export default function StoryViewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const storyId = route.params?.storyId;
  const userId = route.params?.userId;
  const [story, setStory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (storyId && (storyService as any).getStory) {
          setStory(await (storyService as any).getStory(storyId));
        } else if (userId && (storyService as any).getUserStories) {
          const list = await (storyService as any).getUserStories(userId);
          setStory(list?.[0] || null);
        } else {
          setError('Missing storyId');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load story');
      } finally {
        setLoading(false);
      }
    })();
  }, [storyId, userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }
  if (error || !story) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Story not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mediaUrl =
    typeof story.media === 'string'
      ? story.media
      : story.media?.url || story.media?.uri;

  return (
    <View style={styles.container}>
      {mediaUrl ? <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="contain" /> : null}
      {story.text ? <Text style={styles.caption}>{story.text}</Text> : null}
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  center: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#EF4444', marginBottom: 12 },
  link: { color: '#A78BFA', fontWeight: '700' },
  media: { width: '100%', height: '70%' },
  caption: { color: '#fff', textAlign: 'center', padding: 16 },
  close: { alignItems: 'center', padding: 16 },
});
