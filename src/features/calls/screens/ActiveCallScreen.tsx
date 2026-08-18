import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callService } from '../services/call.service';
import { WebrtcAudioSession, isWebrtcNativeAvailable } from '../services/webrtc.session';
import { useCallStore } from '../store/callStore';
import { useAuthStore } from '../../../store/authStore';
import Avatar from '../../../components/atoms/Avatar';
import { displayName, loadUserBrief, UserBrief } from '../utils/loadUserBrief';

function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const TERMINAL = new Set([
  'ended',
  'declined',
  'cancelled',
  'failed',
  'missed',
  'no_answer',
  'busy',
  'disconnected',
]);

export default function ActiveCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const callId = route.params?.callId as string;
  const role = route.params?.role as 'caller' | 'callee';
  const remoteUserId = route.params?.remoteUserId as string | undefined;

  const localStatus = useCallStore((s) => s.localStatus);
  const setLocalStatus = useCallStore((s) => s.setLocalStatus);
  const connectedAt = useCallStore((s) => s.connectedAt);
  const setConnectedAt = useCallStore((s) => s.setConnectedAt);
  const muted = useCallStore((s) => s.muted);
  const setMuted = useCallStore((s) => s.setMuted);
  const error = useCallStore((s) => s.error);
  const setError = useCallStore((s) => s.setError);
  const reset = useCallStore((s) => s.reset);

  const sessionRef = useRef<WebrtcAudioSession | null>(null);
  const [, setTick] = useState(0);
  const [peer, setPeer] = useState<UserBrief | null>(null);
  const [peerLoadError, setPeerLoadError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!remoteUserId) return;
    loadUserBrief(remoteUserId)
      .then(setPeer)
      .catch((e) => setPeerLoadError(e?.message || 'Could not load user'));
  }, [remoteUserId]);

  useEffect(() => {
    let unsubCall: (() => void) | undefined;
    let unsubWait: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      if (!user?.id || !callId) {
        setError('Missing call or authenticated user');
        setLocalStatus('failed');
        return;
      }
      if (!isWebrtcNativeAvailable()) {
        setError(
          'react-native-webrtc is not linked. Use a development build (not Expo Go).'
        );
        setLocalStatus('failed');
        try {
          await callService.setStatus(callId, 'failed', 'webrtc_module_missing');
        } catch {
          /* */
        }
        return;
      }

      setError(null);
      setLocalStatus(role === 'caller' ? 'calling' : 'connecting');

      const session = new WebrtcAudioSession({
        callId,
        localUserId: user.id,
        remoteUserId: remoteUserId || null,
        isInitiator: role === 'caller',
        onConnectionState: async (s) => {
          if (cancelled) return;
          if (s === 'connected') {
            setLocalStatus('connected');
            setConnectedAt(Date.now());
            try {
              await callService.setStatus(callId, 'connected');
            } catch (e: any) {
              setError(e?.message || 'Failed to update connected status in database');
            }
          } else if (s === 'connecting') setLocalStatus('connecting');
          else if (s === 'reconnecting') setLocalStatus('reconnecting');
          else if (s === 'failed') {
            setLocalStatus('failed');
            setError('Unable to establish a voice connection.');
          } else if (s === 'ended' || s === 'disconnected') {
            setLocalStatus(s === 'ended' ? 'ended' : 'disconnected');
          }
        },
      });
      sessionRef.current = session;

      try {
        if (role === 'caller') {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              unsubWait?.();
              reject(new Error('No answer'));
            }, 45000);
            unsubWait = callService.subscribeSignals(callId, async (row) => {
              if (row.from_user === user.id) return;
              if (row.signal_type === 'accept') {
                clearTimeout(timeout);
                unsubWait?.();
                setLocalStatus('connecting');
                resolve();
              }
              if (row.signal_type === 'decline') {
                clearTimeout(timeout);
                unsubWait?.();
                reject(new Error('Declined'));
              }
              if (row.signal_type === 'busy') {
                clearTimeout(timeout);
                unsubWait?.();
                reject(new Error('Busy'));
              }
              if (row.signal_type === 'cancel') {
                clearTimeout(timeout);
                unsubWait?.();
                reject(new Error('Cancelled'));
              }
            });
          });
        }

        await session.start();
      } catch (e: any) {
        if (cancelled) return;
        const msg = e?.message || 'Call failed';
        setError(msg);
        if (msg === 'No answer') {
          setLocalStatus('no_answer');
          try {
            await callService.setStatus(callId, 'no_answer', 'timeout');
          } catch {
            /* */
          }
        } else if (msg === 'Declined') setLocalStatus('declined');
        else if (msg === 'Busy') setLocalStatus('busy');
        else if (msg === 'Cancelled') setLocalStatus('cancelled');
        else {
          setLocalStatus('failed');
          try {
            await callService.setStatus(callId, 'failed', msg);
          } catch {
            /* */
          }
        }
      }

      unsubCall = callService.subscribeCall(callId, (c) => {
        if (TERMINAL.has(c.status)) setLocalStatus(c.status as any);
      });
    })();

    return () => {
      cancelled = true;
      unsubWait?.();
      unsubCall?.();
      sessionRef.current?.dispose();
      sessionRef.current = null;
    };
  }, [callId, user?.id, role, remoteUserId]);

  const hangup = async () => {
    try {
      if (user?.id && callId) {
        if (role === 'caller' && (localStatus === 'calling' || localStatus === 'ringing')) {
          await callService.cancelCall(callId, user.id);
        } else {
          await callService.endCall(callId, user.id);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to update call on server');
    }
    await sessionRef.current?.dispose();
    sessionRef.current = null;
    if (!TERMINAL.has(String(localStatus))) setLocalStatus('ended');
  };

  useEffect(() => {
    const onBack = () => {
      if (TERMINAL.has(String(localStatus))) {
        reset();
        navigation.goBack();
        return true;
      }
      hangup();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [localStatus]);

  const leaveScreen = () => {
    reset();
    navigation.goBack();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sessionRef.current?.setMuted(next);
  };

  const isTerminal = TERMINAL.has(String(localStatus));
  const showTimer =
    connectedAt != null &&
    (localStatus === 'connected' || localStatus === 'reconnecting');

  const statusLabel =
    localStatus === 'calling'
      ? 'Calling...'
      : localStatus === 'connecting'
        ? 'Connecting...'
        : localStatus === 'reconnecting'
          ? 'Reconnecting...'
          : localStatus === 'connected'
            ? 'Connected'
            : localStatus === 'no_answer'
              ? 'No answer'
              : localStatus === 'declined'
                ? 'Declined'
                : localStatus === 'cancelled'
                  ? 'Cancelled'
                  : localStatus === 'busy'
                    ? 'Busy'
                    : localStatus === 'failed'
                      ? 'Failed'
                      : localStatus === 'ended'
                        ? 'Call ended'
                        : String(localStatus);

  return (
    <View style={styles.container}>
      <Avatar
        uri={peer?.profile_picture || undefined}
        name={displayName(peer, remoteUserId || 'User')}
        size={96}
      />
      <Text style={styles.name}>{displayName(peer, remoteUserId || 'User')}</Text>
      {peer?.username ? <Text style={styles.tag}>@{peer.username}</Text> : null}
      {peerLoadError ? <Text style={styles.hint}>{peerLoadError}</Text> : null}
      <Text style={styles.status}>{statusLabel}</Text>
      <Text style={styles.timer}>
        {showTimer ? formatDuration(Date.now() - (connectedAt as number)) : '00:00'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isTerminal ? (
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={toggleMute}>
            <Text style={styles.btnText}>{muted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.secondary]} disabled>
            <Text style={styles.btnTextMuted}>Speaker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.end]} onPress={hangup}>
            <Text style={styles.btnText}>{localStatus === 'calling' ? 'Cancel' : 'End'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.btn, styles.done]} onPress={leaveScreen}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.footnote}>
        Speaker routing needs a native audio session module. Mute uses the WebRTC track when a session exists.
      </Text>
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
  name: { color: '#F9FAFB', fontSize: 26, fontWeight: '700', marginTop: 16 },
  tag: { color: '#9CA3AF', marginTop: 4 },
  status: {
    color: '#A78BFA',
    marginTop: 20,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timer: { color: '#F9FAFB', fontSize: 40, fontWeight: '300', marginTop: 12 },
  error: { color: '#EF4444', marginTop: 16, textAlign: 'center', paddingHorizontal: 12 },
  hint: { color: '#FBBF24', fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' },
  btn: {
    backgroundColor: '#1E1E2A',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    minWidth: 96,
    alignItems: 'center',
  },
  secondary: { opacity: 0.7 },
  end: { backgroundColor: '#EF4444' },
  done: { marginTop: 32, backgroundColor: '#7C3AED', minWidth: 140 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextMuted: { color: '#9CA3AF', fontWeight: '600', fontSize: 12 },
  footnote: { color: '#6B7280', fontSize: 11, marginTop: 28, textAlign: 'center', lineHeight: 16 },
});
