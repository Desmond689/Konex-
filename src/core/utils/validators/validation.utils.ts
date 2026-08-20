/**
 * KONEX Validation Utilities
 * Billion Dollar Code - Production Ready
 * 
 * This file provides core validation utilities used across the application:
 * - Email validation
 * - Password validation
 * - Username validation
 * - Gamer tag validation
 * - Bio validation
 * - URL validation
 * - Phone validation
 * - Length validation
 * - Required field validation
 * - Regex validation
 * - Combined validators for common forms
 * 
 * Usage:
 * import { validateEmail, validatePassword, validateSignUpInput } from '@core/utils/validators';
 */

// ============================================
// 1. TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResultWithErrors<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

// ============================================
// 2. REGEX PATTERNS
// ============================================

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  GAMER_TAG: /^[a-zA-Z0-9_]{3,15}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SLUG: /^[a-z0-9-]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9 ]+$/,
  NO_HTML: /<[^>]*>/g,
  NO_SPECIAL: /^[a-zA-Z0-9_\-\. ]+$/,
} as const;

// ============================================
// 3. CORE VALIDATION FUNCTIONS
// ============================================

/**
 * Validate an email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (trimmed.length > 255) {
    return { isValid: false, error: 'Email must be less than 255 characters' };
  }

  if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 72) {
    return { isValid: false, error: 'Password must be less than 72 characters' };
  }

  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter and one number',
    };
  }

  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some((pattern) => lowerPassword.includes(pattern))) {
    return {
      isValid: false,
      error: 'Password contains a common pattern. Please choose a stronger password',
    };
  }

  return { isValid: true, value: password };
};

/**
 * Validate a username
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }

  if (!REGEX_PATTERNS.USERNAME.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  // Check for reserved usernames
  const reserved = ['admin', 'root', 'system', 'moderator', 'support', 'help'];
  if (reserved.includes(trimmed.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved. Please choose another',
    };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a gamer tag
 */
