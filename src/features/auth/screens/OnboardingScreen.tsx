/**
 * KONEX OnboardingScreen
 * Billion Dollar Code - Production Ready
 * 
 * Onboarding screen for new users
 * 
 * Usage:
 * <OnboardingScreen navigation={navigation} />
 */

import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import { useTheme } from '../../../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface OnboardingScreenProps {
  navigation: any;
}

// ============================================
// 2. ONBOARDING DATA
// ============================================

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Find Your Gaming Community',
    description: 'Connect with gamers who share your passion. Join communities, squads, and make new friends.',
    icon: '🎮',
    color: '#7C3AED',
  },
  {
    id: '2',
    title: 'Create or Join Squads',
    description: 'Form your dream team or find the perfect squad to climb the ranks together.',
    icon: '🛡️',
    color: '#3B82F6',
  },
  {
    id: '3',
    title: 'Compete & Win',
    description: 'Participate in tournaments, earn badges, and show off your skills to the community.',
    icon: '🏆',
    color: '#F59E0B',
  },
];

// ============================================
// 3. COMPONENT
// ============================================

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderDots = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: index === currentIndex ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    );
  };

  const currentData = ONBOARDING_DATA[currentIndex];

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const iconContainerStyle: ViewStyle = {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: currentData.color + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  };

  const descriptionStyle: TextStyle = {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <View style={containerStyle}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16 }}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={contentStyle}>
          <View style={iconContainerStyle}>
            <Text style={{ fontSize: 60 }}>{currentData.icon}</Text>
          </View>

          <Text style={titleStyle}>{currentData.title}</Text>
          <Text style={descriptionStyle}>{currentData.description}</Text>

          {renderDots()}
        </View>
      </ScrollView>

      <View style={footerStyle}>
        <Text style={{ fontSize: 14, color: colors.textMuted }}>
          {currentIndex + 1} of {ONBOARDING_DATA.length}
        </Text>
        <Button
          title={currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          onPress={handleNext}
          size="md"
        />
      </View>
    </View>
  );
};

export default OnboardingScreen;