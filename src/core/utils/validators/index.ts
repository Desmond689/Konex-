/**
 * KONEX Validators - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * This file exports all validators from the validators folder.
 * 
 * Usage:
 * import { AuthValidator, UserValidator, PostValidator } from '@core/utils/validators';
 */

// Export validation utils
export {

    // Patterns
    REGEX_PATTERNS, validateBio,
    // Core validation functions
    validateEmail, validateGamerTag, validateHexColor, validateLength, validateLoginInput, validatePassword, validatePhone, validatePostCreationInput, validateProfileUpdateInput, validateRegex, validateRequired,
    // Combined validators
    validateSignUpInput, validateSlug, validateSquadCreationInput, validateUrl, validateUsername, validateUUID, ValidationError,
    // Types
    ValidationResult, ValidationResultWithErrors,

    // Default export
    default as validationUtilsDefault
} from './validation.utils';

// Export auth validator
export {
    AuthValidator,
    default as AuthValidatorDefault
} from './auth.validator';

// Export user validator
export {
    UserValidator,
    default as UserValidatorDefault
} from './user.validator';

// Export post validator
export {
    PostValidator,
    default as PostValidatorDefault
} from './post.validator';

// Export squad validator
export {
    SquadValidator,
    default as SquadValidatorDefault
} from './squad.validator';

// ============================================
// 2. TYPES
// ============================================

export type {
    AuthValidatorInput,
    AuthValidatorOutput
} from './auth.validator';

export type {
    UserValidatorInput,
    UserValidatorOutput
} from './user.validator';

export type {
    CommentValidatorInput,
    CommentValidatorOutput, PostValidatorInput,
    PostValidatorOutput
} from './post.validator';

export type {
    SquadValidatorInput,
    SquadValidatorOutput
} from './squad.validator';

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  // Core validators
  validateEmail,
  validatePassword,
  validateUsername,
  validateGamerTag,
  validateBio,
  validateUrl,
  validatePhone,
  validateLength,
  validateRequired,
  validateRegex,
  validateSlug,
  validateUUID,
  validateHexColor,

  // Combined validators
  validateSignUpInput,
  validateLoginInput,
  validateProfileUpdateInput,
  validateSquadCreationInput,
  validatePostCreationInput,

  // Classes
  AuthValidator,
  UserValidator,
  PostValidator,
  SquadValidator,

  // Patterns
  REGEX_PATTERNS,
};