import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { adminService } from '../../../api/services/admin.service';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data || {});
    } catch (e: any) {
      setStats(null);
      setError(e?.userMessage || e?.message || 'Failed to load dashboard stats from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  const cards = stats
    ? Object.entries(stats).filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <Text style={styles.h1}>Dashboard</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && cards.length === 0 ? (
        <Text style={styles.muted}>Server returned no numeric stats.</Text>
      ) : null}
      <View style={styles.grid}>
        {cards.map(([k, v]) => (
          <View key={k} style={styles.card}>
            <Text style={styles.cardVal}>{String(v)}</Text>
            <Text style={styles.cardKey}>{k.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 16 },
  center: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  h1: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  error: { color: '#EF4444', marginBottom: 12 },
  muted: { color: '#9CA3AF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%', backgroundColor: '#12121A', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1E1E2A',
  },
  cardVal: { color: '#A78BFA', fontSize: 22, fontWeight: '800' },
  cardKey: { color: '#9CA3AF', fontSize: 12, marginTop: 6, textTransform: 'capitalize' },
});
