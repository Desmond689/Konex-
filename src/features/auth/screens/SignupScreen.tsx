// @ts-nocheck
/**
 * KONEX SignupScreen
 * Billion Dollar Code - Production Ready
 * 
 * Signup screen for new users
 * 
 * Usage:
 * <SignupScreen navigation={navigation} />
 */

import React, { useState } from 'react';
import {
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
import SocialLogin from '../components/SocialLogin';
import { useAuth } from '../hooks/useAuth';

// ============================================
// 1. TYPES
// ============================================

export interface SignupScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gamerTag: '',
    username: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    // Validate fields
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (!formData.gamerTag.trim()) errors.gamerTag = 'Gamer tag is required';
    if (!formData.username.trim()) errors.username = 'Username is required';

    if (formData.password.length > 0 && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      return;
    }

    try {
      setError(null);
      setFieldErrors({});
      setIsSubmitting(true);

      const result = await signup({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gamerTag: formData.gamerTag,
        username: formData.username,
      });

      if (!result.success) {
        setError(result.error || 'Signup failed');
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

  const fieldErrorStyle: TextStyle = {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Creating your account...
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
        showsVerticalScrollIndicator={false}
      >
        <View style={contentStyle}>
          <AuthHeader
            title="Create Account"
            subtitle="Join the ultimate gaming community"
          />

          <View style={formStyle}>
            {error && <Text style={errorStyle}>{error}</Text>}

            <Input
              placeholder="Gamer Tag"
              value={formData.gamerTag}
              onChangeText={(text) => {
                setFormData({ ...formData, gamerTag: text });
                setFieldErrors({ ...fieldErrors, gamerTag: '' });
              }}
              leftIcon="user"
              error={fieldErrors.gamerTag}
              style={{ marginBottom: 8 }}
            />
            {fieldErrors.gamerTag && (
              <Text style={fieldErrorStyle}>{fieldErrors.gamerTag}</Text>
            )}

            <Input
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                setFieldErrors({ ...fieldErrors, username: '' });
              }}
              leftIcon="at-sign"
              error={fieldErrors.username}
              style={{ marginBottom: 8 }}
            />
            {fieldErrors.username && (
              <Text style={fieldErrorStyle}>{fieldErrors.username}</Text>
            )}

            <Input
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                setFieldErrors({ ...fieldErrors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={fieldErrors.email}
              style={{ marginBottom: 8 }}
            />
            {fieldErrors.email && (
              <Text style={fieldErrorStyle}>{fieldErrors.email}</Text>
            )}

            <Input
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                setFieldErrors({ ...fieldErrors, password: '' });
              }}
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={fieldErrors.password}
              style={{ marginBottom: 8 }}
            />
            {fieldErrors.password && (
              <Text style={fieldErrorStyle}>{fieldErrors.password}</Text>
            )}

            <Input
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                setFieldErrors({ ...fieldErrors, confirmPassword: '' });
              }}
              secureTextEntry={!showPassword}
              leftIcon="lock"
              error={fieldErrors.confirmPassword}
              style={{ marginBottom: 16 }}
            />
            {fieldErrors.confirmPassword && (
              <Text style={fieldErrorStyle}>{fieldErrors.confirmPassword}</Text>
            )}

            <Button
              title="Create Account"
              variant="primary"
              onPress={handleSignup}
              loading={isSubmitting || isLoading}
              fullWidth
              size="lg"
            />

            <SocialLogin />

            <AuthFooter
              text="Already have an account?"
              linkText="Sign In"
              onLinkPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;