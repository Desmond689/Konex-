/**
 * KONEX SquadMemberItem Component
 * Billion Dollar Code - Production Ready
 * 
 * A list item for displaying a squad member
 * 
 * Usage:
 * <SquadMemberItem
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
import Avatar from '../../../components/atoms/Avatar';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SquadMember {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  onlineStatus: 'online' | 'away' | 'offline';
  role: 'Leader' | 'Admin' | 'Member';
  joinedAt: string;
  skillLevel: string;
  roleTag: string;
}

export interface SquadMemberItemProps {
  /** Member data */
  member: SquadMember;
  /** On press handler */
  onPress?: (userId: string) => void;
  /** Is the current user the squad leader */
  isLeader?: boolean;
  /** On kick handler */
  onKick?: (userId: string) => void;
  /** On promote handler */
  onPromote?: (userId: string) => void;
  /** On demote handler */
  onDemote?: (userId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadMemberItem: React.FC<SquadMemberItemProps> = ({
  member,
  onPress,
  isLeader = false,
  onKick,
  onPromote,
  onDemote,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getRoleColor = (role: SquadMember['role']): string => {
    switch (role) {
      case 'Leader':
        return colors.primary;
      case 'Admin':
        return colors.info;
      case 'Member':
      default:
        return colors.textMuted;
    }
  };

  const getRoleIcon = (role: SquadMember['role']): string => {
    switch (role) {
      case 'Leader':
        return '👑';
      case 'Admin':
        return '🛡️';
      case 'Member':
      default:
        return '';
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

  const roleStyle: TextStyle = {
    fontSize: 12,
    color: getRoleColor(member.role),
    marginLeft: 6,
  };

  const statusStyle: TextStyle = {
    fontSize: 11,
    color: member.onlineStatus === 'online' ? colors.success : colors.textMuted,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const isPromotable = isLeader && member.role === 'Member';
  const isDemotable = isLeader && member.role === 'Admin';
  const isKickable = isLeader && member.role !== 'Leader';

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
          {getRoleIcon(member.role) && (
            <Text style={roleStyle}>{getRoleIcon(member.role)} {member.role}</Text>
          )}
        </View>
        <Text style={usernameStyle}>@{member.username}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={statusStyle}>
            {member.onlineStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>
            • {member.skillLevel} • {member.roleTag}
          </Text>
        </View>
      </View>

      {(isPromotable || isDemotable || isKickable) && (
        <View style={actionsStyle}>
          {isPromotable && onPromote && (
            <TouchableOpacity
              onPress={() => onPromote(member.userId)}
              style={{ padding: 4, marginRight: 4 }}
            >
              <Icon name="arrow-up" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          {isDemotable && onDemote && (
            <TouchableOpacity
              onPress={() => onDemote(member.userId)}
              style={{ padding: 4, marginRight: 4 }}
            >
              <Icon name="arrow-down" size={18} color={colors.warning} />
            </TouchableOpacity>
          )}
          {isKickable && onKick && (
            <TouchableOpacity
              onPress={() => onKick(member.userId)}
              style={{ padding: 4 }}
            >
              <Icon name="x" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SquadMemberItem;