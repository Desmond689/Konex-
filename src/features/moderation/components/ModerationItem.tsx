import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  reason: string;
  targetType: string;
  status?: string;
  createdAt?: string;
}

export const ModerationItem: React.FC<Props> = ({ reason, targetType, status, createdAt }) => (
  <View style={styles.card}>
    <Text style={styles.type}>{targetType}</Text>
    <Text style={styles.reason}>{reason}</Text>
    <Text style={styles.meta}>{status || 'pending'}{createdAt ? ` · ${createdAt}` : ''}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1E1E2A' },
  type: { color: '#7C3AED', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  reason: { color: '#F9FAFB', fontSize: 15, marginTop: 4 },
  meta: { color: '#6B7280', fontSize: 12, marginTop: 6 },
});

export default ModerationItem;
