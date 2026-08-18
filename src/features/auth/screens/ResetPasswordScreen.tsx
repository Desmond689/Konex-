/**
 * KONEX ResetPasswordScreen
 * Billion Dollar Code - Production Ready
 * 
 * Screen for resetting password with new password
 * 
 * Usage:
 * <ResetPasswordScreen navigation={navigation} route={route} />
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
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../hooks/useAuth';

// ============================================
// 1. TYPES
// ============================================

export interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { resetPassword, updatePassword, isLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if this is from reset link or just password change
  const isReset = route.params?.reset || false;

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      let result;
      if (isReset) {
        result = await updatePassword(password);
      } else {
        // This would be for changing password while logged in
        result = await updatePassword(password);
      }

      if (result.success) {
        setIsSuccess(true);
        Alert.alert(
          'Password Updated',
          'Your password has been successfully updated.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Updating password...
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
            subtitle="Enter your new password below"
          />

          <View style={formStyle}>
            {error && <Text style={errorStyle}>{error}</Text>}
            {isSuccess && (
              <Text style={{ fontSize: 14, color: colors.success, textAlign: 'center', marginBottom: 8 }}>
                Password updated successfully!
              </Text>
            )}

            <Input
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              style={{ marginBottom: 12 }}
            />

            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock"
              style={{ marginBottom: 16 }}
            />

            <Button
              title="Update Password"
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting || isLoading}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;