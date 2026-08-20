import React, { ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DetailTemplateProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export const DetailTemplate: React.FC<DetailTemplateProps> = ({ title, children, headerRight }) => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {headerRight}
    </View>
    <ScrollView style={styles.body} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontSize: 20, fontWeight: '700' },
  body: { flex: 1 },
  content: { padding: 16 },
});

export default DetailTemplate;
