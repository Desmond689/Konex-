import React, { ReactNode } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../molecules/EmptyState';

interface ListTemplateProps<T> {
  title: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  headerRight?: ReactNode;
}

export function ListTemplate<T>({
  title,
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  headerRight,
}: ListTemplateProps<T>) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {headerRight}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={data.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={<EmptyState title={emptyTitle} description={emptyDescription} />}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

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
  list: { padding: 16 },
  empty: { flexGrow: 1 },
});

export default ListTemplate;
