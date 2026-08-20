import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';
import { chatService } from '../../../api/services/chat.service';

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const rows = await chatService.getConversations(user.id);
      const mapped = (rows || []).map((c: any, i: number) => ({
        id: c.id || c.other_user?.id || c.squad?.id || `c_${i}`,
        type: (c.type === 'squad' ? 'squad' : 'dm') as 'dm' | 'squad',
        title:
          c.title ||
          c.other_user?.gamer_tag ||
          c.other_user?.username ||
          c.squad?.name ||
          'Chat',
        participantIds: [],
        lastMessage: c.last_message
          ? {
              id: c.last_message.id,
              conversationId: '',
              senderId: c.last_message.sender_id,
              content: c.last_message.content,
              createdAt: c.last_message.created_at,
            }
          : undefined,
        unreadCount: c.unread_count || 0,
        updatedAt: c.last_message?.created_at || new Date().toISOString(),
      }));
      setConversations(mapped);
    } catch {
      // keep local
    } finally {
      setLoading(false);
    }
  }, [user?.id, setConversations]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CallHistory')}>
          <Text style={{ color: '#A78BFA', fontWeight: '700' }}>Calls</Text>
        </TouchableOpacity>
      </View>
      {loading && conversations.length === 0 ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
          }
          contentContainerStyle={conversations.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No conversations</Text>
              <Text style={styles.emptySub}>Start a DM or open squad chat from a squad</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate(item.type === 'squad' ? 'SquadChat' : 'DM', {
                  conversationId: item.id,
                  squadId: item.type === 'squad' ? (item as any).squad_id || item.id : undefined,
                  userId: item.type === 'dm' ? (item.participantIds || []).find((id: string) => id !== user?.id) : undefined,
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.title || 'C')[0]}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name}>{item.title || 'Chat'}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage?.content || 'No messages yet'}
                </Text>
              </View>
              {item.unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', paddingTop: 16 },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16 },
  emptyWrap: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '600' },
  emptySub: { color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2A',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  body: { flex: 1 },
  name: { color: '#F9FAFB', fontWeight: '600', fontSize: 16 },
  preview: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
