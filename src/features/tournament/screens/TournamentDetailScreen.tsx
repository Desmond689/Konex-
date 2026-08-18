import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { tournamentService } from '../../../api/services/tournament.service';
import { useAuthStore } from '../../../store/authStore';

export default function TournamentDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id = route.params?.tournamentId;
  const user = useAuthStore((s) => s.user);
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) { setError('Missing tournamentId'); setLoading(false); return; }
      try {
        setItem(await tournamentService.getTournament(id));
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const register = async () => {
    if (!user?.id || !id) return;
    try {
      if ((tournamentService as any).registerPlayer) {
        await (tournamentService as any).registerPlayer(id, user.id);
      } else if ((tournamentService as any).register) {
        await (tournamentService as any).register(id, user.id);
      } else {
        throw new Error('Register method not on tournamentService');
      }
      setItem(await tournamentService.getTournament(id));
    } catch (e: any) {
      Alert.alert('Register failed', e?.message || 'Server error');
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
      <Text style={styles.title}>{item.name || item.title}</Text>
      <Text style={styles.meta}>{item.status} · {item.game || item.game_id}</Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      <TouchableOpacity style={styles.btn} onPress={register}>
        <Text style={styles.btnText}>Register</Text>
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
