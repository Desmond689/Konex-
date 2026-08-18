import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tournamentService } from '../../../api/services/tournament.service';

export default function TournamentScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await tournamentService.getTournaments(50, 0);
      setRows(data || []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournaments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TournamentCreate')}>
          <Text style={styles.link}>Create</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#7C3AED" /> : (
        <FlatList
          data={rows}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No tournaments from server</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}>
              <Text style={styles.name}>{item.name || item.title || item.id}</Text>
              <Text style={styles.meta}>{item.status || ''} · {item.game || item.game_id || ''}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  link: { color: '#A78BFA', fontWeight: '700' },
  error: { color: '#EF4444' },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#12121A', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A' },
  name: { color: '#F9FAFB', fontWeight: '700' },
  meta: { color: '#9CA3AF', marginTop: 4, fontSize: 12 },
});
