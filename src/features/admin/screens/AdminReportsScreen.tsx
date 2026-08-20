import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { adminService } from '../../../api/services/admin.service';
import { reportService } from '../../../api/services/report.service';
import { useAuthStore } from '../../../store/authStore';

export default function AdminReportsScreen() {
  const adminId = useAuthStore((s) => s.user?.id);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminService.getReports(50, 0);
      setRows(data || []);
    } catch (e: any) {
      setRows([]);
      setError(e?.userMessage || e?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = (id: string, status: string) => {
    Alert.alert(`Mark ${status}`, 'Updates report status in Supabase.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await reportService.updateReportStatus(id, status, adminId);
            await load();
          } catch (e: any) {
            Alert.alert('Failed', e?.userMessage || e?.message || 'Could not update report');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Reports & Moderation</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => item.id || String(i)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No reports from server</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.reason || item.type || 'Report'}</Text>
              <Text style={styles.meta}>
                status: {item.status || 'pending'} · target: {item.target_id || item.content_id || '—'}
              </Text>
              <Text style={styles.body} numberOfLines={3}>{item.description || item.details || ''}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.btn} onPress={() => setStatus(item.id, 'resolved')}>
                  <Text style={styles.btnText}>Resolve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => setStatus(item.id, 'dismissed')}>
                  <Text style={styles.btnText}>Dismiss</Text>
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
  h1: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  error: { color: '#EF4444' },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#12121A', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A' },
  title: { color: '#F9FAFB', fontWeight: '700' },
  meta: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  body: { color: '#D1D5DB', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#1E1E2A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#E5E7EB', fontWeight: '600', fontSize: 12 },
});
