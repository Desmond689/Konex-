/**
 * KONEX Squad Validator
 * Billion Dollar Code - Production Ready
 * 
 * This file provides squad-specific validation:
 * - Squad name validation
 * - Squad tag validation
 * - Squad description validation
 * - Squad creation validation
 * - Squad settings validation
 * 
 * Usage:
 * import { SquadValidator } from '@core/utils/validators';
 */

import {
    REGEX_PATTERNS,
    validateRegex,
    ValidationResult
} from './validation.utils';

// ============================================
// 1. TYPES
// ============================================

export interface SquadValidatorInput {
  name?: string;
  tag?: string;
  description?: string;
  squadType?: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  joinType?: 'open' | 'approval' | 'inviteOnly';
  maxMembers?: number;
  iconUrl?: string;
  coverImageUrl?: string;
}

export interface SquadValidatorOutput {
  isValid: boolean;
  errors: Record<string, string>;
  data: SquadValidatorInput;
}

// ============================================
// 2. SQUAD VALIDATOR
// ============================================

export class SquadValidator {
  private static validSquadTypes: string[] = [
    'Competitive',
    'Casual',
    'Ranked',
    'Clan',
    'Social',
  ];

  private static validJoinTypes: string[] = ['open', 'approval', 'inviteOnly'];

