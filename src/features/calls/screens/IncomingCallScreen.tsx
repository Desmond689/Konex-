import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callService } from '../services/call.service';
import { useAuthStore } from '../../../store/authStore';
import { useCallStore } from '../store/callStore';
import { isWebrtcNativeAvailable } from '../services/webrtc.session';
import Avatar from '../../../components/atoms/Avatar';
import { displayName, loadUserBrief, UserBrief } from '../utils/loadUserBrief';

export default function IncomingCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const callId = route.params?.callId as string;
  const [caller, setCaller] = useState<UserBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const call = await callService.getCall(callId);
        if (call.caller_id) {
          try {
            setCaller(await loadUserBrief(call.caller_id));
          } catch (e: any) {
            setError(e?.message || 'Could not load caller profile');
          }
        }
        unsub = callService.subscribeCall(callId, (c) => {
          if (['cancelled', 'ended', 'failed', 'no_answer', 'missed'].includes(c.status)) {
            setIncomingCall(null);
            navigation.goBack();
          }
        });
      } catch (e: any) {
        setError(e?.message || 'Could not load call');
      }
    })();
    return () => unsub?.();
  }, [callId]);

  const decline = async () => {
    setBusy(true);
    try {
      if (!user?.id) throw new Error('Not authenticated');
      await callService.declineDmCall(callId, user.id);
      setIncomingCall(null);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.userMessage || e?.message || 'Decline failed');
      setBusy(false);
    }
  };

  const accept = async () => {
    if (!isWebrtcNativeAvailable()) {
      setError(
        'react-native-webrtc is not linked. Accept is blocked until a development build includes the native module.'
      );
      return;
    }
    setBusy(true);
    try {
      if (!user?.id) throw new Error('Not authenticated');
      const call = await callService.acceptDmCall(callId, user.id);
      setIncomingCall(null);
      navigation.replace('ActiveCall', {
        callId,
        role: 'callee',
        remoteUserId: call.caller_id,
        peerName: displayName(caller, call.caller_id),
      });
    } catch (e: any) {
      setError(e?.userMessage || e?.message || 'Accept failed');
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>KONEX</Text>
      <Text style={styles.kind}>Incoming voice call</Text>
      <Avatar
        uri={caller?.profile_picture || undefined}
        name={displayName(caller, 'Caller')}
        size={100}
      />
      <Text style={styles.name}>{displayName(caller, 'Caller')}</Text>
      {caller?.username ? <Text style={styles.tag}>@{caller.username}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.decline]}
          onPress={decline}
          disabled={busy}
        >
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.accept]}
          onPress={accept}
          disabled={busy}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: { color: '#A78BFA', fontWeight: '800', letterSpacing: 3, fontSize: 12 },
  kind: { color: '#9CA3AF', marginTop: 8, marginBottom: 28 },
  name: { color: '#F9FAFB', fontSize: 28, fontWeight: '700', marginTop: 16 },
  tag: { color: '#9CA3AF', marginTop: 4 },
  error: { color: '#EF4444', marginTop: 16, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 20, marginTop: 48 },
  btn: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 28, minWidth: 120, alignItems: 'center' },
  decline: { backgroundColor: '#EF4444' },
  accept: { backgroundColor: '#22C55E' },
  btnText: { color: '#fff', fontWeight: '700' },
});
