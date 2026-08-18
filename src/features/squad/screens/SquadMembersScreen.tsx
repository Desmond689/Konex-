import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSquadStore } from '../../../store/squadStore';
import { squadService } from '../../../api/services/squad.service';

type MemberRow = { id: string; name: string; role: string };

export default function SquadMembersScreen() {
  const route = useRoute<any>();
  const squadId = route.params?.squadId as string;
  const activeSquad = useSquadStore((s) => s.activeSquad);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!squadId) {
        setError('Missing squad id');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await squadService.getSquadMembers(squadId);
        setMembers(
          (rows || []).map((r: any) => ({
            id: r.user_id || r.user?.id || r.id,
            name: r.user?.gamer_tag || r.user?.username || r.username || 'Member',
            role: (r.role || 'member').toLowerCase(),
          }))
        );
      } catch (e: any) {
        setMembers([]);
        setError(e?.userMessage || e?.message || 'Failed to load members from server');
      } finally {
        setLoading(false);
      }
    })();
  }, [squadId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members</Text>
      <Text style={styles.sub}>{activeSquad?.name || squadId}</Text>
      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No members returned from server</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.name || 'M')[0]}</Text>
              </View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  sub: { color: '#9CA3AF', marginBottom: 16 },
  error: { color: '#EF4444', marginTop: 16 },
  empty: { color: '#9CA3AF', marginTop: 24, textAlign: 'center' },
  list: { paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121A', borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { color: '#F9FAFB', fontWeight: '600' },
  role: { color: '#9CA3AF', fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
});
