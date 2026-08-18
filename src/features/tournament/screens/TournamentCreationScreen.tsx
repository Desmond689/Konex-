/**
 * KONEX TournamentCreationScreen
 * Billion Dollar Code - Production Ready
 * 
 * Tournament creation form with all required fields
 * 
 * Usage:
 * <TournamentCreationScreen navigation={navigation} route={route} />
 */

import React, { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import Input from '../../../components/atoms/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../providers/ToastProvider';
import { useTournaments } from '../hooks/useTournaments';

// ============================================
// 1. TYPES
// ============================================

export interface TournamentCreationScreenProps {
  navigation: any;
  route: any;
}

interface TournamentFormData {
  name: string;
  description: string;
  communityId: string;
  gameId: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxTeams: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  prizeDescription: string;
  rules: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentCreationScreen: React.FC<TournamentCreationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { showToast } = useToast();
  const { user } = useAuth();
  const { createTournament, isCreating } = useTournaments();

  const communityId = route?.params?.communityId;

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    communityId: communityId || '',
    gameId: '',
    format: 'single_elimination',
    maxTeams: 16,
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
    prizeDescription: '',
    rules: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TournamentFormData, string>>>({});

  // ============================================
  // HANDLERS
  // ============================================

  const handleChange = useCallback(<K extends keyof TournamentFormData>(
    field: K,
    value: TournamentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TournamentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }
    if (!formData.communityId) {
      newErrors.communityId = 'Please select a community';
    }
    if (!formData.gameId) {
      newErrors.gameId = 'Please select a game';
    }
    if (formData.maxTeams < 2) {
      newErrors.maxTeams = 'Must have at least 2 teams';
    }
    if (formData.maxTeams > 64) {
      newErrors.maxTeams = 'Maximum 64 teams';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      showToast('Please fix the errors', 'warning');
      return;
    }

    if (!user?.id) {
      showToast('Please sign in to create a tournament', 'error');
      return;
    }

    try {
      const tournament = await createTournament({
        ...formData,
        createdBy: user.id,
        status: 'draft',
      });

      showToast('Tournament created! 🏆', 'success');
      navigation.replace('TournamentDetail', { tournamentId: tournament.id });
    } catch (error: any) {
      showToast(error.message || 'Failed to create tournament', 'error');
    }
  }, [formData, user?.id, createTournament, validate, navigation, showToast]);

  const handleBack = useCallback(() => {
    if (isCreating) return;
    navigation.goBack();
  }, [isCreating, navigation]);

  // ============================================
  // RENDER
  // ============================================

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  };

  const contentStyle: ViewStyle = {
    padding: 16,
    paddingBottom: 34,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: 20,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  };

  const formatOptionsStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  };

  const formatOptionStyle = (isSelected: boolean): ViewStyle => ({
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary : colors.border,
  });

  const formatOptionTextStyle = (isSelected: boolean): TextStyle => ({
    fontSize: 13,
    color: isSelected ? '#FFFFFF' : colors.text,
    fontWeight: isSelected ? '600' : '400',
  });

  const formatOptions = [
    { value: 'single_elimination', label: 'Single Elim' },
    { value: 'double_elimination', label: 'Double Elim' },
    { value: 'round_robin', label: 'Round Robin' },
    { value: 'swiss', label: 'Swiss' },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity onPress={handleBack} disabled={isCreating}>
          <Icon name="x" size={24} color={isCreating ? colors.textMuted : colors.text} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Create Tournament</Text>
      </View>

      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info */}
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Basic Information</Text>
          <Input
            label="Tournament Name"
            placeholder="Enter tournament name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            error={errors.name}
            disabled={isCreating}
          />
          <Input
            label="Description"
            placeholder="Describe your tournament"
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100 }}
            disabled={isCreating}
          />
        </View>

        {/* Community & Game */}
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Community & Game</Text>
          <Input
            label="Community"
            placeholder="Select community"
            value={formData.communityId}
            onChangeText={(value) => handleChange('communityId', value)}
            error={errors.communityId}
            disabled={isCreating}
          />
          <Input
            label="Game"
            placeholder="Select game"
            value={formData.gameId}
            onChangeText={(value) => handleChange('gameId', value)}
            error={errors.gameId}
            disabled={isCreating}
          />
        </View>

        {/* Format & Teams */}
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Format & Teams</Text>
          <View style={formatOptionsStyle}>
            {formatOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={formatOptionStyle(formData.format === option.value)}
                onPress={() => handleChange('format', option.value as any)}
                disabled={isCreating}
              >
                <Text style={formatOptionTextStyle(formData.format === option.value)}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label="Max Teams"
            placeholder="Number of teams (2-64)"
            value={String(formData.maxTeams)}
            onChangeText={(value) => handleChange('maxTeams', parseInt(value) || 0)}
            keyboardType="numeric"
            error={errors.maxTeams}
            disabled={isCreating}
          />
        </View>

        {/* Dates */}
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Schedule</Text>
          <Input
            label="Registration Start"
            placeholder="YYYY-MM-DD"
            value={formData.registrationStart}
            onChangeText={(value) => handleChange('registrationStart', value)}
            disabled={isCreating}
          />
          <Input
            label="Registration End"
            placeholder="YYYY-MM-DD"
            value={formData.registrationEnd}
            onChangeText={(value) => handleChange('registrationEnd', value)}
            disabled={isCreating}
          />
          <Input
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={formData.startDate}
            onChangeText={(value) => handleChange('startDate', value)}
            disabled={isCreating}
          />
          <Input
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={formData.endDate}
            onChangeText={(value) => handleChange('endDate', value)}
            disabled={isCreating}
          />
        </View>

        {/* Additional Info */}
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Additional Information</Text>
          <Input
            label="Prize Description"
            placeholder="Describe the prize"
            value={formData.prizeDescription}
            onChangeText={(value) => handleChange('prizeDescription', value)}
            disabled={isCreating}
          />
          <Input
            label="Rules"
            placeholder="Tournament rules"
            value={formData.rules}
            onChangeText={(value) => handleChange('rules', value)}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80 }}
            disabled={isCreating}
          />
        </View>

        {/* Submit */}
        <Button
          title={isCreating ? 'Creating...' : 'Create Tournament'}
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          loading={isCreating}
          fullWidth
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TournamentCreationScreen;