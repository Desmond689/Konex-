import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface GameInviteCardProps {
  gameName: string;
  mode: string;
  players: number;
  maxPlayers: number;
  map?: string;
  rankRequirement?: string;
  micRequired?: boolean;
  onJoin?: () => void;
  isExpired?: boolean;
}

export const GameInviteCard: React.FC<GameInviteCardProps> = ({
  gameName,
  mode,
  players,
  maxPlayers,
  map,
  rankRequirement,
  micRequired,
  onJoin,
  isExpired,
}) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{gameName}</Text>
    <Text style={styles.text}>Mode: {mode}</Text>
    <Text style={styles.text}>
      Players: {players}/{maxPlayers}
    </Text>
    {map ? <Text style={styles.text}>Map: {map}</Text> : null}
    {rankRequirement ? <Text style={styles.text}>Rank: {rankRequirement}</Text> : null}
    {micRequired !== undefined ? (
      <Text style={styles.text}>{micRequired ? '🎤 Mic Required' : 'Mic Optional'}</Text>
    ) : null}
    {onJoin && (
      <TouchableOpacity
        style={[styles.joinButton, isExpired && styles.disabledButton]}
        onPress={onJoin}
        disabled={isExpired}
      >
        <Text style={styles.joinText}>{isExpired ? 'Expired' : 'Join'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#1E1E2A', borderRadius: 8 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  text: { color: '#9CA3AF', fontSize: 13, marginVertical: 1 },
  joinButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  joinText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  disabledButton: { backgroundColor: '#4B5563' },
});

export default GameInviteCard;