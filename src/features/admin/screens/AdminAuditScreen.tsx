import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { adminService } from '../../../api/services/admin.service';

export default function AdminAuditScreen() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminService.getModerationLogs(50, 0);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setRows([]);
      setError(e?.userMessage || e?.message || 'Server request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Audit Logs</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => item.id || String(i)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor="#7C3AED"
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No rows from server</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>
                {item.title || item.name || item.action_type || item.id || 'Item'}
              </Text>
              <Text style={styles.meta} numberOfLines={4}>
                {JSON.stringify(item).slice(0, 200)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 12 },
  h1: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  error: { color: '#EF4444', marginBottom: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontWeight: '700' },
  meta: { color: '#9CA3AF', fontSize: 11, marginTop: 4 },
});
