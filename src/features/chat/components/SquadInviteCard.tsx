/**
 * KONEX SquadInviteCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card for displaying squad invites in chat
 * 
 * Usage:
 * <SquadInviteCard
 *   squadName="Shadow Wolves"
 *   memberCount={12}
 *   onlineCount={4}
 *   onJoin={() => {}}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SquadInviteCardProps {
  /** Squad name */
  squadName: string;
  /** Squad ID */
  squadId: string;
  /** Number of members */
  memberCount: number;
  /** Number of online members */
  onlineCount: number;
  /** Squad description */
  description?: string;
  /** Squad type */
  squadType?: string;
  /** On join handler */
  onJoin: () => void;
  /** On decline handler */
  onDecline?: () => void;
  /** Is the invite expired */
  isExpired?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadInviteCard: React.FC<SquadInviteCardProps> = ({
  squadName,
  squadId,
  memberCount,
  onlineCount,
  description,
  squadType,
  onJoin,
  onDecline,
  isExpired = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    padding: 12,
    marginVertical: 4,
    maxWidth: 300,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  };

  const titleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  };

  const detailStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  };

  const membersStyle: TextStyle = {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  };

  return (
    <Card style={containerStyle} elevation="sm" testID={testID}>
      <View style={headerStyle}>
        <Icon name="users" size={24} color={colors.primary} />
        <Text style={titleStyle}>{squadName}</Text>
      </View>

      {squadType && <Text style={detailStyle}>🏷️ {squadType}</Text>}
      {description && (
        <Text style={detailStyle} numberOfLines={2}>
          {description}
        </Text>
      )}

      <Text style={membersStyle}>
        👥 {memberCount} members • 🟢 {onlineCount} online
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {isExpired ? (
          <Text style={{ fontSize: 14, color: colors.error, fontWeight: '600' }}>
            ⏰ Invite Expired
          </Text>
        ) : (
          <>
            <Button
              title="Join Squad"
              variant="primary"
              size="sm"
              onPress={onJoin}
              style={{ flex: 1, marginRight: 8 }}
            />
            {onDecline && (
              <Button
                title="Decline"
                variant="ghost"
                size="sm"
                onPress={onDecline}
                style={{ flex: 1 }}
              />
            )}
          </>
        )}
      </View>
    </Card>
  );
};

export default SquadInviteCard;