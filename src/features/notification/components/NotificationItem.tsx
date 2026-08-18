import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  body: string;
  read?: boolean;
  createdAt?: string;
  onPress?: () => void;
}

export const NotificationItem: React.FC<Props> = ({ title, body, read, createdAt, onPress }) => (
  <TouchableOpacity style={[styles.row, !read && styles.unread]} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body} numberOfLines={2}>{body}</Text>
      {createdAt ? <Text style={styles.time}>{createdAt}</Text> : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  unread: { backgroundColor: 'rgba(124, 58, 237, 0.08)' },
  content: { flex: 1 },
  title: { color: '#F9FAFB', fontSize: 15, fontWeight: '600' },
  body: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  time: { color: '#6B7280', fontSize: 11, marginTop: 6 },
});

export default NotificationItem;
