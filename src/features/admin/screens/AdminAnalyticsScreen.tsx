import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { adminService } from '../../../api/services/admin.service';

export default function AdminAnalyticsScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setMessage(null);
    try {

      setMessage('Wire analytics.service when metric tables exist.');

    } catch (e: any) {
      setError(e?.userMessage || e?.message || 'Server request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
    >
      <Text style={styles.h1}>Analytics</Text>
      {loading ? <ActivityIndicator color="#7C3AED" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.msg}>{message}</Text> : null}
      <Text style={styles.hint}>
        No mock rows. Full CRUD lands when the matching tables/services are ready.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 16 },
  h1: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  error: { color: '#EF4444', marginBottom: 8 },
  msg: { color: '#D1D5DB', lineHeight: 20 },
  hint: { color: '#6B7280', marginTop: 16, fontSize: 12 },
});
