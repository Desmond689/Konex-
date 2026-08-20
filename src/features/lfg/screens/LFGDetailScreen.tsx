import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { lfgService } from '../../../api/services/lfg.service';
import { useAuthStore } from '../../../store/authStore';

export default function LFGDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const lfgId = route.params?.lfgId;
  const user = useAuthStore((s) => s.user);
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!lfgId) {
        setError('Missing lfgId');
        setLoading(false);
        return;
      }
      try {
        setItem(await lfgService.getLFG(lfgId));
      } catch (e: any) {
        setError(e?.message || 'Failed to load LFG');
      } finally {
        setLoading(false);
      }
    })();
  }, [lfgId]);

  const join = async () => {
    if (!user?.id || !lfgId) return;
    try {
      if ((lfgService as any).joinLFG) {
        await (lfgService as any).joinLFG(lfgId, user.id);
      } else if ((lfgService as any).requestJoin) {
        await (lfgService as any).requestJoin(lfgId, user.id);
      } else {
        throw new Error('Join method not available on lfgService');
      }
      setItem(await lfgService.getLFG(lfgId));
    } catch (e: any) {
      Alert.alert('Join failed', e?.message || 'Server error');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7C3AED" /></View>;
  if (error || !item) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.link}>Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.game_mode || item.game_id || 'LFG'}</Text>
      <Text style={styles.meta}>
        {item.players_joined ?? 0}/{item.players_needed ?? '?'} players · {item.region || ''} · {item.skill_level || ''}
      </Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      <TouchableOpacity style={styles.btn} onPress={join}>
        <Text style={styles.btnText}>Request / Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  center: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#EF4444' },
  link: { color: '#A78BFA', marginTop: 12 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  meta: { color: '#9CA3AF', marginTop: 8 },
  desc: { color: '#D1D5DB', marginTop: 16 },
  btn: { marginTop: 24, backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
