/**
 * KONEX TournamentMatchCard Component
 * Billion Dollar Code - Production Ready
 * 
 * A card displaying a single tournament match with full details and actions
 * 
 * Usage:
 * <TournamentMatchCard
 *   match={match}
 *   onPress={handlePress}
 *   onSubmitResult={handleSubmitResult}
 * />
 */

import { format, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Button from '../../atoms/Button';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';
import Input from '../../atoms/Input';
import Tag from '../../atoms/Tag';

// ============================================
// 1. TYPES
// ============================================

export interface MatchData {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  squadAId: string | null;
  squadAName: string | null;
  squadAIcon: string | null;
  squadBId: string | null;
  squadBName: string | null;
  squadBIcon: string | null;
  winnerId: string | null;
  score: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'disputed' | 'cancelled';
  startTime: string;
  completedAt: string | null;
  map?: string;
  mode?: string;
  matchCode?: string;
}

export interface TournamentMatchCardProps {
  /** Match data */
  match: MatchData;
  /** On press handler */
  onPress?: (matchId: string) => void;
  /** On squad press handler */
  onSquadPress?: (squadId: string) => void;
  /** On submit result handler */
  onSubmitResult?: (matchId: string, winnerId: string, score: string, screenshotUri?: string) => Promise<void>;
  /** On dispute handler */
  onDispute?: (matchId: string, reason: string, evidence?: string) => Promise<void>;
  /** Is the current user authorized to submit results */
  canSubmitResult?: boolean;
  /** Is the current user authorized to dispute */
  canDispute?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentMatchCard: React.FC<TournamentMatchCardProps> = ({
  match,
  onPress,
  onSquadPress,
  onSubmitResult,
  onDispute,
  canSubmitResult = false,
  canDispute = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showResultModal, setShowResultModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusColor = (status: MatchData['status']): string => {
    switch (status) {
      case 'scheduled':
        return colors.info;
      case 'live':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'disputed':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: MatchData['status']): string => {
    switch (status) {
      case 'scheduled':
        return '⏳ Scheduled';
      case 'live':
        return '🔴 Live';
      case 'completed':
        return '✅ Completed';
      case 'disputed':
        return '⚠️ Disputed';
      case 'cancelled':
        return '❌ Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getRoundLabel = (round: number): string => {
    switch (round) {
      case 1:
        return 'Round of 16';
      case 2:
        return 'Quarterfinal';
      case 3:
        return 'Semifinal';
      case 4:
        return 'Final';
      default:
        return `Round ${round}`;
    }
  };

  const handleSubmitResult = async () => {
    if (!selectedWinner) {
      Alert.alert('Error', 'Please select a winner');
      return;
    }

    if (!scoreA || !scoreB) {
      Alert.alert('Error', 'Please enter the score');
      return;
    }

    const score = `${scoreA} - ${scoreB}`;
    try {
      setIsSubmitting(true);
      await onSubmitResult?.(match.id, selectedWinner, score);
      setShowResultModal(false);
      Alert.alert('Success', 'Result submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    try {
      setIsSubmitting(true);
      await onDispute?.(match.id, disputeReason, disputeDetails || undefined);
      setShowDisputeModal(false);
      Alert.alert('Success', 'Dispute submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    padding: 0,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  };

  const roundStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  };

  const matchNumberStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const vsContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  };

  const squadContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  };

  const squadNameStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  };

  const vsTextStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 12,
  };

  const winnerBadgeStyle: ViewStyle = {
    position: 'absolute',
    top: -4,
    right: -4,
  };

  const scoreStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  };

  const detailsStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  };

  const detailItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  };

  const detailTextStyle: TextStyle = {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  };

  const timeStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: 4,
  };

  const isCompleted = match.status === 'completed';
  const isDisputed = match.status === 'disputed';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';
  const winner = match.winnerId;

  // Determine which squad the current user is (if any) - in real app this would come from auth
  const userIsInSquadA = false; // Placeholder
  const userIsInSquadB = false; // Placeholder

  const canSubmit = canSubmitResult && (userIsInSquadA || userIsInSquadB) && (isLive || isScheduled);
  const canDisputeMatch = canDispute && (userIsInSquadA || userIsInSquadB) && isCompleted && !match.winnerId;

  return (
    <>
      <TouchableOpacity
        style={cardStyle}
        onPress={() => onPress?.(match.id)}
        activeOpacity={0.8}
        testID={testID}
      >
        <Card style={{ padding: 0, marginBottom: 0 }} elevation="sm">
          {/* Header */}
          <View style={headerStyle}>
            <Text style={roundStyle}>{getRoundLabel(match.round)}</Text>
            <Text style={matchNumberStyle}>Match #{match.matchNumber}</Text>
          </View>

          {/* Map & Mode Details */}
          {(match.map || match.mode || match.matchCode) && (
            <View style={detailsStyle}>
              {match.map && (
                <View style={detailItemStyle}>
                  <Icon name="map-pin" size={12} color={colors.textMuted} />
                  <Text style={detailTextStyle}>{match.map}</Text>
                </View>
              )}
              {match.mode && (
                <View style={detailItemStyle}>
                  <Icon name="target" size={12} color={colors.textMuted} />
                  <Text style={detailTextStyle}>{match.mode}</Text>
                </View>
              )}
              {match.matchCode && (
                <View style={detailItemStyle}>
                  <Icon name="hash" size={12} color={colors.textMuted} />
                  <Text style={detailTextStyle}>Code: {match.matchCode}</Text>
                </View>
              )}
            </View>
          )}

          {/* Teams */}
          <View style={vsContainerStyle}>
            {/* Squad A */}
            <TouchableOpacity
              style={squadContainerStyle}
              onPress={() => match.squadAId && onSquadPress?.(match.squadAId)}
              disabled={!match.squadAId}
            >
              <View style={{ position: 'relative' }}>
                <Avatar
                  source={match.squadAIcon ? { uri: match.squadAIcon } : undefined}
                  name={match.squadAName || 'TBD'}
                  size="lg"
                  shape="rounded"
                />
                {isCompleted && winner === match.squadAId && (
                  <View style={winnerBadgeStyle}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                  </View>
                )}
                {isDisputed && winner === match.squadAId && (
                  <View style={winnerBadgeStyle}>
                    <Icon name="alert-circle" size={20} color={colors.warning} />
                  </View>
                )}
              </View>
              <Text style={squadNameStyle} numberOfLines={1}>
                {match.squadAName || 'TBD'}
              </Text>
              {isCompleted && winner === match.squadAId && (
                <Text style={{ fontSize: 11, color: colors.success, fontWeight: '600' }}>
                  Winner
                </Text>
              )}
              {isDisputed && winner === match.squadAId && (
                <Text style={{ fontSize: 11, color: colors.warning, fontWeight: '600' }}>
                  Disputed
                </Text>
              )}
            </TouchableOpacity>

            <Text style={vsTextStyle}>VS</Text>

            {/* Squad B */}
            <TouchableOpacity
              style={squadContainerStyle}
              onPress={() => match.squadBId && onSquadPress?.(match.squadBId)}
              disabled={!match.squadBId}
            >
              <View style={{ position: 'relative' }}>
                <Avatar
                  source={match.squadBIcon ? { uri: match.squadBIcon } : undefined}
                  name={match.squadBName || 'TBD'}
                  size="lg"
                  shape="rounded"
                />
                {isCompleted && winner === match.squadBId && (
                  <View style={winnerBadgeStyle}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                  </View>
                )}
                {isDisputed && winner === match.squadBId && (
                  <View style={winnerBadgeStyle}>
                    <Icon name="alert-circle" size={20} color={colors.warning} />
                  </View>
                )}
              </View>
              <Text style={squadNameStyle} numberOfLines={1}>
                {match.squadBName || 'TBD'}
              </Text>
              {isCompleted && winner === match.squadBId && (
                <Text style={{ fontSize: 11, color: colors.success, fontWeight: '600' }}>
                  Winner
                </Text>
              )}
              {isDisputed && winner === match.squadBId && (
                <Text style={{ fontSize: 11, color: colors.warning, fontWeight: '600' }}>
                  Disputed
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Score */}
          {isCompleted && match.score && (
            <View style={{ alignItems: 'center', paddingBottom: 4 }}>
              <Text style={scoreStyle}>{match.score}</Text>
            </View>
          )}

          {isDisputed && match.score && (
            <View style={{ alignItems: 'center', paddingBottom: 4 }}>
              <Text style={[scoreStyle, { color: colors.warning }]}>{match.score}</Text>
              <Text style={{ fontSize: 12, color: colors.warning, fontWeight: '500' }}>
                ⚠️ Disputed Result
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={footerStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Tag
                label={getStatusLabel(match.status)}
                variant={match.status === 'live' ? 'success' : match.status === 'completed' ? 'primary' : match.status === 'disputed' ? 'warning' : 'neutral'}
                size="xs"
              />
              <Text style={timeStyle}>
                {isCompleted && match.completedAt
                  ? `Completed ${formatDistanceToNow(new Date(match.completedAt), { addSuffix: true })}`
                  : `Scheduled for ${format(new Date(match.startTime), 'MMM dd, h:mm a')}`
                }
              </Text>
            </View>

            <View style={actionsStyle}>
              {canSubmit && (
                <Button
                  title="Submit Result"
                  variant="primary"
                  size="xs"
                  onPress={() => setShowResultModal(true)}
                />
              )}
              {canDisputeMatch && (
                <Button
                  title="Dispute"
                  variant="warning"
                  size="xs"
                  onPress={() => setShowDisputeModal(true)}
                />
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Submit Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              Submit Match Result
            </Text>

            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
              Select the winning squad:
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: selectedWinner === match.squadAId ? colors.primary : colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: selectedWinner === match.squadAId ? colors.primary : colors.border,
                  alignItems: 'center',
                  minWidth: 80,
                }}
                onPress={() => setSelectedWinner(match.squadAId)}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: selectedWinner === match.squadAId ? '#FFFFFF' : colors.text }}>
                  {match.squadAName || 'TBD'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: selectedWinner === match.squadBId ? colors.primary : colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: selectedWinner === match.squadBId ? colors.primary : colors.border,
                  alignItems: 'center',
                  minWidth: 80,
                }}
                onPress={() => setSelectedWinner(match.squadBId)}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: selectedWinner === match.squadBId ? '#FFFFFF' : colors.text }}>
                  {match.squadBName || 'TBD'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <Input
                label="Score A"
                value={scoreA}
                onChangeText={setScoreA}
                placeholder="0"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
              <Input
                label="Score B"
                value={scoreB}
                onChangeText={setScoreB}
                placeholder="0"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowResultModal(false)}
              />
              <Button
                title="Submit"
                variant="primary"
                onPress={handleSubmitResult}
                loading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              Dispute Result
            </Text>

            <Input
              label="Reason"
              value={disputeReason}
              onChangeText={setDisputeReason}
              placeholder="Why are you disputing this result?"
              required
              style={{ marginBottom: 12 }}
            />

            <Input
              label="Additional Details"
              value={disputeDetails}
              onChangeText={setDisputeDetails}
              placeholder="Provide any additional information..."
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowDisputeModal(false)}
              />
              <Button
                title="Submit Dispute"
                variant="warning"
                onPress={handleDispute}
                loading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TournamentMatchCard;