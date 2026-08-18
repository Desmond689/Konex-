import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';
import { chatService } from '../../../api/services/chat.service';
import { subscribeToMessages } from '../../../api/client/realtime.client';

export default function SquadChatScreen() {
  const route = useRoute<any>();
  const squadId = route.params?.squadId as string;
  const conversationId = `squad_${squadId}`;
  const user = useAuthStore((s) => s.user);
  const messages = useChatStore((s) => s.messages[conversationId] || []);
  const setMessages = useChatStore((s) => s.setMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!squadId) return;
    setLoading(true);
    try {
      // Prefer squad-scoped fetch if available; else conversation id
      let rows: any[] = [];
      try {
        rows = await chatService.getSquadConversation(squadId);
      } catch (e) {
        throw e;
      }
      setMessages(
        conversationId,
        (rows || []).map((m: any) => ({
          id: m.id,
          conversationId,
          senderId: m.sender_id,
          content: typeof m.content === 'string' ? m.content : m.content?.text || '',
          createdAt: m.created_at,
          type: 'text' as const,
        })).reverse()
      );
    } catch (e: any) {
      Alert.alert('Load failed', e?.message || 'Could not load messages from server');
    } finally {
      setLoading(false);
    }
  }, [squadId, conversationId, setMessages]);

  useEffect(() => {
    load();
    // Realtime: new messages on messages table
    let subId: string | undefined;
    try {
      subId = subscribeToMessages((payload: any) => {
        const row = payload?.new || payload;
        if (!row || (row.squad_id && row.squad_id !== squadId)) return;
        addMessage(conversationId, {
          id: row.id,
          conversationId,
          senderId: row.sender_id,
          content: row.content,
          createdAt: row.created_at,
          type: 'text',
        });
      });
    } catch {
      // realtime optional
    }
    return () => {
      // unsubscribe handled by service if id returned — best effort
    };
  }, [load, squadId, conversationId, addMessage]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user?.id || !squadId) return;
    setSending(true);
    const optimisticId = `tmp_${Date.now()}`;
    addMessage(conversationId, {
      id: optimisticId,
      conversationId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      type: 'text',
    });
    setText('');
    try {
      await chatService.sendSquadMessage(user.id, squadId, content);
      // Keep optimistic; realtime may dedupe by id if server echoes
    } catch (e: any) {
      const current = useChatStore.getState().messages[conversationId] || [];
      setMessages(conversationId, current.filter((m) => m.id !== optimisticId));
      Alert.alert('Send failed', e?.userMessage || e?.message || 'Message not saved on server');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Squad chat · server-backed</Text>
        {loading ? <ActivityIndicator size="small" color="#7C3AED" /> : null}
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={styles.bubbleText}>{
                typeof item.content === 'string'
                  ? item.content
                  : (item as any).content?.text || String(item.content || '')
              }</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message squad..." placeholderTextColor="#6B7280" onSubmitEditing={send} editable={!sending} />
        <TouchableOpacity style={styles.send} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  banner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  bannerText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  list: { padding: 16, flexGrow: 1 },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 40 },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#7C3AED' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#1E1E2A' },
  bubbleText: { color: '#F9FAFB', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#1E1E2A', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#12121A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#F9FAFB', borderWidth: 1, borderColor: '#1E1E2A' },
  send: { backgroundColor: '#7C3AED', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendText: { color: '#fff', fontWeight: '700' },
});
