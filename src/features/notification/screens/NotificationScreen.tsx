import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNotificationStore } from '../../../store/notificationStore';

export default function NotificationScreen() {
  const notifications = useNotificationStore((s) => s.notifications);
  const error = useNotificationStore((s) => s.error);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const initializeNotifications = useNotificationStore((s) => s.initializeNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeNotifications();
    setRefreshing(false);
  }, [initializeNotifications]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading && notifications.length === 0 ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
          ListEmptyComponent={<Text style={styles.empty}>No notifications from server</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.row, !item.read && styles.unread]} onPress={() => markRead(item.id)}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  error: { color: '#EF4444', marginBottom: 8 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  row: { backgroundColor: '#12121A', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A' },
  unread: { borderColor: '#7C3AED' },
  rowTitle: { color: '#F9FAFB', fontWeight: '700' },
  body: { color: '#9CA3AF', marginTop: 4 },
});
