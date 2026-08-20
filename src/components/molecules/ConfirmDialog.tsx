import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.row}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, destructive && styles.destructive]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#12121A', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: '#1E1E2A' },
  title: { color: '#F9FAFB', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: '#9CA3AF', fontSize: 14, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: '#9CA3AF', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  destructive: { backgroundColor: '#EF4444' },
  confirmText: { color: '#fff', fontWeight: '600' },
});

export default ConfirmDialog;
