import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NotificationItem from './NotificationItem';
import EmptyState from '../../../components/molecules/EmptyState';

interface Notification {
  id: string;
  title: string;
  body: string;
  read?: boolean;
  createdAt?: string;
}

interface Props {
  data: Notification[];
  onPressItem?: (id: string) => void;
}

export const NotificationList: React.FC<Props> = ({ data, onPressItem }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <NotificationItem
        title={item.title}
        body={item.body}
        read={item.read}
        createdAt={item.createdAt}
        onPress={() => onPressItem?.(item.id)}
      />
    )}
    ListEmptyComponent={<EmptyState title="No notifications" description="You're all caught up" />}
    contentContainerStyle={data.length === 0 ? styles.empty : undefined}
  />
);

const styles = StyleSheet.create({
  empty: { flexGrow: 1 },
});

export default NotificationList;
