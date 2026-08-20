/**
 * KONEX SquadJoinRequestsScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen for managing squad join requests
 * 
 * Usage:
 * <SquadJoinRequestsScreen navigation={navigation} route={route} />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    Text,
    View,
    ViewStyle
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useTheme } from '../../../hooks/useTheme';
import { useSquad } from '../hooks/useSquad';

// ============================================
// 1. TYPES
// ============================================

export interface SquadJoinRequestsScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadJoinRequestsScreen: React.FC<SquadJoinRequestsScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { squadId } = route.params || {};
  const {
    squad,
    joinRequests,
    isLoading,
    isRefreshing,
    refresh,
    approveJoinRequest,
    denyJoinRequest,
    isLeader,
    isAdmin,
  } = useSquad(squadId, {
    includeRequests: true,
    autoFetch: true,
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const canManageRequests = isLeader || isAdmin;

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      setProcessingId(requestId);
      await approveJoinRequest(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (requestId: string, userId: string) => {
    try {
      setProcessingId(requestId);
      await denyJoinRequest(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to deny request');
    } finally {
      setProcessingId(null);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    padding: 16,
    flex: 1,
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Avatar
        source={item.user?.avatar_url ? { uri: item.user.avatar_url } : undefined}
        name={item.user?.gamer_tag}
        size="md"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
          {item.user?.gamer_tag}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          @{item.user?.username} • {item.user?.skill_level || 'Unknown'} • {item.user?.role || 'Flex'}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
          Requested {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Button
          title="Approve"
          variant="success"
          size="xs"
          onPress={() => handleApprove(item.id, item.user_id)}
          loading={processingId === item.id}
          disabled={processingId === item.id}
        />
        <Button
          title="Deny"
          variant="danger"
          size="xs"
          onPress={() => handleDeny(item.id, item.user_id)}
          loading={processingId === item.id}
          disabled={processingId === item.id}
        />
      </View>
    </View>
  );

  if (!canManageRequests) {
    return (
      <SafeAreaView style={containerStyle}>
        <NavigationHeader
          title="Join Requests"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <EmptyState
            title="Permission Denied"
            description="Only squad leaders and admins can manage join requests."
            icon="🔒"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Join Requests"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={contentStyle}>
        {isLoading && joinRequests.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner size="large" />
          </View>
        ) : (
          <FlatList
            data={joinRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No Join Requests"
                description="No one has requested to join this squad yet."
                icon="📋"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SquadJoinRequestsScreen;