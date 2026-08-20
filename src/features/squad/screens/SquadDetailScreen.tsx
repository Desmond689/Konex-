import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSquadStore } from '../../../store/squadStore';
import { squadService } from '../../../api/services/squad.service';

function mapSquad(row: any) {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag || row.slug?.slice(0, 6)?.toUpperCase(),
    description: row.description || undefined,
    ownerId: row.leader || row.created_by,
    memberCount: Array.isArray(row.members) ? row.members.length : 1,
    avatarUrl: row.logo || undefined,
    isPublic: row.type !== 'private',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export default function SquadDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const squadId = route.params?.squadId as string;
  const setActiveSquad = useSquadStore((s) => s.setActiveSquad);
  const updateSquad = useSquadStore((s) => s.updateSquad);
  const activeSquad = useSquadStore((s) => s.activeSquad);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!squadId) {
        setError('Missing squad id');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const row = await squadService.getSquad(squadId);
        if (cancelled) return;
        const mapped = mapSquad(row);
        setActiveSquad(mapped);
        updateSquad(mapped.id, mapped);
      } catch (e: any) {
        if (cancelled) return;
        setActiveSquad(null);
        setError(e?.userMessage || e?.message || 'Failed to load squad from server');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [squadId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (error || !activeSquad) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error || 'Squad not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(activeSquad.name || 'S')[0]}</Text>
        </View>
        <Text style={styles.name}>
          {activeSquad.name}
          {activeSquad.tag ? ` [${activeSquad.tag}]` : ''}
        </Text>
        <Text style={styles.meta}>
          {activeSquad.memberCount} members · {activeSquad.isPublic ? 'Public' : 'Private'}
        </Text>
        {activeSquad.description ? <Text style={styles.desc}>{activeSquad.description}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('SquadChat', { squadId: activeSquad.id })}>
          <Text style={styles.primaryBtnText}>Squad chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            const parent = navigation.getParent?.();
            const nav = parent || navigation;
            nav.navigate('SquadVoice', {
              squadId: activeSquad.id,
              squadName: activeSquad.name,
            });
          }}
        >
          <Text style={styles.secondaryBtnText}>Voice chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SquadMembers', { squadId: activeSquad.id })}>
          <Text style={styles.secondaryBtnText}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SquadInvite', { squadId: activeSquad.id })}>
          <Text style={styles.secondaryBtnText}>Invite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SquadJoinRequests', { squadId: activeSquad.id })}>
          <Text style={styles.secondaryBtnText}>Join requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SquadSettings', { squadId: activeSquad.id })}>
          <Text style={styles.secondaryBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 16 },
  center: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: '#EF4444', marginBottom: 12, textAlign: 'center' },
  link: { color: '#7C3AED', fontWeight: '600' },
  hero: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  meta: { color: '#9CA3AF', fontSize: 14, marginTop: 6 },
  desc: { color: '#D1D5DB', fontSize: 14, marginTop: 12, textAlign: 'center' },
  actions: { gap: 10 },
  primaryBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { backgroundColor: '#12121A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E2A' },
  secondaryBtnText: { color: '#F9FAFB', fontWeight: '600', fontSize: 16 },
});
