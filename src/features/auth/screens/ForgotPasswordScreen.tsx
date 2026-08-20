// @ts-nocheck
/**
 * KONEX ForgotPasswordScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen for resetting password
 * 
 * Usage:
 * <ForgotPasswordScreen />
 */

import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import { useTheme } from '../../../hooks/useTheme';
import AuthFooter from '../components/AuthFooter';
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../hooks/useAuth';

// ============================================
// 1. TYPES
// ============================================

export interface ForgotPasswordScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { resetPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setError(null);
      const result = await resetPassword(email);
      if (result.success) {
        setIsSuccess(true);
        Alert.alert(
          'Email Sent',
          'Password reset instructions have been sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
  };

  const formStyle: ViewStyle = {
    marginTop: 16,
  };

  const errorStyle: TextStyle = {
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  };

  const successStyle: TextStyle = {
    fontSize: 14,
    color: colors.success,
    marginBottom: 8,
    textAlign: 'center',
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Sending email...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={contentStyle}>
          <AuthHeader
            title="Reset Password"
            subtitle="Enter your email address and we'll send you instructions to reset your password."
          />

          <View style={formStyle}>
            {error && <Text style={errorStyle}>{error}</Text>}
            {isSuccess && (
              <Text style={successStyle}>
                Check your email for password reset instructions.
              </Text>
            )}

            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              style={{ marginBottom: 16 }}
            />

            <Button
              title="Send Reset Email"
              variant="primary"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            <AuthFooter
              text="Remember your password?"
              linkText="Sign In"
              onLinkPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;