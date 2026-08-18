import { create } from 'zustand';
import type { CallRow, CallStatus } from '../services/call.service';

interface CallState {
  activeCall: CallRow | null;
  localStatus: CallStatus | 'idle';
  connectedAt: number | null;
  muted: boolean;
  speaker: boolean;
  error: string | null;
  incomingCall: CallRow | null;
  setActiveCall: (c: CallRow | null) => void;
  setLocalStatus: (s: CallState['localStatus']) => void;
  setConnectedAt: (t: number | null) => void;
  setMuted: (m: boolean) => void;
  setSpeaker: (s: boolean) => void;
  setError: (e: string | null) => void;
  setIncomingCall: (c: CallRow | null) => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  localStatus: 'idle',
  connectedAt: null,
  muted: false,
  speaker: false,
  error: null,
  incomingCall: null,
  setActiveCall: (activeCall) => set({ activeCall }),
  setLocalStatus: (localStatus) => set({ localStatus }),
  setConnectedAt: (connectedAt) => set({ connectedAt }),
  setMuted: (muted) => set({ muted }),
  setSpeaker: (speaker) => set({ speaker }),
  setError: (error) => set({ error }),
  setIncomingCall: (incomingCall) => set({ incomingCall }),
  reset: () =>
    set({
      activeCall: null,
      localStatus: 'idle',
      connectedAt: null,
      muted: false,
      speaker: false,
      error: null,
      incomingCall: null,
    }),
}));

export default useCallStore;
