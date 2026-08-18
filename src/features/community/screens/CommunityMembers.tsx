/**
 * KONEX CommunityMembers Screen
 * Billion Dollar Code - Production Ready
 * 
 * Members tab in community
 * 
 * Usage:
 * <CommunityMembers communityId={communityId} />
 */

import React from 'react';
import {
    View,
    ViewStyle,
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import { useTheme } from '../../../hooks/useTheme';
import CommunityMemberList from '../components/CommunityMemberList';
import { useCommunity } from '../hooks/useCommunity';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityMembersProps {
  communityId: string;
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityMembers: React.FC<CommunityMembersProps> = ({
  communityId,
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    members,
    isLoading,
    isRefreshing,
    refresh,
  } = useCommunity(communityId, { includeMembers: true });

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  };

  if (isLoading && members.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <CommunityMemberList
        members={members}
        onMemberPress={(userId) => navigation.navigate('Profile', { userId })}
        loading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />
    </View>
  );
};

export default CommunityMembers;