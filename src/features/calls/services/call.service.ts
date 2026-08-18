/**
 * KONEX call metadata + signaling via Supabase.
 * Audio media is WebRTC only (not stored in DB).
 */
import { supabase } from '../../../api/client/supabase.client';
import { notificationService } from '../../../api/services/notification.service';
import { ErrorCode, ErrorSeverity, KonexError } from '../../../core/errors/app.error';
import { logger } from '../../../core/logger/logger.service';

export type CallType = 'dm' | 'squad';
export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'declined'
  | 'missed'
  | 'busy'
  | 'failed'
  | 'cancelled'
  | 'no_answer'
  | 'disconnected';

export type SignalType =
  | 'offer'
  | 'answer'
  | 'ice'
  | 'hangup'
  | 'accept'
  | 'decline'
  | 'busy'
  | 'cancel'
  | 'join'
  | 'leave';

export interface CallRow {
  id: string;
  type: CallType;
  status: CallStatus;
  caller_id: string;
  callee_id: string | null;
  chat_id: string | null;
  squad_id: string | null;
  end_reason: string | null;
  created_at: string;
  ringing_at: string | null;
  connected_at: string | null;
  ended_at: string | null;
}

async function assertNotBlocked(a: string, b: string): Promise<void> {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .or(
      `and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`
    )
    .limit(1);
  if (error) {
    // If blocks table missing, surface error — do not skip silently as "ok"
    logger.warn('blocks check error', { error });
    throw new KonexError(
      ErrorCode.DB_QUERY_ERROR,
      'Block check failed',
      'Could not verify block status. Call not started.',
      ErrorSeverity.WARNING,
      { error }
    );
  }
  if (data && data.length > 0) {
    throw new KonexError(
      ErrorCode.AUTH_UNAUTHORIZED,
      'Blocked',
      'Calling is not allowed between these users.',
      ErrorSeverity.WARNING,
      {}
    );
  }
}

