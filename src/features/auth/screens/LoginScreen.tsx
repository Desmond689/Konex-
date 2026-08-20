// @ts-nocheck
/**
 * KONEX LoginScreen
 * Billion Dollar Code - Production Ready
 * 
 * Login screen for the app
 * 
 * Usage:
 * <LoginScreen navigation={navigation} />
 */

import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
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

export interface LoginScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const result = await login({ email, password });
      if (!result.success) {
        setError(result.error || 'Login failed');
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

  const forgotPasswordStyle: ViewStyle = {
    alignSelf: 'flex-end',
    marginBottom: 16,
  };

  const forgotPasswordTextStyle: TextStyle = {
    fontSize: 14,
    color: colors.primary,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Signing in...
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={contentStyle}>
          <AuthHeader
            title="Welcome Back"
            subtitle="Sign in to continue your gaming journey"
          />

          <View style={formStyle}>
            {error && <Text style={errorStyle}>{error}</Text>}

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              style={{ marginBottom: 12 }}
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              style={{ marginBottom: 8 }}
            />

            <TouchableOpacity
              style={forgotPasswordStyle}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={forgotPasswordTextStyle}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              variant="primary"
              onPress={handleLogin}
              loading={isSubmitting || isLoading}
              fullWidth
              size="lg"
            />

            <SocialLogin />

            <AuthFooter
              text="Don't have an account?"
              linkText="Sign Up"
              onLinkPress={() => navigation.navigate('Signup')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;