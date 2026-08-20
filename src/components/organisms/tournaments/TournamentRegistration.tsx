/**
 * KONEX TournamentRegistration Component
 * Billion Dollar Code - Production Ready
 * 
 * A component for managing tournament registration
 * 
 * Usage:
 * <TournamentRegistration
 *   tournamentId={tournamentId}
 *   registeredSquads={registeredSquads}
 *   onRegister={handleRegister}
 * />
 */

import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';
import ProgressBar from '../../atoms/ProgressBar';
import Tag from '../../atoms/Tag';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface RegisteredSquad {
  id: string;
  squadId: string;
  squadName: string;
  squadIcon: string | null;
  memberCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'no_show';
  registeredAt: string;
  checkedInAt: string | null;
  leaderGamerTag: string;
  leaderId: string;
}

export interface TournamentRegistrationProps {
  /** Tournament ID */
  tournamentId: string;
  /** List of registered squads */
  registeredSquads: RegisteredSquad[];
  /** Maximum squads allowed */
  maxSquads: number;
  /** Is the current user registered */
  isRegistered: boolean;
  /** Is registration open */
  isRegistrationOpen: boolean;
  /** On register handler */
  onRegister: () => Promise<void>;
  /** On unregister handler */
  onUnregister: () => Promise<void>;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** On approve registration handler (for tournament creator) */
  onApproveRegistration?: (registrationId: string) => Promise<void>;
  /** On reject registration handler (for tournament creator) */
  onRejectRegistration?: (registrationId: string) => Promise<void>;
  /** On check-in handler */
  onCheckIn?: () => Promise<void>;
  /** Is the current user the tournament creator */
  isCreator?: boolean;
  /** Is check-in open */
  isCheckInOpen?: boolean;
  /** Has the user checked in */
  hasCheckedIn?: boolean;
  /** Is loading */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentRegistration: React.FC<TournamentRegistrationProps> = ({
  tournamentId,
  registeredSquads,
  maxSquads,
  isRegistered,
  isRegistrationOpen,
  onRegister,
  onUnregister,
  onSquadPress,
  onApproveRegistration,
  onRejectRegistration,
  onCheckIn,
  isCreator = false,
  isCheckInOpen = false,
  hasCheckedIn = false,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSquad, setExpandedSquad] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!isRegistrationOpen) {
      Alert.alert('Registration Closed', 'Registration for this tournament is closed.');
      return;
    }

