import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { callService, CallRow } from '../services/call.service';
import { useAuthStore } from '../../../store/authStore';
import { isWebrtcNativeAvailable } from '../services/webrtc.session';
import { displayName, loadUserBrief } from '../utils/loadUserBrief';
import { supabase } from '../../../api/client/supabase.client';

export default function CallHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<CallRow[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      const list = await callService.listHistory(user.id);
      setRows(list);
      const map: Record<string, string> = {};
      for (const c of list) {
        if (c.type === 'squad' && c.squad_id) {
          try {
            const { data } = await supabase
              .from('squads')
              .select('name')
              .eq('id', c.squad_id)
              .maybeSingle();
            map[c.id] = data?.name || c.squad_id;
          } catch {
            map[c.id] = c.squad_id;
          }
        } else {
          const other = c.caller_id === user.id ? c.callee_id : c.caller_id;
          if (other) {
            try {
              const brief = await loadUserBrief(other);
              map[c.id] = displayName(brief, other);
            } catch {
              map[c.id] = other;
            }
          }
        }
      }
      setLabels(map);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Failed to load call history from server');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const duration = (c: CallRow) => {
    if (!c.connected_at || !c.ended_at) return '';
    const ms = new Date(c.ended_at).getTime() - new Date(c.connected_at).getTime();
    if (ms <= 0) return '';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const subtitle = (c: CallRow) => {
    if (c.type === 'squad') return `Squad voice · ${c.status}`;
    const outgoing = c.caller_id === user?.id;
    const base = outgoing ? 'Outgoing' : 'Incoming';
    return `${base} · ${c.status}`;
  };

  const callback = async (c: CallRow) => {
    setActionError(null);
    if (c.type !== 'dm' || !user?.id) return;
    if (!isWebrtcNativeAvailable()) {
      setActionError('Cannot call back: react-native-webrtc not available in this build.');
      return;
    }
    const other = c.caller_id === user.id ? c.callee_id : c.caller_id;
    if (!other) return;
    try {
      const call = await callService.startDmCall({
        callerId: user.id,
        calleeId: other,
        chatId: c.chat_id,
      });
      navigation.navigate('ActiveCall', {
        callId: call.id,
        role: 'caller',
        remoteUserId: other,
      });
    } catch (e: any) {
      setActionError(e?.userMessage || e?.message || 'Could not start call');
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(i) => i.id}
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
          ListEmptyComponent={
            <Text style={styles.empty}>No call history from Supabase</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => callback(item)}
              disabled={item.type !== 'dm'}
            >
              <Text style={styles.title}>{labels[item.id] || item.id}</Text>
              <Text style={styles.meta}>
                {subtitle(item)}
                {duration(item) ? ` · ${duration(item)}` : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 12 },
  error: { color: '#EF4444', marginBottom: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  row: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontWeight: '600' },
  meta: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
});
