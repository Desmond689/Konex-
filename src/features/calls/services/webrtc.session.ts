/**
 * WebRTC audio session for KONEX.
 * Requires react-native-webrtc in a development/production build (not Expo Go).
 * Never reports "connected" unless RTCPeerConnection reaches connected/completed.
 */
import { Platform, PermissionsAndroid } from 'react-native';
import { callService } from './call.service';
import { logger } from '../../../core/logger/logger.service';

type IcePayload = { candidate: string; sdpMid?: string | null; sdpMLineIndex?: number | null };

function loadWebrtc(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-webrtc');
  } catch (e) {
    return null;
  }
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Production: add TURN servers via env (required for many mobile networks)
  ...(process.env.EXPO_PUBLIC_TURN_URL
    ? [
        {
          urls: process.env.EXPO_PUBLIC_TURN_URL,
          username: process.env.EXPO_PUBLIC_TURN_USERNAME || '',
          credential: process.env.EXPO_PUBLIC_TURN_CREDENTIAL || '',
        },
      ]
    : []),
];

export async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone',
        message: 'KONEX needs the microphone for voice calls.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS: permission prompted when getUserMedia runs
  return true;
}

export class WebrtcAudioSession {
  private pc: any = null;
  private localStream: any = null;
  private unsubSignals: (() => void) | null = null;
  private callId: string;
  private localUserId: string;
  private remoteUserId: string | null;
  private isInitiator: boolean;
  private onState: (s: string) => void;
  private disposed = false;

  constructor(opts: {
    callId: string;
    localUserId: string;
    remoteUserId: string | null;
    isInitiator: boolean;
    onConnectionState: (s: string) => void;
  }) {
    this.callId = opts.callId;
    this.localUserId = opts.localUserId;
    this.remoteUserId = opts.remoteUserId;
    this.isInitiator = opts.isInitiator;
    this.onState = opts.onConnectionState;
  }

  async start(): Promise<void> {
    const webrtc = loadWebrtc();
    if (!webrtc) {
      this.onState('failed');
      throw new Error(
        'react-native-webrtc is not available. Use a development build (expo prebuild / EAS), not Expo Go.'
      );
    }

    const allowed = await requestMicPermission();
    if (!allowed) {
      this.onState('failed');
      throw new Error('Microphone permission denied');
    }

    const { mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = webrtc;

    this.localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.localStream.getTracks().forEach((track: any) => {
      this.pc.addTrack(track, this.localStream);
    });

    this.pc.oniceconnectionstatechange = () => {
      const s = this.pc?.iceConnectionState;
      logger.info('ICE state', { s, callId: this.callId });
      if (s === 'connected' || s === 'completed') this.onState('connected');
      else if (s === 'checking' || s === 'connected') this.onState('connecting');
      else if (s === 'disconnected') this.onState('reconnecting');
      else if (s === 'failed') this.onState('failed');
      else if (s === 'closed') this.onState('disconnected');
    };

    this.pc.onconnectionstatechange = () => {
      const s = this.pc?.connectionState;
      if (s === 'connected') this.onState('connected');
      if (s === 'failed') this.onState('failed');
      if (s === 'disconnected') this.onState('reconnecting');
    };

    this.pc.onicecandidate = async (event: any) => {
      if (!event.candidate || this.disposed) return;
      try {
        await callService.sendSignal({
          callId: this.callId,
          fromUser: this.localUserId,
          toUser: this.remoteUserId,
          signalType: 'ice',
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          } as IcePayload,
        });
      } catch (e) {
        logger.error('ICE signal failed', { e });
      }
    };

    this.unsubSignals = callService.subscribeSignals(this.callId, async (row) => {
      if (this.disposed || row.from_user === this.localUserId) return;
      try {
        if (row.signal_type === 'offer' && row.payload?.sdp) {
          await this.pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'offer', sdp: row.payload.sdp })
          );
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          await callService.sendSignal({
            callId: this.callId,
            fromUser: this.localUserId,
            toUser: row.from_user,
            signalType: 'answer',
            payload: { sdp: answer.sdp },
          });
        } else if (row.signal_type === 'answer' && row.payload?.sdp) {
          await this.pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: row.payload.sdp })
          );
        } else if (row.signal_type === 'ice' && row.payload?.candidate) {
          await this.pc.addIceCandidate(
            new RTCIceCandidate({
              candidate: row.payload.candidate,
              sdpMid: row.payload.sdpMid,
              sdpMLineIndex: row.payload.sdpMLineIndex,
            })
          );
        } else if (row.signal_type === 'hangup' || row.signal_type === 'cancel') {
          this.onState('ended');
        }
      } catch (e) {
        logger.error('signal handling error', { e });
        this.onState('failed');
      }
    });

    if (this.isInitiator) {
      this.onState('connecting');
      const offer = await this.pc.createOffer({ offerToReceiveAudio: true });
      await this.pc.setLocalDescription(offer);
      await callService.sendSignal({
        callId: this.callId,
        fromUser: this.localUserId,
        toUser: this.remoteUserId,
        signalType: 'offer',
        payload: { sdp: offer.sdp },
      });
    } else {
      this.onState('connecting');
    }
  }

  setMuted(muted: boolean) {
    this.localStream?.getAudioTracks?.().forEach((t: any) => {
      t.enabled = !muted;
    });
  }

  async dispose() {
    this.disposed = true;
    this.unsubSignals?.();
    this.unsubSignals = null;
    try {
      this.localStream?.getTracks?.().forEach((t: any) => t.stop());
    } catch {
      /* */
    }
    try {
      this.pc?.close?.();
    } catch {
      /* */
    }
    this.localStream = null;
    this.pc = null;
  }
}

export function isWebrtcNativeAvailable(): boolean {
  return !!loadWebrtc();
}
