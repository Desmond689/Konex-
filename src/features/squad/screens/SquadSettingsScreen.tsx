import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSquadStore } from '../../../store/squadStore';
import { useAuthStore } from '../../../store/authStore';
import { squadService } from '../../../api/services/squad.service';

export default function SquadSettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const squadId = route.params?.squadId as string;
  const removeSquad = useSquadStore((s) => s.removeSquad);
  const activeSquad = useSquadStore((s) => s.activeSquad);
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState(false);

  const handleLeave = () => {
    if (!user?.id || !squadId) {
      Alert.alert('Error', 'Missing user or squad id');
      return;
    }
    Alert.alert('Leave squad', 'This calls the server. Local list updates only after success.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await squadService.leaveSquad(user.id, squadId);
            removeSquad(squadId);
            navigation.navigate('SquadList');
          } catch (e: any) {
            Alert.alert('Leave failed', e?.userMessage || e?.message || 'Server rejected leave');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Squad settings</Text>
      <Text style={styles.sub}>{activeSquad?.name || squadId}</Text>
      {busy ? <ActivityIndicator color="#7C3AED" /> : null}
      <TouchableOpacity style={styles.dangerBtn} onPress={handleLeave} disabled={busy}>
        <Text style={styles.dangerText}>Leave squad</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  sub: { color: '#9CA3AF', marginBottom: 24 },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#EF4444',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  dangerText: { color: '#EF4444', fontWeight: '700' },
});
