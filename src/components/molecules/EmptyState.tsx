import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../atoms/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.desc}>{description}</Text> : null}
    {actionLabel && onAction ? (
      <Button title={actionLabel} onPress={onAction} style={styles.btn} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { color: '#F9FAFB', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  desc: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  btn: { marginTop: 8 },
});

export default EmptyState;
