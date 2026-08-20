import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../../api/client/supabase.client';

export default function AdminContentScreen() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setRows(data || []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = (id: string, status: string) => {
    Alert.alert(`${status} post`, 'Updates posts.status in Supabase.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const { error: err } = await supabase.from('posts').update({ status }).eq('id', id);
            if (err) throw err;
            await load();
          } catch (e: any) {
            Alert.alert('Failed', e?.message || 'Update failed');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Content</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#7C3AED" /> : (
        <FlatList
          data={rows}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No posts from server</Text>}
          renderItem={({ item }) => {
            const text =
              typeof item.content === 'string'
                ? item.content
                : item.content?.text || JSON.stringify(item.content || {}).slice(0, 80);
            return (
              <View style={styles.card}>
                <Text style={styles.body} numberOfLines={3}>{text}</Text>
                <Text style={styles.meta}>status: {item.status} · author: {item.author}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.btn} onPress={() => setStatus(item.id, 'hidden')}>
                    <Text style={styles.btnText}>Hide</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={() => setStatus(item.id, 'published')}>
                    <Text style={styles.btnText}>Restore</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => setStatus(item.id, 'removed')}>
                    <Text style={styles.btnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 12 },
  h1: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  error: { color: '#EF4444' },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#12121A', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A' },
  body: { color: '#F9FAFB' },
  meta: { color: '#9CA3AF', fontSize: 11, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#1E1E2A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  danger: { backgroundColor: 'rgba(239,68,68,0.25)' },
  btnText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
});
