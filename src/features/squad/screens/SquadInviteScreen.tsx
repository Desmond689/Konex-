/**
 * KONEX SquadInviteScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen for inviting users to a squad
 * 
 * Usage:
 * <SquadInviteScreen navigation={navigation} route={route} />
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    Text,
    View,
    ViewStyle
} from 'react-native';
import { searchService } from '../../../api/services/search.service';
import { squadService } from '../../../api/services/squad.service';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useSquad } from '../hooks/useSquad';

// ============================================
// 1. TYPES
// ============================================

export interface SquadInviteScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadInviteScreen: React.FC<SquadInviteScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { squadId } = route.params || {};
  const { user } = useAuth();
  const { squad, isLeader, isAdmin } = useSquad(squadId);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  const canInvite = isLeader || isAdmin;

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await searchService.searchUsers(searchQuery);
      // Filter out users already in squad
      const squadMemberIds = squad?.memberIds || [];
      const filtered = result.filter((u: any) => !squadMemberIds.includes(u.id));
      setResults(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (userId: string) => {
    try {
      setInviting(userId);
      await squadService.sendInvite(squadId, userId);
      Alert.alert('Success', 'Invite sent successfully');
      // Remove from results
      setResults(results.filter((u) => u.id !== userId));
    } catch (error) {
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setInviting(null);
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
        source={item.avatar_url ? { uri: item.avatar_url } : undefined}
        name={item.gamer_tag}
        size="md"
        online={item.online_status === 'online'}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{item.gamer_tag}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>@{item.username}</Text>
      </View>
      <Button
        title={inviting === item.id ? 'Sending...' : 'Invite'}
        variant="primary"
        size="sm"
        onPress={() => handleInvite(item.id)}
        loading={inviting === item.id}
        disabled={inviting === item.id}
      />
    </View>
  );

  if (!canInvite) {
    return (
      <SafeAreaView style={containerStyle}>
        <NavigationHeader
          title="Invite Members"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <EmptyState
            title="Permission Denied"
            description="Only squad leaders and admins can invite members."
            icon="🔒"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Invite Members"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={contentStyle}>
        <Input
          placeholder="Search users by gamer tag..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={{ marginBottom: 12 }}
        />

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <EmptyState
                title={searchQuery.length > 2 ? 'No users found' : 'Search for users'}
                description={searchQuery.length > 2 ? 'Try a different search term' : 'Type at least 3 characters to search'}
                icon="🔍"
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

export default SquadInviteScreen;