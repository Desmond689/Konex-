import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { communityService } from '../../../api/services/community.service';
import { storage } from '../../../api/storage';

type Community = {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  cover_image?: string | null;
  member_count?: number;
};

export default function AdminCommunitiesScreen() {
  const [items, setItems] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await communityService.getCommunities(50, 0);
      setItems((rows as any) || []);
    } catch (e: any) {
      setItems([]);
      setError(e?.userMessage || e?.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeLogo = async (community: Community) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to upload a logo.');
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      setBusyId(community.id);
      const uri = picked.assets[0].uri;
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        Alert.alert('Not allowed', 'Use a photo from this device, not a web URL.');
        return;
      }
      const uploaded = await storage.uploadFile(
        { uri, name: `logo-${community.id}.jpg`, type: 'image/jpeg' } as any,
        { bucket: 'communities', folder: community.id, upsert: true }
      );
      const url = uploaded?.url;
      if (!url) throw new Error('Upload returned no URL');

      await communityService.updateCommunity(community.id, { logo: url } as any);
      await load();
    } catch (e: any) {
      Alert.alert('Logo update failed', e?.userMessage || e?.message || 'Server/storage error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Games & Communities</Text>
      <Text style={styles.hint}>Admins can set/change community profile logo (stored in Supabase Storage + communities.logo).</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No communities from server</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.logo ? (
                <Image source={{ uri: item.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logo, styles.logoPh]}>
                  <Text style={styles.logoPhText}>{(item.name || 'C')[0]}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.slug || item.id}</Text>
                <TouchableOpacity
                  style={styles.btn}
                  disabled={busyId === item.id}
                  onPress={() => changeLogo(item)}
                >
                  <Text style={styles.btnText}>
                    {busyId === item.id ? 'Uploading…' : item.logo ? 'Change logo' : 'Upload logo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 12 },
  h1: { color: '#F9FAFB', fontSize: 20, fontWeight: '700' },
  hint: { color: '#9CA3AF', fontSize: 12, marginVertical: 8 },
  error: { color: '#EF4444', marginBottom: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row', backgroundColor: '#12121A', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#1E1E2A', gap: 12,
  },
  logo: { width: 64, height: 64, borderRadius: 32 },
  logoPh: { backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  logoPhText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  name: { color: '#F9FAFB', fontWeight: '700', fontSize: 15 },
  meta: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  btn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