    if (registeredSquads.length >= maxSquads) {
      Alert.alert('Tournament Full', 'This tournament has reached the maximum number of squads.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRegister();
      Alert.alert('Success', 'Registration submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to register for tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Unregister',
      'Are you sure you want to unregister from this tournament?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await onUnregister();
              Alert.alert('Success', 'Unregistered successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to unregister');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async () => {
    if (!onCheckIn) return;
    try {
      setIsSubmitting(true);
      await onCheckIn();
      Alert.alert('Success', 'Checked in successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    if (!onApproveRegistration) return;
    try {
      await onApproveRegistration(registrationId);
      Alert.alert('Success', 'Registration approved');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve registration');
    }
  };

  const handleReject = async (registrationId: string) => {
    if (!onRejectRegistration) return;
    Alert.alert(
      'Reject Registration',
      'Are you sure you want to reject this registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRejectRegistration(registrationId);
              Alert.alert('Success', 'Registration rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject registration');
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (status: RegisteredSquad['status']): string => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'approved':
        return '✅ Approved';
      case 'rejected':
        return '❌ Rejected';
      case 'checked_in':
        return '🟢 Checked In';
      case 'no_show':
        return '🔴 No Show';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: RegisteredSquad['status']): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'checked_in':
        return colors.success;
      case 'no_show':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  };

  const slotsStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
  };

  const progressContainerStyle: ViewStyle = {
    marginBottom: 16,
  };

  const squadItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const squadInfoStyle: ViewStyle = {
    flex: 1,
    marginLeft: 12,
  };

  const squadNameStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  };

  const squadDetailStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  };

  const checkInButtonStyle: ViewStyle = {
    marginBottom: 12,
  };

  const pendingRegistrations = registeredSquads.filter((s) => s.status === 'pending');
  const approvedRegistrations = registeredSquads.filter((s) => s.status === 'approved' || s.status === 'checked_in');

  return (
    <View style={containerStyle} testID={testID}>
      {/* Header */}
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>📋 Registration</Text>
        <Text style={slotsStyle}>
          {registeredSquads.length}/{maxSquads} squads
        </Text>
      </View>

      {/* Progress */}
      <View style={progressContainerStyle}>
        <ProgressBar
          progress={registeredSquads.length / maxSquads}
          height={6}
          progressColor={registeredSquads.length >= maxSquads ? colors.error : colors.primary}
        />
      </View>

      {/* Check-in Button */}
      {isCheckInOpen && isRegistered && !hasCheckedIn && (
        <View style={checkInButtonStyle}>
          <Button
            title="Check In"
            variant="primary"
            onPress={handleCheckIn}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      )}

      {isCheckInOpen && isRegistered && hasCheckedIn && (
        <View style={checkInButtonStyle}>
          <Tag label="✅ Checked In" variant="success" size="md" />
        </View>
      )}

      {/* Register/Unregister Buttons */}
      {isRegistrationOpen && !isRegistered && registeredSquads.length < maxSquads && (
        <Button
          title="Register Squad"
          variant="primary"
          onPress={handleRegister}
          loading={isSubmitting}
          fullWidth
          style={{ marginBottom: 12 }}
        />
      )}

      {isRegistered && (
        <Button
          title="Unregister"
          variant="danger"
          onPress={handleUnregister}
          loading={isSubmitting}
          fullWidth
          style={{ marginBottom: 12 }}
        />
      )}

      {!isRegistrationOpen && !isRegistered && (
        <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 12 }}>
          Registration is closed
        </Text>
      )}

      {registeredSquads.length === 0 ? (
        <EmptyState
          title="No Registrations"
          description="No squads have registered yet"
          icon="📋"
          style={{ padding: 20 }}
        />
      ) : (
        <>
          {/* Pending Registrations (for creator) */}
          {isCreator && pendingRegistrations.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Pending Approvals ({pendingRegistrations.length})
              </Text>
              {pendingRegistrations.map((squad) => (
                <View key={squad.id} style={squadItemStyle}>
                  <Avatar
                    source={squad.squadIcon ? { uri: squad.squadIcon } : undefined}
                    name={squad.squadName}
                    size="sm"
                    shape="rounded"
                  />
                  <View style={squadInfoStyle}>
                    <Text style={squadNameStyle}>{squad.squadName}</Text>
                    <Text style={squadDetailStyle}>
                      {squad.memberCount} members • Leader: {squad.leaderGamerTag}
                    </Text>
                    <Text style={squadDetailStyle}>
                      {format(new Date(squad.registeredAt), 'MMM dd, h:mm a')}
                    </Text>
                  </View>
                  <View style={actionsStyle}>
                    <Button
                      title="Approve"
                      variant="success"
                      size="xs"
                      onPress={() => handleApprove(squad.id)}
                    />
                    <Button
                      title="Reject"
                      variant="danger"
                      size="xs"
                      onPress={() => handleReject(squad.id)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Approved Registrations */}
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Registered Squads ({approvedRegistrations.length})
            </Text>
            {approvedRegistrations.map((squad) => (
              <TouchableOpacity
                key={squad.id}
                style={squadItemStyle}
                onPress={() => onSquadPress?.(squad.squadId)}
                activeOpacity={0.7}
              >
                <Avatar
                  source={squad.squadIcon ? { uri: squad.squadIcon } : undefined}
                  name={squad.squadName}
                  size="sm"
                  shape="rounded"
                />
                <View style={squadInfoStyle}>
                  <Text style={squadNameStyle}>{squad.squadName}</Text>
                  <Text style={squadDetailStyle}>
                    {squad.memberCount} members • Leader: {squad.leaderGamerTag}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Tag
                      label={getStatusLabel(squad.status)}
                      variant={squad.status === 'checked_in' ? 'success' : 'primary'}
                      size="xs"
                    />
                    {squad.checkedInAt && (
                      <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 6 }}>
                        Checked in {format(new Date(squad.checkedInAt), 'h:mm a')}
                      </Text>
                    )}
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default TournamentRegistration;