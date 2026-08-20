// @ts-nocheck
/**
 * KONEX CommunityEntryCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card that serves as entry point to the user's game community
 * 
 * Usage:
 * <CommunityEntryCard
 *   community={community}
 *   onPress={handlePress}
 * />
 */

import React from 'react';
import {
    Image,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityEntry {
  id: string;
  name: string;
  gameName: string;
  gameLogoUrl: string | null;
  memberCount: number;
  onlineCount: number;
  coverImageUrl: string | null;
}

export interface CommunityEntryCardProps {
  /** Community data */
  community: CommunityEntry;
  /** On press handler */
  onPress: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityEntryCard: React.FC<CommunityEntryCardProps> = ({
  community,
  onPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    marginHorizontal: 16,
    marginVertical: 8,
    ...style,
  };

  const cardStyle: ViewStyle = {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
  };

  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  };

  const logoContainerStyle: ViewStyle = {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const infoStyle: ViewStyle = {
    flex: 1,
    marginLeft: 12,
  };

  const nameStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  };

  const gameNameStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  };

  const statsStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  const arrowContainerStyle: ViewStyle = {
    padding: 4,
  };

  const coverStyle: ViewStyle = {
    width: '100%',
    height: 60,
    backgroundColor: colors.primarySurface,
  };

  const coverImageStyle: ViewStyle = {
    width: '100%',
    height: '100%',
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <Card style={cardStyle} elevation="sm">
        {/* Cover Image */}
        {community.coverImageUrl && (
          <View style={coverStyle}>
            <Image
              source={{ uri: community.coverImageUrl }}
              style={coverImageStyle}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={contentStyle}>
          <View style={logoContainerStyle}>
            {community.gameLogoUrl ? (
              <Image
                source={{ uri: community.gameLogoUrl }}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: 24 }}>🎮</Text>
            )}
          </View>

          <View style={infoStyle}>
            <Text style={nameStyle}>{community.name}</Text>
            <Text style={gameNameStyle}>{community.gameName}</Text>
            <Text style={statsStyle}>
              👥 {community.memberCount.toLocaleString()} members • 🟢 {community.onlineCount} online
            </Text>
          </View>

          <View style={arrowContainerStyle}>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default CommunityEntryCard;