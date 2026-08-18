import { callService } from '../../calls/services/call.service';
import { isWebrtcNativeAvailable } from '../../calls/services/webrtc.session';
/**
 * KONEX ProfileScreen
 * Billion Dollar Code - Production Ready
 * 
 * Main profile screen with header, stats, tabs, and actions
 * 
 * Usage:
 * <ProfileScreen navigation={navigation} route={route} />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import Tag from '../../../components/atoms/Tag';
import EmptyState from '../../../components/molecules/EmptyState';
import Tabs from '../../../components/molecules/Tabs';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { trackEvent } from '../../../config/analytics';
import { useLFG } from '../../../features/lfg/hooks/useLFG';
import { useAuth } from '../../../hooks/useAuth';
import { useFollow } from '../../../hooks/useFollow';
import { useFriend } from '../../../hooks/useFriend';
import { usePosts } from '../../../hooks/usePosts';
import { useTheme } from '../../../hooks/useTheme';
import { useUser } from '../../../hooks/useUser';

// ============================================
// 1. TYPES
// ============================================

export interface ProfileScreenProps {
  navigation: any;
  route: any;
}

type ProfileTab = 'posts' | 'clips' | 'lfg' | 'badges';

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { userId } = route.params || {};
  const { user: currentUser } = useAuth();
  const isOwnProfile = userId === currentUser?.id || !userId;

  // Profile data
  const {
    profile,
    isLoading: isProfileLoading,
    isRefreshing,
    error,
    fetchProfile,
    refresh,
    followUser,
    unfollowUser,
    addFriend,
    removeFriend,
  } = useUser(userId || currentUser?.id);

  // Follow/Friend status
  const { isFollowing, toggleFollow } = useFollow(userId || currentUser?.id);
  const { isFriend, isFriendRequestPending, isFriendRequestSent, sendRequest, cancelRequest, acceptRequest, declineRequest } = useFriend(
    userId || currentUser?.id
  );

  // Posts
  const {
    posts,
    isLoading: isPostsLoading,
    loadMore,
    refresh: refreshPosts,
    hasMore,
  } = usePosts({ userId: userId || currentUser?.id, feedType: 'latest', autoFetch: true });

  // LFG
  const { posts: lfgPosts, isLoading: isLFGLoading } = useLFG({
    userId: userId || currentUser?.id,
    autoFetch: true,
  });

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isRefreshingState, setIsRefreshingState] = useState(false);

  // ============================================
  // HANDLERS
  // ============================================

  const handleRefresh = async () => {
    setIsRefreshingState(true);
    await Promise.all([refresh(), refreshPosts()]);
    setIsRefreshingState(false);
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        trackEvent('profile_unfollow', { userId: profile.id });
      } else {
        await followUser(profile.id);
        trackEvent('profile_follow', { userId: profile.id });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to follow/unfollow user');
    }
  };

  const handleFriendRequest = async () => {
    if (!profile) return;
    try {
      if (isFriend) {
        Alert.alert(
          'Remove Friend',
          `Are you sure you want to remove ${profile.gamerTag} as a friend?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeFriend(profile.id);
                trackEvent('profile_remove_friend', { userId: profile.id });
              },
            },
          ]
        );
      } else if (isFriendRequestSent) {
        await cancelRequest();
      } else if (isFriendRequestPending) {
        Alert.alert(
          'Friend Request',
          `Accept friend request from ${profile.gamerTag}?`,
          [
            { text: 'Decline', style: 'cancel', onPress: () => declineRequest() },
            { text: 'Accept', onPress: () => acceptRequest() },
          ]
        );
      } else {
        await sendRequest();
        trackEvent('profile_send_friend_request', { userId: profile.id });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to manage friend request');
    }
  };

  const handleVoiceCall = async () => {
    if (!profile?.id || !currentUser?.id) return;
    if (!isWebrtcNativeAvailable()) {
      Alert.alert('Cannot call', 'react-native-webrtc native module required (dev build).');
      return;
    }
    try {
      const call = await callService.startDmCall({
        callerId: currentUser.id,
        calleeId: profile.id,
      });
      navigation.navigate('ActiveCall', {
        callId: call.id,
        role: 'caller',
        remoteUserId: profile.id,
        peerName: profile.gamerTag || profile.username || profile.id,
      });
    } catch (e: any) {
      Alert.alert('Call failed', e?.userMessage || e?.message || 'Could not start call');
    }
  };

  const handleMessage = () => {
    if (!profile) return;
    navigation.navigate('DM', { userId: profile.id, conversationId: profile.id });
  };

  const handleUserPress = (userId: string) => {
    navigation.push('Profile', { userId });
  };

  const handleSquadPress = () => {
    if (profile?.squadId) {
      navigation.navigate('SquadDetail', { squadId: profile.squadId });
    }
  };

  const handleBadgesPress = () => {
    navigation.navigate('Badges');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleFollowersPress = () => {
    navigation.navigate('Followers', { userId: profile?.id });
  };

  const handleFollowingPress = () => {
    navigation.navigate('Following', { userId: profile?.id });
  };

  const handleFriendsPress = () => {
    navigation.navigate('Friends', { userId: profile?.id });
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderHeader = () => {
    if (!profile) return null;

    const statusColor = profile.onlineStatus === 'online' 
      ? colors.success 
      : profile.onlineStatus === 'away' 
        ? colors.warning 
        : colors.textMuted;

    const statusLabel = profile.onlineStatus === 'online' 
      ? 'Online' 
      : profile.onlineStatus === 'away' 
        ? 'Away' 
        : 'Offline';

    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Avatar + Name */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => {}}>
            <Avatar
              source={profile.avatarUrl ? { uri: profile.avatarUrl } : undefined}
              name={profile.gamerTag}
              size="xl"
              shape="circle"
              borderWidth={3}
              borderColor={colors.surface}
              online={profile.onlineStatus === 'online'}
            />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {profile.gamerTag}
              </Text>
              {profile.squadRole === 'Leader' && (
                <Text style={{ fontSize: 14, marginLeft: 6 }}>👑</Text>
              )}
              {profile.squadRole === 'Admin' && (
                <Text style={{ fontSize: 14, marginLeft: 6 }}>🛡️</Text>
              )}
            </View>

            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              @{profile.username}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusColor,
                  marginRight: 4,
                }}
              />
              <Text style={{ fontSize: 12, color: statusColor }}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {profile.bio && (
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
            {profile.bio}
          </Text>
        )}

        {/* Gaming Identity */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 }}>
          <Tag label={`🎮 ${profile.gamingStyle || 'Casual'}`} variant="neutral" size="sm" />
          <Tag label={`📊 ${profile.skillLevel || 'Intermediate'}`} variant="neutral" size="sm" />
          <Tag label={`🎯 ${profile.role || 'Flex'}`} variant="neutral" size="sm" />
        </View>

        {/* Squad */}
        {profile.squadId && profile.squadName && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
            onPress={handleSquadPress}
          >
            <Icon name="users" size={14} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.primary, marginLeft: 6 }}>
              🛡️ {profile.squadName}
              {profile.squadRole && ` • ${profile.squadRole}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 24 }}>
          <TouchableOpacity onPress={handleFollowersPress}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {profile.followersCount || 0}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFollowingPress}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {profile.followingCount || 0}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Following</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFriendsPress}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {profile.friendsCount || 0}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActions = () => {
    if (isOwnProfile) {
      return (
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={handleEditProfile}
            fullWidth
          />
        </View>
      );
    }

    return (
      <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', gap: 8 }}>
        <Button
          title={isFollowing ? 'Following ✓' : 'Follow'}
          variant={isFollowing ? 'success' : 'primary'}
          onPress={handleFollow}
          style={{ flex: 1 }}
        />

        <Button
          title={isFriend ? 'Friends ✓' : isFriendRequestSent ? 'Requested' : isFriendRequestPending ? 'Accept' : 'Add Friend'}
          variant={isFriend ? 'success' : isFriendRequestSent ? 'outline' : isFriendRequestPending ? 'primary' : 'outline'}
          onPress={handleFriendRequest}
          style={{ flex: 1 }}
        />

        <Button
          title="Message"
          variant="primary"
          onPress={handleMessage}
          style={{ flex: 1 }}
        />
        <Button
          title="Call"
          variant="secondary"
          onPress={handleVoiceCall}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPosts();
      case 'clips':
        return renderClips();
      case 'lfg':
        return renderLFG();
      case 'badges':
        return renderBadges();
      default:
        return null;
    }
  };

  const renderPosts = () => {
    if (isPostsLoading && posts.length === 0) {
      return (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <EmptyState
          title="No Posts"
          description={isOwnProfile ? "You haven't posted anything yet" : "This user hasn't posted anything"}
          icon="📱"
          actionText={isOwnProfile ? "Create Post" : undefined}
          onAction={isOwnProfile ? () => navigation.navigate('CreatePost') : undefined}
        />
      );
    }

    return (
      <View style={{ padding: 16 }}>
        {posts.map((post: any) => (
          <Card key={post.id} style={{ marginBottom: 12, padding: 12 }}>
            <Text style={{ fontSize: 14, color: colors.text }}>{post.content}</Text>
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <Image
                source={{ uri: post.mediaUrls[0] }}
                style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                resizeMode="cover"
              />
            )}
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>❤️ {post.likesCount || 0}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>💬 {post.commentsCount || 0}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 'auto' }}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Text>
            </View>
          </Card>
        ))}

        {hasMore && (
          <Button
            title="Load More"
            variant="ghost"
            size="sm"
            onPress={loadMore}
            loading={isPostsLoading}
          />
        )}
      </View>
    );
  };

  const renderClips = () => {
    const clips = posts.filter((p: any) => p.postType === 'clip');
    if (clips.length === 0) {
      return (
        <EmptyState
          title="No Clips"
          description={isOwnProfile ? "You haven't posted any clips" : "This user hasn't posted any clips"}
          icon="🎥"
        />
      );
    }

    return (
      <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {clips.map((clip: any) => (
          <TouchableOpacity
            key={clip.id}
            style={{ width: '48%', aspectRatio: 16 / 9, backgroundColor: colors.surfaceSecondary, borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => navigation.navigate('PostDetail', { postId: clip.id })}
          >
            {clip.mediaUrls && clip.mediaUrls.length > 0 ? (
              <Image
                source={{ uri: clip.mediaUrls[0] }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Icon name="video" size={32} color={colors.textMuted} />
            )}
            <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, color: '#FFFFFF' }}>🎬</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderLFG = () => {
    if (isLFGLoading && lfgPosts.length === 0) {
      return (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (lfgPosts.length === 0) {
      return (
        <EmptyState
          title="No LFG Posts"
          description={isOwnProfile ? "You haven't posted any LFG" : "This user hasn't posted any LFG"}
          icon="🎮"
        />
      );
    }

    return (
      <View style={{ padding: 16 }}>
        {lfgPosts.map((lfg: any) => (
          <Card key={lfg.id} style={{ marginBottom: 12, padding: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              🎮 {lfg.gameMode}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              👥 {lfg.currentPartySize}/{lfg.playersNeeded} players
            </Text>
            {lfg.rankRequirement && (
              <Text style={{ fontSize: 12, color: colors.textMuted }}>🏆 {lfg.rankRequirement}</Text>
            )}
            {lfg.message && (
              <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>{lfg.message}</Text>
            )}
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {formatDistanceToNow(new Date(lfg.createdAt), { addSuffix: true })}
            </Text>
          </Card>
        ))}
      </View>
    );
  };

  const renderBadges = () => {
    return (
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{ padding: 16, backgroundColor: colors.surfaceSecondary, borderRadius: 8, alignItems: 'center' }}
          onPress={handleBadgesPress}
        >
          <Text style={{ fontSize: 16, color: colors.primary }}>🏅 View All Badges</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            {profile?.badgesCount || 0} badges earned
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  if (isProfileLoading && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={containerStyle}>
        <NavigationHeader
          title="Profile"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <EmptyState
          title="User Not Found"
          description="This user doesn't exist or may have been deleted"
          icon="👤"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title={isOwnProfile ? 'Profile' : profile.gamerTag}
        showBack
        onBackPress={() => navigation.goBack()}
        rightActions={isOwnProfile ? [
          {
            icon: 'settings',
            onPress: () => navigation.navigate('AccountSettings'),
          },
        ] : []}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingState || isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderActions()}

        <Tabs
          tabs={['Posts', 'Clips', 'LFG', 'Badges']}
          activeTab={['posts', 'clips', 'lfg', 'badges'].indexOf(activeTab)}
          onTabChange={(tab) => {
            const tabMap: ProfileTab[] = ['posts', 'clips', 'lfg', 'badges'];
            setActiveTab(tabMap[tab]);
          }}
        />

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;