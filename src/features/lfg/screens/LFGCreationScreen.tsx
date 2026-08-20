/**
 * KONEX LFGCreationScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen for creating a new LFG post
 * 
 * Usage:
 * <LFGCreationScreen navigation={navigation} route={route} />
 */

import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    Text,
    View,
    ViewStyle
} from 'react-native';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useTheme } from '../../../hooks/useTheme';
import LFGCreationForm from '../components/LFGCreationForm';
import { useLFG } from '../hooks/useLFG';

// ============================================
// 1. TYPES
// ============================================

export interface LFGCreationScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGCreationScreen: React.FC<LFGCreationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { communityId, squadId } = route.params || {};
  const { createLFG, isLoading } = useLFG({ communityId, squadId });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createLFG({
        ...data,
        community_id: communityId,
        squad_id: squadId || null,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create LFG post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    padding: 16,
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Creating LFG post...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Create LFG"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={contentStyle}>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 16 }}>
          Fill in the details below to find players for your game.
        </Text>
        <LFGCreationForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default LFGCreationScreen;