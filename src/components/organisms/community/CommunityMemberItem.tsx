/**
 * KONEX CommunityMemberItem Component
 * Billion Dollar Code - Production Ready
 * 
 * A list item for displaying a community member
 * 
 * Usage:
 * <CommunityMemberItem
 *   member={member}
 *   onPress={handlePress}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Tag from '../../atoms/Tag';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityMember {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  onlineStatus: 'online' | 'away' | 'offline';
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export interface CommunityMemberItemProps {
  /** Member data */
  member: CommunityMember;
  /** On press handler */
  onPress?: (userId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityMemberItem: React.FC<CommunityMemberItemProps> = ({
  member,
  onPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getRoleLabel = (role: CommunityMember['role']): string => {
    switch (role) {
      case 'admin':
        return '👑 Admin';
      case 'moderator':
        return '🛡️ Moderator';
      default:
        return '';
    }
  };

  const getRoleColor = (role: CommunityMember['role']): string => {
    switch (role) {
      case 'admin':
        return colors.primary;
      case 'moderator':
        return colors.secondary;
      default:
        return colors.textMuted;
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...style,
  };

  const infoStyle: ViewStyle = {
    flex: 1,
    marginLeft: 12,
  };

  const nameStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  };

  const usernameStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const statusStyle: TextStyle = {
    fontSize: 11,
    color: member.onlineStatus === 'online' ? colors.success : colors.textMuted,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onPress?.(member.userId)}
      activeOpacity={0.7}
      testID={testID}
    >
      <Avatar
        source={member.avatarUrl ? { uri: member.avatarUrl } : undefined}
        name={member.gamerTag}
        size="md"
        online={member.onlineStatus === 'online'}
      />
      <View style={infoStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={nameStyle}>{member.gamerTag}</Text>
          {member.role !== 'member' && (
            <Tag
              label={getRoleLabel(member.role)}
              variant="neutral"
              size="xs"
              style={{ marginLeft: 6 }}
              textStyle={{ color: getRoleColor(member.role) }}
            />
          )}
        </View>
        <Text style={usernameStyle}>@{member.username}</Text>
      </View>
      <Text style={statusStyle}>
        {member.onlineStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
      </Text>
    </TouchableOpacity>
  );
};

export default CommunityMemberItem;