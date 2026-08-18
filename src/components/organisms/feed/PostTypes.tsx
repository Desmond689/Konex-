/**
 * KONEX PostTypes Component
 * Billion Dollar Code - Production Ready
 * 
 * Specialized post type renderers
 * 
 * Usage:
 * <PostTypes.Poll options={options} votes={votes} />
 * <PostTypes.LFG gameMode="Ranked" playersNeeded={3} />
 * <PostTypes.Tournament name="Tourney" date="Aug 28" />
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
import Button from '../../atoms/Button';
import ProgressBar from '../../atoms/ProgressBar';

// ============================================
// 1. POLL
// ============================================

interface PollProps {
  options: string[];
  votes: Record<string, number>;
  totalVotes: number;
  isVoted?: boolean;
  onVote?: (option: string) => void;
  style?: ViewStyle;
}

const Poll: React.FC<PollProps> = ({
  options,
  votes,
  totalVotes,
  isVoted = false,
  onVote,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...style,
  };

  const optionStyle: ViewStyle = {
    marginBottom: 8,
  };

  const optionLabelStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  };

  const votesStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
  };

  return (
    <View style={containerStyle}>
      {options.map((option, index) => {
        const voteCount = votes[option] || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

        return (
          <TouchableOpacity
            key={index}
            style={optionStyle}
            onPress={() => onVote?.(option)}
            disabled={isVoted}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={optionLabelStyle}>{option}</Text>
              <Text style={votesStyle}>{Math.round(percentage)}%</Text>
            </View>
            <ProgressBar
              progress={percentage / 100}
              height={6}
              progressColor={colors.primary}
            />
          </TouchableOpacity>
        );
      })}
      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
        {totalVotes} votes
      </Text>
    </View>
  );
};

// ============================================
// 2. LFG
// ============================================

interface LFGProps {
  gameMode: string;
  playersNeeded: number;
  currentParty: number;
  rankRequirement?: string;
  micRequired?: boolean;
  onJoin?: () => void;
  style?: ViewStyle;
}

const LFG: React.FC<LFGProps> = ({
  gameMode,
  playersNeeded,
  currentParty,
  rankRequirement,
  micRequired = false,
  onJoin,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    ...style,
  };

  const headerStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  };

  const detailStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  };

  const partyStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginVertical: 4,
  };

  return (
    <View style={containerStyle}>
      <Text style={headerStyle}>🎮 Looking for Group</Text>
      <Text style={detailStyle}>Mode: {gameMode}</Text>
      {rankRequirement && <Text style={detailStyle}>🏆 {rankRequirement}</Text>}
      {micRequired && <Text style={detailStyle}>🎤 Mic Required</Text>}
      <Text style={partyStyle}>
        👥 {currentParty}/{playersNeeded} players
      </Text>
      {onJoin && (
        <Button
          title="Join Party"
          variant="primary"
          size="sm"
          onPress={onJoin}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};

// ============================================
// 3. TOURNAMENT
// ============================================

interface TournamentProps {
  name: string;
  date: string;
  prize: string;
  maxSquads: number;
  registeredSquads: number;
  onRegister?: () => void;
  style?: ViewStyle;
}

const Tournament: React.FC<TournamentProps> = ({
  name,
  date,
  prize,
  maxSquads,
  registeredSquads,
  onRegister,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    ...style,
  };

  const headerStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  };

  const detailStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  };

  const slotsStyle: TextStyle = {
    fontSize: 13,
    color: colors.text,
    marginVertical: 4,
  };

  return (
    <View style={containerStyle}>
      <Text style={headerStyle}>🏆 {name}</Text>
      <Text style={detailStyle}>📅 {date}</Text>
      <Text style={detailStyle}>💰 {prize}</Text>
      <Text style={slotsStyle}>
        📋 {registeredSquads}/{maxSquads} squads registered
      </Text>
      <ProgressBar
        progress={registeredSquads / maxSquads}
        height={4}
        progressColor={colors.primary}
        style={{ marginVertical: 4 }}
      />
      {onRegister && (
        <Button
          title="Register"
          variant="primary"
          size="sm"
          onPress={onRegister}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};

// ============================================
// 4. RECRUITMENT
// ============================================

interface RecruitmentProps {
  squadName: string;
  squadType: string;
  requirements: string[];
  onApply?: () => void;
  style?: ViewStyle;
}

const Recruitment: React.FC<RecruitmentProps> = ({
  squadName,
  squadType,
  requirements,
  onApply,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    ...style,
  };

  const headerStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  };

  const typeStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  };

  const requirementStyle: TextStyle = {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  };

  return (
    <View style={containerStyle}>
      <Text style={headerStyle}>🛡️ {squadName}</Text>
      <Text style={typeStyle}>Type: {squadType}</Text>
      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text, marginTop: 4 }}>
        Requirements:
      </Text>
      {requirements.map((req, index) => (
        <Text key={index} style={requirementStyle}>
          • {req}
        </Text>
      ))}
      {onApply && (
        <Button
          title="Apply"
          variant="primary"
          size="sm"
          onPress={onApply}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};

// ============================================
// 5. EXPORT
// ============================================

export const PostTypes = {
  Poll,
  LFG,
  Tournament,
  Recruitment,
};

export default PostTypes;