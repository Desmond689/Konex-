import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSquadStore } from '../../../store/squadStore';
import { useAuthStore } from '../../../store/authStore';
import { squadService } from '../../../api/services/squad.service';

function mapSquad(row: any) {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag || row.slug?.slice(0, 6)?.toUpperCase(),
    description: row.description || undefined,
    ownerId: row.leader || row.leader_id || row.created_by || row.ownerId,
    memberCount:
      row.member_count ??
      (Array.isArray(row.members) ? row.members.length : 1),
    avatarUrl: row.logo || row.icon_url || row.avatarUrl,
    isPublic: row.type !== 'private' && row.is_public !== false,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export default function SquadListScreen() {
  const navigation = useNavigation<any>();
  const mySquads = useSquadStore((s) => s.mySquads);
  const setMySquads = useSquadStore((s) => s.setMySquads);
  const isLoading = useSquadStore((s) => s.isLoading);
  const setLoading = useSquadStore((s) => s.setLoading);
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await squadService.getMySquads(user.id);
      setMySquads((rows || []).map(mapSquad));
    } catch {
      // keep existing local squads
    } finally {
      setLoading(false);
    }
  }, [user?.id, setLoading, setMySquads]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Squads</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('SquadCreation')}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {isLoading && mySquads.length === 0 ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={mySquads}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
          }
          contentContainerStyle={mySquads.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No squads yet</Text>
              <Text style={styles.emptySub}>Create a squad or join one to play together</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => navigation.navigate('SquadCreation')}
              >
                <Text style={styles.createBtnText}>Create squad</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('SquadDetail', { squadId: item.id })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.name || 'S')[0]}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  {item.name}
                  {item.tag ? ` [${item.tag}]` : ''}
                </Text>
                <Text style={styles.cardMeta}>
                  {item.memberCount} members · {item.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontSize: 24, fontWeight: '700' },
  createBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  list: { padding: 16 },
  emptyWrap: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySub: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  cardBody: { flex: 1 },
  cardTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '600' },
  cardMeta: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
});
