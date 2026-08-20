import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  slots: number;
  filledSlots: number;
  rank?: string;
  onPress?: () => void;
}

export const LFGCard: React.FC<Props> = ({ title, slots, filledSlots, rank, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.meta}>
      {filledSlots}/{slots} slots{rank ? ` · ${rank}` : ''}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontSize: 16, fontWeight: '600' },
  meta: { color: '#9CA3AF', fontSize: 13, marginTop: 6 },
});

export default LFGCard;
