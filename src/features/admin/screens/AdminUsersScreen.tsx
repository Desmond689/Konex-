import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { adminService } from '../../../api/services/admin.service';
import { moderationService } from '../../../api/services/moderation.service';
import { useAuthStore } from '../../../store/authStore';

type UserRow = {
  id: string;
  username?: string;
  display_name?: string;
  email?: string;
  is_suspended?: boolean;
  is_banned?: boolean;
  is_verified?: boolean;
  role?: string;
};

export default function AdminUsersScreen() {
  const adminId = useAuthStore((s) => s.user?.id);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await adminService.getUsers(50, 0);
      setUsers(rows || []);
    } catch (e: any) {
      setUsers([]);
      setError(e?.userMessage || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter((u) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return [u.username, u.display_name, u.email, u.id].some((x) => (x || '').toLowerCase().includes(s));
  });

  const act = (title: string, run: () => Promise<void>) => {
    Alert.alert(title, 'This writes to Supabase. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            await run();
            await load();
          } catch (e: any) {
            Alert.alert('Action failed', e?.userMessage || e?.message || 'Server error');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        placeholder="Search users..."
        placeholderTextColor="#6B7280"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No users from server</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.display_name || item.username || item.id}</Text>
              <Text style={styles.meta}>
                {item.email || '—'} · role:{item.role || 'user'} ·
                {item.is_banned ? ' BANNED' : item.is_suspended ? ' SUSPENDED' : ' active'}
                {item.is_verified ? ' · verified' : ''}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    act('Verify user', async () => {
                      await adminService.updateUserRole(item.id, item.role || 'user');
                      // verified flag via users table if service supports - use moderation/admin path
                      const { supabase } = await import('../../../api/client/supabase.client');
                      const { error } = await supabase.from('users').update({ is_verified: true }).eq('id', item.id);
                      if (error) throw error;
                    })
                  }
                >
                  <Text style={styles.btnText}>Verify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    act('Suspend 7 days', async () => {
                      if (!adminId) throw new Error('Not signed in as admin');
                      await moderationService.suspendUser(item.id, adminId, 7, 'Admin suspend');
                    })
                  }
                >
                  <Text style={styles.btnText}>Suspend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.danger]}
                  onPress={() =>
                    act('Ban user', async () => {
                      if (!adminId) throw new Error('Not signed in as admin');
                      await moderationService.banUser(item.id, adminId, 'Admin ban');
                    })
                  }
                >
                  <Text style={styles.btnText}>Ban</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    act('Unban user', async () => {
                      if (!adminId) throw new Error('Not signed in as admin');
                      await moderationService.unbanUser(item.id, adminId, 'Admin unban');
                    })
                  }
                >
                  <Text style={styles.btnText}>Unban</Text>
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
  search: {
    backgroundColor: '#12121A', borderRadius: 10, borderWidth: 1, borderColor: '#1E1E2A',
    color: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
  },
  error: { color: '#EF4444', marginBottom: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#12121A', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#1E1E2A',
  },
  name: { color: '#F9FAFB', fontWeight: '700', fontSize: 15 },
  meta: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#1E1E2A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  danger: { backgroundColor: 'rgba(239,68,68,0.25)' },
  btnText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
});
