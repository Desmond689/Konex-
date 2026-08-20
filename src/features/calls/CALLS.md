# KONEX Calls

## Stack
- Metadata + signaling: Supabase tables `calls`, `call_participants`, `call_signals` + Realtime
- Audio: WebRTC via `react-native-webrtc` (development/production native build required)
- STUN: Google public STUN; TURN via EXPO_PUBLIC_TURN_* env when set

## Not Expo Go
Expo Go does not include react-native-webrtc. Use `npx expo prebuild` + dev client / EAS.

## SQL
Apply `supabase/migrations/20260816_konex_calls.sql` and enable Realtime on calls, call_signals, call_participants.

## Tests
All two-device audio tests: NOT TESTED until real Supabase + native build + two devices.
