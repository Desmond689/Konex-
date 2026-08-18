import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FILTERS = ['All', 'Mentions', 'Squads', 'System'];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export const NotificationFilter: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.row}>
    {FILTERS.map((f) => (
      <TouchableOpacity
        key={f}
        style={[styles.chip, value === f && styles.chipActive]}
        onPress={() => onChange(f)}
      >
        <Text style={[styles.chipText, value === f && styles.chipTextActive]}>{f}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1E1E2A' },
  chipActive: { backgroundColor: '#7C3AED' },
  chipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
});

export default NotificationFilter;
