/**
 * KONEX CommunityScreen
 * Billion Dollar Code - Production Ready
 * 
 * Main community screen with tabs
 * 
 * Usage:
 * <CommunityScreen navigation={navigation} route={route} />
 */

import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    ViewStyle,
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import { useTheme } from '../../../hooks/useTheme';
import CommunityHeader from '../components/CommunityHeader';
import CommunityTabs, { CommunityTab } from '../components/CommunityTabs';
import { useCommunity } from '../hooks/useCommunity';
import CommunityLFG from './CommunityLFG';
import CommunityMembers from './CommunityMembers';
import CommunityPosts from './CommunityPosts';
import CommunitySquads from './CommunitySquads';
import CommunityTournaments from './CommunityTournaments';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { communityId } = route.params || {};
  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');

  const {
    community,
    isLoading,
    fetchCommunity,
  } = useCommunity(communityId);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <CommunityPosts communityId={communityId} navigation={navigation} />;
      case 'squads':
        return <CommunitySquads communityId={communityId} navigation={navigation} />;
      case 'lfg':
        return <CommunityLFG communityId={communityId} navigation={navigation} />;
      case 'tournaments':
        return <CommunityTournaments communityId={communityId} navigation={navigation} />;
      case 'members':
        return <CommunityMembers communityId={communityId} navigation={navigation} />;
      default:
        return null;
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (isLoading && !community) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <CommunityHeader
        community={community}
        onBack={() => navigation.goBack()}
        onSearch={() => navigation.navigate('Search', { communityId })}
      />
      <CommunityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

export default CommunityScreen;