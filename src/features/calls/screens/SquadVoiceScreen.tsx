import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callService } from '../services/call.service';
import { useAuthStore } from '../../../store/authStore';
import { isWebrtcNativeAvailable } from '../services/webrtc.session';
import { supabase } from '../../../api/client/supabase.client';
import Avatar from '../../../components/atoms/Avatar';
import { displayName, loadUserBrief, UserBrief } from '../utils/loadUserBrief';

type PartRow = {
  user_id: string;
  is_muted?: boolean;
  left_at?: string | null;
  joined_at?: string;
};

export default function SquadVoiceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const squadId = route.params?.squadId as string;
  const squadNameParam = route.params?.squadName as string | undefined;

  const [squadName, setSquadName] = useState(squadNameParam || 'Squad');
  const [callId, setCallId] = useState<string | null>(route.params?.callId || null);
  const [participants, setParticipants] = useState<PartRow[]>([]);
  const [briefs, setBriefs] = useState<Record<string, UserBrief | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [muted, setMuted] = useState(false);

  const refreshParticipants = useCallback(async (id: string) => {
    const parts = (await callService.getParticipants(id)) as PartRow[];
    setParticipants(parts);
    const map: Record<string, UserBrief | null> = {};
    await Promise.all(
      parts.map(async (p) => {
        try {
          map[p.user_id] = await loadUserBrief(p.user_id);
        } catch {
          map[p.user_id] = null;
        }
      })
    );
    setBriefs(map);
  }, []);

  useEffect(() => {
    (async () => {
      if (!user?.id || !squadId) {
        setError('Missing user or squad');
        setLoading(false);
        return;
      }
      try {
        const { data: squad, error: sErr } = await supabase
          .from('squads')
          .select('id, name')
          .eq('id', squadId)
          .maybeSingle();
        if (sErr) throw sErr;
        if (squad?.name) setSquadName(squad.name);

        const { data: existing } = await supabase
          .from('calls')
          .select('*')
          .eq('type', 'squad')
          .eq('squad_id', squadId)
          .in('status', ['calling', 'connecting', 'connected', 'reconnecting'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          setCallId(existing.id);
          await refreshParticipants(existing.id);
          const me = (await callService.getParticipants(existing.id)).find(
            (p: any) => p.user_id === user.id && !p.left_at
          );
          setInRoom(!!me);
        }
      } catch (e: any) {
        setError(e?.userMessage || e?.message || 'Failed to load voice room');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, squadId, refreshParticipants]);

  useEffect(() => {
    if (!callId || !inRoom) return;
    const id = setInterval(() => {
      refreshParticipants(callId).catch(() => undefined);
    }, 4000);
    return () => clearInterval(id);
  }, [callId, inRoom, refreshParticipants]);

  const join = async () => {
    if (!user?.id || !squadId) return;
    setJoining(true);
    setError(null);
    try {
      const call = await callService.startSquadVoice({ userId: user.id, squadId });
      setCallId(call.id);
      await refreshParticipants(call.id);
      setInRoom(true);
      if (!isWebrtcNativeAvailable()) {
        setError(
          'Joined room in Supabase. Live audio requires react-native-webrtc in a development build.'
        );
      }
    } catch (e: any) {
      setError(e?.userMessage || e?.message || 'Join failed');
      setInRoom(false);
    } finally {
      setJoining(false);
    }
  };

  const leave = async () => {
    try {
      if (callId && user?.id) await callService.leaveSquadVoice(callId, user.id);
    } catch (e: any) {
      setError(e?.message || 'Leave failed on server');
    }
    setInRoom(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7C3AED" />
        <Text style={styles.meta}>Loading voice room…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{squadName}</Text>
      <Text style={styles.sub}>Voice Chat</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!inRoom ? (
        <View style={styles.lobby}>
          <Text style={styles.meta}>
            {participants.length > 0
              ? `${participants.length} member(s) currently in voice (from server)`
              : 'No active participants on server. Start or join to create a session.'}
          </Text>
          <FlatList
            data={participants}
            keyExtractor={(i) => i.user_id}
            style={{ maxHeight: 200, width: '100%' }}
            ListEmptyComponent={null}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Avatar
                  uri={briefs[item.user_id]?.profile_picture || undefined}
                  name={displayName(briefs[item.user_id], item.user_id)}
                  size={36}
                />
                <Text style={styles.user}>
                  {displayName(briefs[item.user_id], item.user_id)}
                </Text>
              </View>
            )}
          />
          <TouchableOpacity style={styles.primary} onPress={join} disabled={joining}>
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {participants.length ? 'Join Voice' : 'Start Voice'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.meta}>In room · {participants.length} participant(s)</Text>
          <FlatList
            data={participants}
            keyExtractor={(i) => i.user_id}
            style={{ flex: 1, width: '100%', marginTop: 12 }}
            ListEmptyComponent={<Text style={styles.meta}>Waiting for server participants…</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Avatar
                  uri={briefs[item.user_id]?.profile_picture || undefined}
                  name={displayName(briefs[item.user_id], item.user_id)}
                  size={48}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.user}>
                    {displayName(briefs[item.user_id], item.user_id)}
                  </Text>
                  <Text style={styles.meta}>
                    {item.is_muted ? 'Muted' : 'Connected'}
                    {item.user_id === user?.id ? ' · you' : ''}
                  </Text>
                </View>
              </View>
            )}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btn} onPress={() => setMuted((m) => !m)}>
              <Text style={styles.btnText}>{muted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.leave]} onPress={leave}>
              <Text style={styles.btnText}>Leave</Text>
            </TouchableOpacity>
          </View>
          {!isWebrtcNativeAvailable() ? (
            <Text style={styles.warn}>
              Speaking indicators are not shown: WebRTC native module is not available in this build.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  center: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  sub: { color: '#9CA3AF', marginTop: 4 },
  lobby: { marginTop: 24, alignItems: 'center', width: '100%' },
  error: { color: '#EF4444', marginTop: 12 },
  warn: { color: '#FBBF24', marginTop: 12, fontSize: 12 },
  meta: { color: '#9CA3AF', fontSize: 13, marginTop: 8, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10, width: '100%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  user: { color: '#F9FAFB', fontWeight: '600' },
  primary: {
    marginTop: 24,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { flex: 1, backgroundColor: '#1E1E2A', padding: 14, borderRadius: 12, alignItems: 'center' },
  leave: { backgroundColor: '#EF4444' },
  btnText: { color: '#fff', fontWeight: '700' },
});
