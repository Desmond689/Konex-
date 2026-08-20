import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Button from '../atoms/Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionText?: string;
  icon?: string;
  required?: boolean;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionText,
  onAction,
  icon,
  style,
}) => {
  const label = actionLabel || actionText;
  return (
    <View style={[styles.container, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {label && onAction ? (
        <Button title={label} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { color: '#F9FAFB', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  desc: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  btn: { marginTop: 8 },
});

export default EmptyState;
