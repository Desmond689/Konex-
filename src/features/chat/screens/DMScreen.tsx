import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';
import { chatService } from '../../../api/services/chat.service';
import { callService } from '../../calls/services/call.service';
import { isWebrtcNativeAvailable } from '../../calls/services/webrtc.session';

export default function DMScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId || 'dm';
  const otherUserId = route.params?.userId || conversationId;
  const user = useAuthStore((s) => s.user);
  const messages = useChatStore((s) => s.messages[conversationId] || []);
  const addMessage = useChatStore((s) => s.addMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const [text, setText] = useState('');
  
  const [sending, setSending] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            if (!user?.id) {
              Alert.alert('Sign in required');
              return;
            }
            const other = otherUserId;
            if (!other || other === 'dm' || String(other).startsWith('local')) {
              Alert.alert('Invalid user', 'Open a DM with a real user id to call.');
              return;
            }
            if (!isWebrtcNativeAvailable()) {
              Alert.alert(
                'Cannot start call',
                'react-native-webrtc is not available. Use a development build, not Expo Go.'
              );
              return;
            }
            try {
              const call = await callService.startDmCall({
                callerId: user.id,
                calleeId: String(other),
                chatId: conversationId !== 'dm' ? conversationId : null,
              });
              navigation.navigate('ActiveCall', {
                callId: call.id,
                role: 'caller',
                remoteUserId: String(other),
                peerName: String(other),
              });
            } catch (e: any) {
              Alert.alert('Call failed', e?.userMessage || e?.message || 'Could not create call');
            }
          }}
          style={{ paddingHorizontal: 12 }}
        >
          <Text style={{ color: '#A78BFA', fontWeight: '700' }}>Call</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, user?.id, otherUserId, conversationId]);


  const send = async () => {
    const content = text.trim();
    if (!content || !user?.id) return;
    if (!otherUserId || otherUserId === 'dm' || String(otherUserId).startsWith('local')) {
      Alert.alert('Invalid recipient', 'Open a DM from a real user conversation.');
      return;
    }
    setSending(true);
    const optimisticId = `tmp_${Date.now()}`;
    const optimistic = {
      id: optimisticId,
      conversationId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      type: 'text' as const,
    };
    addMessage(conversationId, optimistic);
    setText('');
    try {
      const saved = await chatService.sendDMMessage(user.id, otherUserId, content);
      // Replace optimistic with server row if returned
      const current = useChatStore.getState().messages[conversationId] || [];
      setMessages(
        conversationId,
        current.map((m) =>
          m.id === optimisticId
            ? {
                id: saved?.id || optimisticId,
                conversationId,
                senderId: user.id,
                content,
                createdAt: saved?.created_at || optimistic.createdAt,
                type: 'text',
              }
            : m
        )
      );
    } catch (e: any) {
      // Roll back optimistic message
      const current = useChatStore.getState().messages[conversationId] || [];
      setMessages(conversationId, current.filter((m) => m.id !== optimisticId));
      Alert.alert('Send failed', e?.userMessage || e?.message || 'Message was not saved on the server.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message..." placeholderTextColor="#6B7280" onSubmitEditing={send} editable={!sending} />
        <TouchableOpacity style={styles.send} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  list: { padding: 16, flexGrow: 1 },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#7C3AED' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#1E1E2A' },
  bubbleText: { color: '#F9FAFB', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#1E1E2A', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#12121A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#F9FAFB', borderWidth: 1, borderColor: '#1E1E2A' },
  send: { backgroundColor: '#7C3AED', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendText: { color: '#fff', fontWeight: '700' },
});
