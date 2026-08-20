import React, { ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormTemplateProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const FormTemplate: React.FC<FormTemplateProps> = ({ title, children, footer }) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  title: { color: '#F9FAFB', fontSize: 20, fontWeight: '700' },
  body: { flex: 1 },
  content: { padding: 16 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#1E1E2A' },
});

export default FormTemplate;
