import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { callService } from './services/call.service';
import { useAuthStore } from '../../store/authStore';
import { useCallStore } from './store/callStore';

/**
 * Listens for INSERT on calls where current user is callee.
 * Navigates to IncomingCall. Does not invent ringing without a real row.
 */
export function CallIncomingListener() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const setIncomingCall = useCallStore((s) => s.setIncomingCall);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = callService.subscribeIncoming(user.id, (call) => {
      if (call.type !== 'dm') return;
      if (!['calling', 'ringing'].includes(call.status)) return;
      setIncomingCall(call);
      try {
        callService.setStatus(call.id, 'ringing').catch(() => undefined);
      } catch {
        /* */
      }
      navigation.navigate('IncomingCall', {
        callId: call.id,
        callerName: call.caller_id,
      });
    });
    return unsub;
  }, [user?.id, navigation, setIncomingCall]);

  return null;
}

export default CallIncomingListener;