  /**
   * Validate squad creation
   */
  static validateSquad(data: SquadValidatorInput): SquadValidatorOutput {
    const errors: Record<string, string> = {};
    const result: SquadValidatorInput = {};

    // Validate name
    const nameResult = this.validateSquadName(data.name || '');
    if (!nameResult.isValid) {
      errors.name = nameResult.error || 'Invalid squad name';
    } else {
      result.name = nameResult.value;
    }

    // Validate tag (optional)
    if (data.tag !== undefined && data.tag !== '') {
      const tagResult = this.validateSquadTag(data.tag);
      if (!tagResult.isValid) {
        errors.tag = tagResult.error || 'Invalid squad tag';
      } else {
        result.tag = tagResult.value;
      }
    }

    // Validate description (optional)
    if (data.description !== undefined && data.description !== '') {
      const descResult = this.validateSquadDescription(data.description);
      if (!descResult.isValid) {
        errors.description = descResult.error || 'Invalid squad description';
      } else {
        result.description = descResult.value;
      }
    }

    // Validate squad type
    if (data.squadType) {
      const typeResult = this.validateSquadType(data.squadType);
      if (!typeResult.isValid) {
        errors.squadType = typeResult.error || 'Invalid squad type';
      } else {
        result.squadType = typeResult.value;
      }
    }

    // Validate join type
    if (data.joinType) {
      const joinResult = this.validateJoinType(data.joinType);
      if (!joinResult.isValid) {
        errors.joinType = joinResult.error || 'Invalid join type';
      } else {
        result.joinType = joinResult.value;
      }
    }

    // Validate max members
    if (data.maxMembers) {
      const maxResult = this.validateMaxMembers(data.maxMembers);
      if (!maxResult.isValid) {
        errors.maxMembers = maxResult.error || 'Invalid max members';
      } else {
        result.maxMembers = maxResult.value;
      }
    }

    // Validate icon URL (optional)
    if (data.iconUrl) {
      const urlResult = validateRegex(
        data.iconUrl,
        REGEX_PATTERNS.URL,
        'Invalid icon URL'
      );
      if (!urlResult.isValid) {
        errors.iconUrl = urlResult.error || 'Invalid icon URL';
      } else {
        result.iconUrl = urlResult.value;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate squad name
   */
  static validateSquadName(name: string): ValidationResult {
    if (!name) {
      return { isValid: false, error: 'Squad name is required' };
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Squad name is required' };
    }

    if (trimmed.length < 3) {
      return { isValid: false, error: 'Squad name must be at least 3 characters' };
    }

    if (trimmed.length > 30) {
      return { isValid: false, error: 'Squad name must be less than 30 characters' };
    }

    if (!REGEX_PATTERNS.ALPHANUMERIC_SPACE.test(trimmed)) {
      return {
        isValid: false,
        error: 'Squad name can only contain letters, numbers, and spaces',
      };
    }

    return { isValid: true, value: trimmed };
  }

  /**
   * Validate squad tag
   */
  static validateSquadTag(tag: string): ValidationResult {
    if (!tag) {
      return { isValid: true, value: '' };
    }

    const trimmed = tag.trim().toUpperCase();
    if (trimmed.length === 0) {
      return { isValid: true, value: '' };
    }

    if (trimmed.length < 1) {
      return { isValid: false, error: 'Squad tag must be at least 1 character' };
    }

    if (trimmed.length > 5) {
      return { isValid: false, error: 'Squad tag must be less than 5 characters' };
    }

    if (!REGEX_PATTERNS.ALPHANUMERIC.test(trimmed)) {
      return {
        isValid: false,
        error: 'Squad tag can only contain letters and numbers',
      };
    }

    return { isValid: true, value: trimmed };
  }

  /**
   * Validate squad description
   */
  static validateSquadDescription(description: string): ValidationResult {
    if (!description) {
      return { isValid: true, value: '' };
    }

    const trimmed = description.trim();
    if (trimmed.length === 0) {
      return { isValid: true, value: '' };
    }

    if (trimmed.length > 500) {
      return {
        isValid: false,
        error: 'Squad description must be less than 500 characters',
      };
    }

    // Remove HTML tags
    const clean = trimmed.replace(REGEX_PATTERNS.NO_HTML, '');

    return { isValid: true, value: clean };
  }

  /**
   * Validate squad type
   */
  static validateSquadType(type: string): ValidationResult {
    if (!type) {
      return { isValid: false, error: 'Squad type is required' };
    }

    if (!this.validSquadTypes.includes(type)) {
      return { isValid: false, error: 'Invalid squad type' };
    }

    return { isValid: true, value: type };
  }

  /**
   * Validate join type
   */
  static validateJoinType(type: string): ValidationResult {
    if (!type) {
      return { isValid: false, error: 'Join type is required' };
    }

    if (!this.validJoinTypes.includes(type)) {
      return { isValid: false, error: 'Invalid join type' };
    }

    return { isValid: true, value: type };
  }

  /**
   * Validate max members
   */
  static validateMaxMembers(max: number): ValidationResult {
    if (!max) {
      return { isValid: false, error: 'Maximum members is required' };
    }

    if (max < 2) {
      return {
        isValid: false,
        error: 'Maximum members must be at least 2',
      };
    }

    if (max > 50) {
      return {
        isValid: false,
        error: 'Maximum members must be less than 50',
      };
    }

    return { isValid: true, value: max };
  }

  /**
   * Validate all squad settings
   */
  static validateSettings(data: SquadValidatorInput): SquadValidatorOutput {
    const errors: Record<string, string> = {};
    const result: SquadValidatorInput = {};

    // Validate name
    if (data.name !== undefined) {
      const nameResult = this.validateSquadName(data.name);
      if (!nameResult.isValid) {
        errors.name = nameResult.error || 'Invalid squad name';
      } else {
        result.name = nameResult.value;
      }
    }

    // Validate tag
    if (data.tag !== undefined) {
      const tagResult = this.validateSquadTag(data.tag);
      if (!tagResult.isValid) {
        errors.tag = tagResult.error || 'Invalid squad tag';
      } else {
        result.tag = tagResult.value;
      }
    }

    // Validate description
    if (data.description !== undefined) {
      const descResult = this.validateSquadDescription(data.description);
      if (!descResult.isValid) {
        errors.description = descResult.error || 'Invalid squad description';
      } else {
        result.description = descResult.value;
      }
    }

    // Validate squad type
    if (data.squadType) {
      const typeResult = this.validateSquadType(data.squadType);
      if (!typeResult.isValid) {
        errors.squadType = typeResult.error || 'Invalid squad type';
      } else {
        result.squadType = typeResult.value;
      }
    }

    // Validate join type
    if (data.joinType) {
      const joinResult = this.validateJoinType(data.joinType);
      if (!joinResult.isValid) {
        errors.joinType = joinResult.error || 'Invalid join type';
      } else {
        result.joinType = joinResult.value;
      }
    }

    // Validate max members
    if (data.maxMembers) {
      const maxResult = this.validateMaxMembers(data.maxMembers);
      if (!maxResult.isValid) {
        errors.maxMembers = maxResult.error || 'Invalid max members';
      } else {
        result.maxMembers = maxResult.value;
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
  static hasErrors(output: SquadValidatorOutput): boolean {
    return !output.isValid;
  }

  /**
   * Get first error message
   */
  static getFirstError(output: SquadValidatorOutput): string | null {
    const errors = Object.values(output.errors);
    return errors.length > 0 ? errors[0] : null;
  }

  /**
   * Get all error messages as array
   */
  static getAllErrors(output: SquadValidatorOutput): string[] {
    return Object.values(output.errors);
  }
}

export default SquadValidator;