export const validateGamerTag = (gamerTag: string): ValidationResult => {
  if (!gamerTag) {
    return { isValid: false, error: 'Gamer tag is required' };
  }

  const trimmed = gamerTag.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Gamer tag is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Gamer tag must be at least 3 characters' };
  }

  if (trimmed.length > 15) {
    return { isValid: false, error: 'Gamer tag must be less than 15 characters' };
  }

  if (!REGEX_PATTERNS.GAMER_TAG.test(trimmed)) {
    return {
      isValid: false,
      error: 'Gamer tag can only contain letters, numbers, and underscores',
    };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a bio
 */
export const validateBio = (bio: string, maxLength: number = 160): ValidationResult => {
  if (!bio) {
    return { isValid: true, value: '' };
  }

  const trimmed = bio.trim();
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Bio must be less than ${maxLength} characters`,
    };
  }

  // Remove HTML tags
  const clean = trimmed.replace(REGEX_PATTERNS.NO_HTML, '');

  return { isValid: true, value: clean };
};

/**
 * Validate a URL
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  if (!REGEX_PATTERNS.URL.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (!REGEX_PATTERNS.PHONE.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number with country code',
    };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate length of a string
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field'
): ValidationResult => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const length = value.length;
  if (length < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min} characters`,
    };
  }

  if (length > max) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${max} characters`,
    };
  }

  return { isValid: true, value };
};

/**
 * Validate a required field
 */
export const validateRequired = (
  value: any,
  fieldName: string = 'Field'
): ValidationResult => {
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, value };
};

/**
 * Validate against a regex pattern
 */
export const validateRegex = (
  value: string,
  pattern: RegExp,
  errorMessage: string = 'Invalid format'
): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Value is required' };
  }

  if (!pattern.test(value)) {
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true, value };
};

/**
 * Validate a slug
 */
export const validateSlug = (slug: string): ValidationResult => {
  if (!slug) {
    return { isValid: false, error: 'Slug is required' };
  }

  const trimmed = slug.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Slug is required' };
  }

  if (!REGEX_PATTERNS.SLUG.test(trimmed)) {
    return {
      isValid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens',
    };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a UUID
 */
export const validateUUID = (uuid: string): ValidationResult => {
  if (!uuid) {
    return { isValid: false, error: 'UUID is required' };
  }

  const trimmed = uuid.trim();
  if (!REGEX_PATTERNS.UUID.test(trimmed)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true, value: trimmed };
};

/**
 * Validate a hex color
 */
export const validateHexColor = (color: string): ValidationResult => {
  if (!color) {
    return { isValid: false, error: 'Color is required' };
  }

  const trimmed = color.trim();
  if (!REGEX_PATTERNS.HEX_COLOR.test(trimmed)) {
    return {
      isValid: false,
      error: 'Color must be a valid hex color (e.g., #FF0000 or #F00)',
    };
  }

  return { isValid: true, value: trimmed };
};

// ============================================
// 4. COMBINED VALIDATORS
// ============================================

/**
 * Validate sign-up input
 */
export const validateSignUpInput = (data: {
  email: string;
  password: string;
  username: string;
  gamerTag: string;
  bio?: string;
}): ValidationResultWithErrors<{
  email: string;
  password: string;
  username: string;
  gamerTag: string;
  bio?: string;
}> => {
  const errors: ValidationError[] = [];

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.push({ field: 'email', message: emailResult.error || 'Invalid email', code: 'INVALID_EMAIL' });
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.push({ field: 'password', message: passwordResult.error || 'Invalid password', code: 'INVALID_PASSWORD' });
  }

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.isValid) {
    errors.push({ field: 'username', message: usernameResult.error || 'Invalid username', code: 'INVALID_USERNAME' });
  }

  const gamerTagResult = validateGamerTag(data.gamerTag);
  if (!gamerTagResult.isValid) {
    errors.push({ field: 'gamerTag', message: gamerTagResult.error || 'Invalid gamer tag', code: 'INVALID_GAMER_TAG' });
  }

  if (data.bio) {
    const bioResult = validateBio(data.bio);
    if (!bioResult.isValid) {
      errors.push({ field: 'bio', message: bioResult.error || 'Invalid bio', code: 'INVALID_BIO' });
    }
  }

  return {
    isValid: errors.length === 0,
    data: {
      email: emailResult.value || data.email,
      password: passwordResult.value || data.password,
      username: usernameResult.value || data.username,
      gamerTag: gamerTagResult.value || data.gamerTag,
      bio: data.bio ? (validateBio(data.bio).value || data.bio) : undefined,
    },
    errors,
  };
};

/**
 * Validate login input
 */
export const validateLoginInput = (data: {
  email: string;
  password: string;
}): ValidationResultWithErrors<{
  email: string;
  password: string;
}> => {
  const errors: ValidationError[] = [];

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.push({ field: 'email', message: emailResult.error || 'Invalid email', code: 'INVALID_EMAIL' });
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.push({ field: 'password', message: passwordResult.error || 'Invalid password', code: 'INVALID_PASSWORD' });
  }

  return {
    isValid: errors.length === 0,
    data: {
      email: emailResult.value || data.email,
      password: passwordResult.value || data.password,
    },
    errors,
  };
};

/**
 * Validate profile update input
 */
export const validateProfileUpdateInput = (data: {
  username?: string;
  gamerTag?: string;
  bio?: string;
  email?: string;
}): ValidationResultWithErrors<{
  username?: string;
  gamerTag?: string;
  bio?: string;
  email?: string;
}> => {
  const errors: ValidationError[] = [];
  const result: any = {};

  if (data.username !== undefined) {
    const usernameResult = validateUsername(data.username);
    if (!usernameResult.isValid) {
      errors.push({ field: 'username', message: usernameResult.error || 'Invalid username', code: 'INVALID_USERNAME' });
    } else {
      result.username = usernameResult.value;
    }
  }

  if (data.gamerTag !== undefined) {
    const gamerTagResult = validateGamerTag(data.gamerTag);
    if (!gamerTagResult.isValid) {
      errors.push({ field: 'gamerTag', message: gamerTagResult.error || 'Invalid gamer tag', code: 'INVALID_GAMER_TAG' });
    } else {
      result.gamerTag = gamerTagResult.value;
    }
  }

  if (data.bio !== undefined) {
    const bioResult = validateBio(data.bio);
    if (!bioResult.isValid) {
      errors.push({ field: 'bio', message: bioResult.error || 'Invalid bio', code: 'INVALID_BIO' });
    } else {
      result.bio = bioResult.value;
    }
  }

  if (data.email !== undefined) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push({ field: 'email', message: emailResult.error || 'Invalid email', code: 'INVALID_EMAIL' });
    } else {
      result.email = emailResult.value;
    }
  }

  return {
    isValid: errors.length === 0,
    data: result,
    errors,
  };
};

/**
 * Validate squad creation input
 */
export const validateSquadCreationInput = (data: {
  name: string;
  tag?: string;
  description?: string;
  squadType: string;
  joinType: string;
  maxMembers?: number;
}): ValidationResultWithErrors<{
  name: string;
  tag?: string;
  description?: string;
  squadType: string;
  joinType: string;
  maxMembers?: number;
}> => {
  const errors: ValidationError[] = [];
  const result: any = {};

  // Validate name
  const nameResult = validateLength(data.name, 3, 30, 'Squad name');
  if (!nameResult.isValid) {
    errors.push({ field: 'name', message: nameResult.error || 'Invalid squad name', code: 'INVALID_NAME' });
  } else {
    result.name = nameResult.value;
  }

  // Validate tag (optional)
  if (data.tag) {
    const tagResult = validateLength(data.tag, 1, 5, 'Squad tag');
    if (!tagResult.isValid) {
      errors.push({ field: 'tag', message: tagResult.error || 'Invalid squad tag', code: 'INVALID_TAG' });
    } else {
      const cleanTag = data.tag.trim().toUpperCase();
      if (!REGEX_PATTERNS.ALPHANUMERIC.test(cleanTag)) {
        errors.push({ field: 'tag', message: 'Squad tag can only contain letters and numbers', code: 'INVALID_TAG' });
      } else {
        result.tag = cleanTag;
      }
    }
  }

  // Validate description (optional)
  if (data.description) {
    const descResult = validateLength(data.description, 0, 500, 'Description');
    if (!descResult.isValid) {
      errors.push({ field: 'description', message: descResult.error || 'Invalid description', code: 'INVALID_DESCRIPTION' });
    } else {
      result.description = descResult.value;
    }
  }

  // Validate squad type
  const validSquadTypes = ['Competitive', 'Casual', 'Ranked', 'Clan', 'Social'];
  if (!validSquadTypes.includes(data.squadType)) {
    errors.push({ field: 'squadType', message: 'Invalid squad type', code: 'INVALID_SQUAD_TYPE' });
  } else {
    result.squadType = data.squadType;
  }

  // Validate join type
  const validJoinTypes = ['open', 'approval', 'inviteOnly'];
  if (!validJoinTypes.includes(data.joinType)) {
    errors.push({ field: 'joinType', message: 'Invalid join type', code: 'INVALID_JOIN_TYPE' });
  } else {
    result.joinType = data.joinType;
  }

  // Validate max members
  if (data.maxMembers) {
    if (data.maxMembers < 2 || data.maxMembers > 50) {
      errors.push({
        field: 'maxMembers',
        message: 'Max members must be between 2 and 50',
        code: 'INVALID_MAX_MEMBERS',
      });
    } else {
      result.maxMembers = data.maxMembers;
    }
  }

  return {
    isValid: errors.length === 0,
    data: result,
    errors,
  };
};

/**
 * Validate post creation input
 */
export const validatePostCreationInput = (data: {
  content?: string;
  postType: string;
  mediaUrls?: string[];
  pollOptions?: string[];
  squadId?: string;
}): ValidationResultWithErrors<{
  content?: string;
  postType: string;
  mediaUrls?: string[];
  pollOptions?: string[];
  squadId?: string;
}> => {
  const errors: ValidationError[] = [];
  const result: any = {};

  // Validate post type
  const validPostTypes = ['text', 'image', 'clip', 'poll', 'lfg', 'tournament', 'recruitment'];
  if (!validPostTypes.includes(data.postType)) {
    errors.push({ field: 'postType', message: 'Invalid post type', code: 'INVALID_POST_TYPE' });
  } else {
    result.postType = data.postType;
  }

  // Validate content for text posts
  if (data.postType === 'text' || data.postType === 'lfg' || data.postType === 'tournament') {
    if (!data.content) {
      errors.push({ field: 'content', message: 'Content is required', code: 'CONTENT_REQUIRED' });
    } else if (data.content.length > 10000) {
      errors.push({
        field: 'content',
        message: 'Content must be less than 10,000 characters',
        code: 'CONTENT_TOO_LONG',
      });
    } else {
      // Strip HTML
      result.content = data.content.replace(REGEX_PATTERNS.NO_HTML, '');
    }
  }

  // Validate media URLs
  if (data.mediaUrls && data.mediaUrls.length > 0) {
    if (data.mediaUrls.length > 10) {
      errors.push({
        field: 'mediaUrls',
        message: 'Maximum 10 media files allowed',
        code: 'TOO_MANY_MEDIA',
      });
    } else {
      // Validate each URL
      for (const url of data.mediaUrls) {
        const urlResult = validateUrl(url);
        if (!urlResult.isValid) {
          errors.push({
            field: 'mediaUrls',
            message: 'Invalid media URL',
            code: 'INVALID_MEDIA_URL',
          });
          break;
        }
      }
      result.mediaUrls = data.mediaUrls;
    }
  }

  // Validate poll options
  if (data.postType === 'poll') {
    if (!data.pollOptions || data.pollOptions.length < 2) {
      errors.push({
        field: 'pollOptions',
        message: 'Poll must have at least 2 options',
        code: 'INSUFFICIENT_POLL_OPTIONS',
      });
    } else if (data.pollOptions.length > 10) {
      errors.push({
        field: 'pollOptions',
        message: 'Poll can have maximum 10 options',
        code: 'TOO_MANY_POLL_OPTIONS',
      });
    } else {
      // Clean poll options
      result.pollOptions = data.pollOptions.map((opt) => opt.trim()).filter(Boolean);
    }
  }

  // Validate squad ID (optional)
  if (data.squadId) {
    const uuidResult = validateUUID(data.squadId);
    if (!uuidResult.isValid) {
      errors.push({
        field: 'squadId',
        message: 'Invalid squad ID',
        code: 'INVALID_SQUAD_ID',
      });
    } else {
      result.squadId = data.squadId;
    }
  }

  return {
    isValid: errors.length === 0,
    data: result,
    errors,
  };
};

// ============================================
// 5. EXPORT DEFAULT
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

  // Patterns
  REGEX_PATTERNS,
};