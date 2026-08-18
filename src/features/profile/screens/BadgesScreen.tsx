/**
 * KONEX BadgesScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen displaying all badges
 * 
 * Usage:
 * <BadgesScreen navigation={navigation} />
 */

import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    View,
    ViewStyle
} from 'react-native';
import { badgeService } from '../../../api/services/badge.service';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import ProfileBadges from '../components/ProfileBadges';

// ============================================
// 1. TYPES
// ============================================

export interface BadgesScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allBadges, userBadgesData] = await Promise.all([
        badgeService.getBadges(),
        badgeService.getUserBadges(user?.id || ''),
      ]);

      const earnedBadgeIds = userBadgesData.map((b: any) => b.badge_id);
      const featured = userBadgesData.filter((b: any) => b.is_featured).map((b: any) => b.badge_id);

      const badgesWithStatus = allBadges.map((badge: any) => ({
        ...badge,
        earned: earnedBadgeIds.includes(badge.id),
        earnedAt: userBadgesData.find((b: any) => b.badge_id === badge.id)?.awarded_at,
      }));

      setBadges(badgesWithStatus);
      setUserBadges(userBadgesData);
      setFeaturedBadgeIds(featured);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleFeatureBadge = async (badgeId: string) => {
    try {
      const isFeatured = featuredBadgeIds.includes(badgeId);
      let updatedFeatured = [...featuredBadgeIds];

      if (isFeatured) {
        updatedFeatured = updatedFeatured.filter((id) => id !== badgeId);
      } else {
        if (updatedFeatured.length >= 6) {
          Alert.alert('Max Featured', 'You can only feature up to 6 badges.');
          return;
        }
        updatedFeatured = [...updatedFeatured, badgeId];
      }

      await badgeService.setFeaturedBadges(user?.id || '', updatedFeatured);
      setFeaturedBadgeIds(updatedFeatured);
      Alert.alert('Success', isFeatured ? 'Badge removed from featured' : 'Badge featured!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update featured badges');
    }
  };

  const handleBadgePress = (badge: any) => {
    // Navigate to badge detail or show modal
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Badges"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <ProfileBadges
          badges={badges}
          featuredBadgeIds={featuredBadgeIds}
          onSelectBadge={handleBadgePress}
          onFeatureBadge={handleFeatureBadge}
          isOwn={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BadgesScreen;