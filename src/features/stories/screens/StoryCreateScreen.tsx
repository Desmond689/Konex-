import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pickMediaFromDevice } from '../../../utils/pickFromDevice';
import storage from '../../../api/storage';
import { storyService } from '../../../api/services/story.service';
import { useAuthStore } from '../../../store/authStore';

export default function StoryCreateScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [uri, setUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const file = await pickMediaFromDevice('all');
    if (file?.uri) setUri(file.uri);
  };

  const publish = async () => {
    if (!user?.id) {
      Alert.alert('Sign in required');
      return;
    }
    if (!uri) {
      Alert.alert('Pick media', 'Choose a photo or video from this device.');
      return;
    }
    setBusy(true);
    try {
      const uploaded = await storage.uploadFile(
        { uri, name: `story_${Date.now()}.jpg`, type: 'image/jpeg' },
        { bucket: 'stories', folder: user.id }
      );
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await storyService.createStory({
        user_id: user.id,
        media: { url: uploaded.url, type: 'image' },
        text: caption || null,
        expires_at: expires,
        seen_by: [],
      } as any);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Story failed', e?.message || 'Could not publish story');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New story</Text>
      <TouchableOpacity style={styles.pick} onPress={pick}>
        <Text style={styles.pickText}>{uri ? 'Change media' : 'Pick from device'}</Text>
      </TouchableOpacity>
      {uri ? <Image source={{ uri }} style={styles.preview} /> : null}
      <TextInput
        style={styles.input}
        value={caption}
        onChangeText={setCaption}
        placeholder="Caption (optional)"
        placeholderTextColor="#6B7280"
      />
      <TouchableOpacity style={styles.btn} onPress={publish} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publish</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  pick: { backgroundColor: '#1E1E2A', padding: 14, borderRadius: 12, alignItems: 'center' },
  pickText: { color: '#A78BFA', fontWeight: '600' },
  preview: { width: '100%', height: 280, borderRadius: 12, marginTop: 12 },
  input: {
    marginTop: 12, backgroundColor: '#12121A', borderRadius: 12, borderWidth: 1,
    borderColor: '#1E1E2A', color: '#F9FAFB', padding: 12,
  },
  btn: { marginTop: 16, backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
