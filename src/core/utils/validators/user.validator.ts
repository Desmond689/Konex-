/**
 * KONEX User Validator
 * Billion Dollar Code - Production Ready
 * 
 * This file provides user-specific validation:
 * - Profile validation
 * - Settings validation
 * - Privacy validation
 * 
 * Usage:
 * import { UserValidator } from '@core/utils/validators';
 */

import {
    validateBio,
    validateEmail,
    validateGamerTag,
    validateUrl,
    validateUsername
} from './validation.utils';

// ============================================
// 1. TYPES
// ============================================

export interface UserValidatorInput {
  username?: string;
  gamerTag?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  email?: string;
  gamingStyle?: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  role?: 'Sniper' | 'Rusher' | 'Support' | 'Flex';
  privacyProfile?: 'public' | 'friends' | 'private';
  privacyDm?: 'everyone' | 'friends' | 'friendsAndSquad' | 'noOne';
  privacyFollow?: 'everyone' | 'friends' | 'noOne';
}

export interface UserValidatorOutput {
  isValid: boolean;
  errors: Record<string, string>;
  data: UserValidatorInput;
}

// ============================================
// 2. USER VALIDATOR
// ============================================

export class UserValidator {
  /**
   * Validate user profile
   */
  static validateProfile(data: UserValidatorInput): UserValidatorOutput {
    const errors: Record<string, string> = {};
    const result: UserValidatorInput = {};

    // Validate username
    if (data.username !== undefined) {
      const usernameResult = validateUsername(data.username);
      if (!usernameResult.isValid) {
        errors.username = usernameResult.error || 'Invalid username';
      } else {
        result.username = usernameResult.value;
      }
    }

    // Validate gamer tag
    if (data.gamerTag !== undefined) {
      const gamerTagResult = validateGamerTag(data.gamerTag);
      if (!gamerTagResult.isValid) {
        errors.gamerTag = gamerTagResult.error || 'Invalid gamer tag';
      } else {
        result.gamerTag = gamerTagResult.value;
      }
    }

    // Validate bio
    if (data.bio !== undefined) {
      const bioResult = validateBio(data.bio);
      if (!bioResult.isValid) {
        errors.bio = bioResult.error || 'Invalid bio';
      } else {
        result.bio = bioResult.value;
      }
    }

    // Validate avatar URL
    if (data.avatarUrl !== undefined && data.avatarUrl) {
      const urlResult = validateUrl(data.avatarUrl);
      if (!urlResult.isValid) {
        errors.avatarUrl = 'Invalid avatar URL';
      } else {
        result.avatarUrl = urlResult.value;
      }
    }

    // Validate cover image URL
    if (data.coverImageUrl !== undefined && data.coverImageUrl) {
      const urlResult = validateUrl(data.coverImageUrl);
      if (!urlResult.isValid) {
        errors.coverImageUrl = 'Invalid cover image URL';
      } else {
        result.coverImageUrl = urlResult.value;
      }
    }

    // Validate email
    if (data.email !== undefined) {
      const emailResult = validateEmail(data.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error || 'Invalid email';
      } else {
        result.email = emailResult.value;
      }
    }

    // Validate gaming style
    if (data.gamingStyle) {
      const validStyles = ['Competitive', 'Casual', 'Ranked', 'Clan', 'Social'];
      if (!validStyles.includes(data.gamingStyle)) {
        errors.gamingStyle = 'Invalid gaming style';
      } else {
        result.gamingStyle = data.gamingStyle;
      }
    }

    // Validate skill level
    if (data.skillLevel) {
      const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
      if (!validLevels.includes(data.skillLevel)) {
        errors.skillLevel = 'Invalid skill level';
      } else {
        result.skillLevel = data.skillLevel;
      }
    }

    // Validate role
    if (data.role) {
      const validRoles = ['Sniper', 'Rusher', 'Support', 'Flex'];
      if (!validRoles.includes(data.role)) {
        errors.role = 'Invalid role';
      } else {
        result.role = data.role;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate user privacy settings
   */
  static validatePrivacy(data: UserValidatorInput): UserValidatorOutput {
    const errors: Record<string, string> = {};
    const result: UserValidatorInput = {};

    // Validate profile privacy
    if (data.privacyProfile) {
      const validOptions = ['public', 'friends', 'private'];
      if (!validOptions.includes(data.privacyProfile)) {
        errors.privacyProfile = 'Invalid privacy option';
      } else {
        result.privacyProfile = data.privacyProfile;
      }
    }

    // Validate DM privacy
    if (data.privacyDm) {
      const validOptions = ['everyone', 'friends', 'friendsAndSquad', 'noOne'];
      if (!validOptions.includes(data.privacyDm)) {
        errors.privacyDm = 'Invalid DM privacy option';
      } else {
        result.privacyDm = data.privacyDm;
      }
    }

    // Validate follow privacy
    if (data.privacyFollow) {
      const validOptions = ['everyone', 'friends', 'noOne'];
      if (!validOptions.includes(data.privacyFollow)) {
        errors.privacyFollow = 'Invalid follow privacy option';
      } else {
        result.privacyFollow = data.privacyFollow;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate all user data together
   */
  static validateAll(data: UserValidatorInput): UserValidatorOutput {
    const profileResult = this.validateProfile(data);
    const privacyResult = this.validatePrivacy(data);

    const errors = { ...profileResult.errors, ...privacyResult.errors };
    const result = { ...profileResult.data, ...privacyResult.data };

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Check if validation has errors
   */
  static hasErrors(output: UserValidatorOutput): boolean {
    return !output.isValid;
  }

  /**
   * Get first error message
   */
  static getFirstError(output: UserValidatorOutput): string | null {
    const errors = Object.values(output.errors);
    return errors.length > 0 ? errors[0] : null;
  }

  /**
   * Get all error messages as array
   */
  static getAllErrors(output: UserValidatorOutput): string[] {
    return Object.values(output.errors);
  }
}

export default UserValidator;