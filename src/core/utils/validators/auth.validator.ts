/**
 * KONEX Auth Validator
 * Billion Dollar Code - Production Ready
 * 
 * This file provides authentication-specific validation:
 * - Sign up validation
 * - Login validation
 * - Password reset validation
 * - Email verification validation
 * 
 * Usage:
 * import { AuthValidator } from '@core/utils/validators';
 */

import {
    validateEmail,
    validateGamerTag,
    validatePassword,
    validateRequired,
    validateUsername
} from './validation.utils';

// ============================================
// 1. TYPES
// ============================================

export interface AuthValidatorInput {
  email?: string;
  password?: string;
  username?: string;
  gamerTag?: string;
  confirmPassword?: string;
  currentPassword?: string;
  newPassword?: string;
  otp?: string;
}

export interface AuthValidatorOutput {
  isValid: boolean;
  errors: Record<string, string>;
  data: AuthValidatorInput;
}

// ============================================
// 2. AUTH VALIDATOR
// ============================================

export class AuthValidator {
  /**
   * Validate sign up input
   */
  static validateSignUp(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate email
    const emailResult = validateEmail(data.email || '');
    if (!emailResult.isValid) {
      errors.email = emailResult.error || 'Invalid email';
    } else {
      result.email = emailResult.value;
    }

    // Validate password
    const passwordResult = validatePassword(data.password || '');
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error || 'Invalid password';
    } else {
      result.password = passwordResult.value;
    }

    // Validate confirm password
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    } else if (data.confirmPassword) {
      result.confirmPassword = data.confirmPassword;
    }

    // Validate username
    const usernameResult = validateUsername(data.username || '');
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error || 'Invalid username';
    } else {
      result.username = usernameResult.value;
    }

    // Validate gamer tag
    const gamerTagResult = validateGamerTag(data.gamerTag || '');
    if (!gamerTagResult.isValid) {
      errors.gamerTag = gamerTagResult.error || 'Invalid gamer tag';
    } else {
      result.gamerTag = gamerTagResult.value;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate login input
   */
  static validateLogin(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate email
    const emailResult = validateEmail(data.email || '');
    if (!emailResult.isValid) {
      errors.email = emailResult.error || 'Invalid email';
    } else {
      result.email = emailResult.value;
    }

    // Validate password
    const passwordResult = validateRequired(data.password, 'Password');
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error || 'Password is required';
    } else {
      result.password = data.password;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate password reset
   */
  static validatePasswordReset(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate email
    const emailResult = validateEmail(data.email || '');
    if (!emailResult.isValid) {
      errors.email = emailResult.error || 'Invalid email';
    } else {
      result.email = emailResult.value;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate password change
   */
  static validatePasswordChange(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate current password
    const currentResult = validateRequired(data.currentPassword, 'Current password');
    if (!currentResult.isValid) {
      errors.currentPassword = currentResult.error || 'Current password is required';
    } else {
      result.currentPassword = data.currentPassword;
    }

    // Validate new password
    const newPasswordResult = validatePassword(data.newPassword || '');
    if (!newPasswordResult.isValid) {
      errors.newPassword = newPasswordResult.error || 'Invalid password';
    } else {
      result.newPassword = newPasswordResult.value;
    }

    // Validate confirm password
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    } else if (data.confirmPassword) {
      result.confirmPassword = data.confirmPassword;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate email verification
   */
  static validateEmailVerification(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate OTP
    const otpResult = validateRequired(data.otp, 'Verification code');
    if (!otpResult.isValid) {
      errors.otp = otpResult.error || 'Verification code is required';
    } else if (data.otp && !/^\d{6}$/.test(data.otp)) {
      errors.otp = 'Verification code must be 6 digits';
    } else {
      result.otp = data.otp;
    }

    // Validate email
    if (data.email) {
      const emailResult = validateEmail(data.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error || 'Invalid email';
      } else {
        result.email = emailResult.value;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate all auth inputs together
   */
  static validateAll(data: AuthValidatorInput): AuthValidatorOutput {
    const errors: Record<string, string> = {};
    const result: AuthValidatorInput = {};

    // Validate email
    if (data.email) {
      const emailResult = validateEmail(data.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error || 'Invalid email';
      } else {
        result.email = emailResult.value;
      }
    }

    // Validate password
    if (data.password) {
      const passwordResult = validatePassword(data.password);
      if (!passwordResult.isValid) {
        errors.password = passwordResult.error || 'Invalid password';
      } else {
        result.password = passwordResult.value;
      }
    }

    // Validate username
    if (data.username) {
      const usernameResult = validateUsername(data.username);
      if (!usernameResult.isValid) {
        errors.username = usernameResult.error || 'Invalid username';
      } else {
        result.username = usernameResult.value;
      }
    }

    // Validate gamer tag
    if (data.gamerTag) {
      const gamerTagResult = validateGamerTag(data.gamerTag);
      if (!gamerTagResult.isValid) {
        errors.gamerTag = gamerTagResult.error || 'Invalid gamer tag';
      } else {
        result.gamerTag = gamerTagResult.value;
      }
    }

    // Validate OTP
    if (data.otp) {
      if (!/^\d{6}$/.test(data.otp)) {
        errors.otp = 'Verification code must be 6 digits';
      } else {
        result.otp = data.otp;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Check if validation has errors
   */
  static hasErrors(output: AuthValidatorOutput): boolean {
    return !output.isValid;
  }

  /**
   * Get first error message
   */
  static getFirstError(output: AuthValidatorOutput): string | null {
    const errors = Object.values(output.errors);
    return errors.length > 0 ? errors[0] : null;
  }

  /**
   * Get all error messages as array
   */
  static getAllErrors(output: AuthValidatorOutput): string[] {
    return Object.values(output.errors);
  }
}

export default AuthValidator;