class CallService {
  async startDmCall(params: {
    callerId: string;
    calleeId: string;
    chatId?: string | null;
  }): Promise<CallRow> {
    if (!params.callerId || !params.calleeId) {
      throw new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Missing users',
        'Caller and callee are required.',
        ErrorSeverity.WARNING,
        {}
      );
    }
    if (params.callerId === params.calleeId) {
      throw new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Invalid call',
        'Cannot call yourself.',
        ErrorSeverity.WARNING,
        {}
      );
    }

    await assertNotBlocked(params.callerId, params.calleeId);

    // Busy if callee already in active call
    const { data: active } = await supabase
      .from('calls')
      .select('id')
      .eq('callee_id', params.calleeId)
      .in('status', ['calling', 'ringing', 'connecting', 'connected', 'reconnecting'])
      .limit(1);
    if (active && active.length > 0) {
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Busy',
        'User is busy on another call.',
        ErrorSeverity.WARNING,
        {}
      );
    }

    const { data, error } = await supabase
      .from('calls')
      .insert({
        type: 'dm',
        status: 'calling',
        caller_id: params.callerId,
        callee_id: params.calleeId,
        chat_id: params.chatId || null,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('call_participants').insert([
      { call_id: data.id, user_id: params.callerId, role: 'caller' },
      { call_id: data.id, user_id: params.calleeId, role: 'callee' },
    ]);

    try {
      await notificationService.createNotification({
        user_id: params.calleeId,
        type: 'incoming_call',
        title: 'Incoming voice call',
        body: 'Someone is calling you on KONEX',
        data: { call_id: data.id, type: 'dm' },
        priority: 'high',
        status: 'unread',
      });
    } catch (e) {
      logger.warn('call notification failed (call still created)', { e });
    }

    return data as CallRow;
  }

  async startSquadVoice(params: { userId: string; squadId: string }): Promise<CallRow> {
    // Authorization: must be squad member (also enforced by RLS)
    const { data: squad, error: sErr } = await supabase
      .from('squads')
      .select('id, name, leader, created_by, members')
      .eq('id', params.squadId)
      .single();
    if (sErr) throw sErr;

    const members = squad.members;
    const memberIds: string[] = Array.isArray(members)
      ? members.map((m: any) => (typeof m === 'string' ? m : m.id)).filter(Boolean)
      : [];
    const allowed =
      squad.leader === params.userId ||
      squad.created_by === params.userId ||
      memberIds.includes(params.userId);
    if (!allowed) {
      throw new KonexError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Not a member',
        'Only squad members can start voice chat.',
        ErrorSeverity.WARNING,
        {}
      );
    }

    // Reuse active squad session if any
    const { data: existing } = await supabase
      .from('calls')
      .select('*')
      .eq('type', 'squad')
      .eq('squad_id', params.squadId)
      .in('status', ['calling', 'connecting', 'connected', 'reconnecting'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await this.joinCall(existing.id, params.userId);
      return existing as CallRow;
    }

    const { data, error } = await supabase
      .from('calls')
      .insert({
        type: 'squad',
        status: 'connected',
        caller_id: params.userId,
        callee_id: null,
        squad_id: params.squadId,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('call_participants').insert({
      call_id: data.id,
      user_id: params.userId,
      role: 'host',
    });

    // Notify other members (in-app) — not a phone ring
    for (const mid of memberIds) {
      if (mid === params.userId) continue;
      try {
        await notificationService.createNotification({
          user_id: mid,
          type: 'squad_voice',
          title: 'Squad voice chat',
          body: `Voice chat started in ${squad.name || 'your squad'}`,
          data: { call_id: data.id, squad_id: params.squadId },
          priority: 'normal',
          status: 'unread',
        });
      } catch {
        /* continue */
      }
    }

    return data as CallRow;
  }

  async joinCall(callId: string, userId: string): Promise<void> {
    const { data: call, error } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (error) throw error;
    if (['ended', 'declined', 'cancelled', 'failed', 'missed', 'no_answer'].includes(call.status)) {
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Call ended',
        'This call is no longer available.',
        ErrorSeverity.WARNING,
        {}
      );
    }
    if (call.type === 'squad' && call.squad_id) {
      const ok = await this.userIsSquadMember(userId, call.squad_id);
      if (!ok) {
        throw new KonexError(
          ErrorCode.AUTH_UNAUTHORIZED,
          'Not a member',
          'Only squad members can join this voice session.',
          ErrorSeverity.WARNING,
          {}
        );
      }
    }

    const { error: upErr } = await supabase.from('call_participants').upsert(
      {
        call_id: callId,
        user_id: userId,
        left_at: null,
        joined_at: new Date().toISOString(),
      },
      { onConflict: 'call_id,user_id' }
    );
    if (upErr) throw upErr;

    await this.sendSignal({
      callId,
      fromUser: userId,
      signalType: 'join',
      payload: {},
    });
  }

  async userIsSquadMember(userId: string, squadId: string): Promise<boolean> {
    const { data: squad } = await supabase
      .from('squads')
      .select('leader, created_by, members')
      .eq('id', squadId)
      .maybeSingle();
    if (!squad) return false;
    const members = squad.members;
    const memberIds: string[] = Array.isArray(members)
      ? members.map((m: any) => (typeof m === 'string' ? m : m.id)).filter(Boolean)
      : [];
    return squad.leader === userId || squad.created_by === userId || memberIds.includes(userId);
  }

  async setStatus(callId: string, status: CallStatus, endReason?: string): Promise<CallRow> {
    const patch: Record<string, unknown> = { status };
    if (status === 'ringing') patch.ringing_at = new Date().toISOString();
    if (status === 'connected') patch.connected_at = new Date().toISOString();
    if (
      ['ended', 'declined', 'cancelled', 'failed', 'missed', 'no_answer', 'disconnected', 'busy'].includes(
        status
      )
    ) {
      patch.ended_at = new Date().toISOString();
      if (endReason) patch.end_reason = endReason;
    }
    const { data, error } = await supabase.from('calls').update(patch).eq('id', callId).select().single();
    if (error) throw error;
    return data as CallRow;
  }

  async acceptDmCall(callId: string, userId: string): Promise<CallRow> {
    const { data: call, error } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (error) throw error;
    if (call.callee_id !== userId) {
      throw new KonexError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Not callee',
        'Only the callee can accept this call.',
        ErrorSeverity.WARNING,
        {}
      );
    }
    await this.sendSignal({
      callId,
      fromUser: userId,
      toUser: call.caller_id,
      signalType: 'accept',
      payload: {},
    });
    return this.setStatus(callId, 'connecting');
  }

  async declineDmCall(callId: string, userId: string): Promise<CallRow> {
    const { data: call, error } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (error) throw error;
    if (call.callee_id !== userId && call.caller_id !== userId) {
      throw new KonexError(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Not allowed',
        'You are not part of this call.',
        ErrorSeverity.WARNING,
        {}
      );
    }
    await this.sendSignal({
      callId,
      fromUser: userId,
      toUser: call.caller_id === userId ? call.callee_id : call.caller_id,
      signalType: 'decline',
      payload: {},
    });
    return this.setStatus(callId, 'declined', 'declined_by_user');
  }

  async cancelCall(callId: string, userId: string): Promise<CallRow> {
    await this.sendSignal({
      callId,
      fromUser: userId,
      signalType: 'cancel',
      payload: {},
    });
    return this.setStatus(callId, 'cancelled', 'cancelled_by_caller');
  }

  async endCall(callId: string, userId: string, reason = 'ended_by_user'): Promise<CallRow> {
    await this.sendSignal({
      callId,
      fromUser: userId,
      signalType: 'hangup',
      payload: { reason },
    });
    await supabase
      .from('call_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('call_id', callId)
      .eq('user_id', userId);

    const { data: remaining } = await supabase
      .from('call_participants')
      .select('id')
      .eq('call_id', callId)
      .is('left_at', null);

    if (!remaining || remaining.length === 0) {
      return this.setStatus(callId, 'ended', reason);
    }

    // DM: one leave ends for both
    const { data: call } = await supabase.from('calls').select('type').eq('id', callId).single();
    if (call?.type === 'dm') {
      return this.setStatus(callId, 'ended', reason);
    }
    return call as any;
  }

  async leaveSquadVoice(callId: string, userId: string): Promise<void> {
    await this.sendSignal({ callId, fromUser: userId, signalType: 'leave', payload: {} });
    await supabase
      .from('call_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('call_id', callId)
      .eq('user_id', userId);

    const { data: remaining } = await supabase
      .from('call_participants')
      .select('id')
      .eq('call_id', callId)
      .is('left_at', null);
    if (!remaining || remaining.length === 0) {
      await this.setStatus(callId, 'ended', 'empty_room');
    }
  }

  async sendSignal(params: {
    callId: string;
    fromUser: string;
    toUser?: string | null;
    signalType: SignalType;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await supabase.from('call_signals').insert({
      call_id: params.callId,
      from_user: params.fromUser,
      to_user: params.toUser || null,
      signal_type: params.signalType,
      payload: params.payload,
    });
    if (error) throw error;
  }

  async listHistory(userId: string, limit = 40): Promise<CallRow[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as CallRow[];
  }

  async getParticipants(callId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('call_participants')
      .select('*')
      .eq('call_id', callId)
      .is('left_at', null);
    if (error) throw error;
    return data || [];
  }

  async getCall(callId: string): Promise<CallRow> {
    const { data, error } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (error) throw error;
    return data as CallRow;
  }

  subscribeIncoming(userId: string, onCall: (call: CallRow) => void) {
    const channel = supabase
      .channel(`incoming-calls:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `callee_id=eq.${userId}`,
        },
        (payload) => {
          onCall(payload.new as CallRow);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeSignals(callId: string, onSignal: (row: any) => void) {
    const channel = supabase
      .channel(`call-signals:${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `call_id=eq.${callId}`,
        },
        (payload) => onSignal(payload.new)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeCall(callId: string, onUpdate: (call: CallRow) => void) {
    const channel = supabase
      .channel(`call-row:${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`,
        },
        (payload) => onUpdate(payload.new as CallRow)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const callService = new CallService();
export default callService;
