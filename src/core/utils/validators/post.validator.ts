/**
 * KONEX Post Validator
 * Billion Dollar Code - Production Ready
 * 
 * This file provides post-specific validation:
 * - Post content validation
 * - Post type validation
 * - Comment validation
 * - Poll validation
 * 
 * Usage:
 * import { PostValidator } from '@core/utils/validators';
 */

import {
    REGEX_PATTERNS,
    validateLength,
    validateRegex,
    validateRequired,
    validateUrl,
    ValidationResult,
} from './validation.utils';

// ============================================
// 1. TYPES
// ============================================

export interface PostValidatorInput {
  content?: string;
  postType?: 'text' | 'image' | 'clip' | 'poll' | 'lfg' | 'tournament' | 'recruitment';
  mediaUrls?: string[];
  pollOptions?: string[];
  squadId?: string;
  title?: string;
  description?: string;
}

export interface CommentValidatorInput {
  content?: string;
  parentId?: string;
}

export interface PostValidatorOutput {
  isValid: boolean;
  errors: Record<string, string>;
  data: PostValidatorInput;
}

export interface CommentValidatorOutput {
  isValid: boolean;
  errors: Record<string, string>;
  data: CommentValidatorInput;
}

// ============================================
// 2. POST VALIDATOR
// ============================================

export class PostValidator {
  private static validPostTypes: string[] = [
    'text',
    'image',
    'clip',
    'poll',
    'lfg',
    'tournament',
    'recruitment',
  ];

  /**
   * Validate post creation
   */
  static validatePost(data: PostValidatorInput): PostValidatorOutput {
    const errors: Record<string, string> = {};
    const result: PostValidatorInput = {};

    // Validate post type
    const typeResult = validateRequired(data.postType, 'Post type');
    if (!typeResult.isValid) {
      errors.postType = typeResult.error || 'Post type is required';
    } else if (!this.validPostTypes.includes(data.postType || '')) {
      errors.postType = 'Invalid post type';
    } else {
      result.postType = data.postType;
    }

    // Validate content based on type
    if (result.postType === 'text' || result.postType === 'lfg' || result.postType === 'tournament') {
      const contentResult = validateRequired(data.content, 'Content');
      if (!contentResult.isValid) {
        errors.content = contentResult.error || 'Content is required';
      } else if (data.content && data.content.length > 10000) {
        errors.content = 'Content must be less than 10,000 characters';
      } else {
        // Strip HTML tags
        result.content = data.content?.replace(REGEX_PATTERNS.NO_HTML, '');
      }
    }

    // Validate media URLs
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      if (data.mediaUrls.length > 10) {
        errors.mediaUrls = 'Maximum 10 media files allowed';
      } else {
        const invalidUrls: string[] = [];
        for (const url of data.mediaUrls) {
          const urlResult = validateUrl(url);
          if (!urlResult.isValid) {
            invalidUrls.push(url);
          }
        }
        if (invalidUrls.length > 0) {
          errors.mediaUrls = `Invalid media URLs: ${invalidUrls.slice(0, 3).join(', ')}`;
        } else {
          result.mediaUrls = data.mediaUrls;
        }
      }
    }

    // Validate poll options
    if (result.postType === 'poll') {
      if (!data.pollOptions || data.pollOptions.length < 2) {
        errors.pollOptions = 'Poll must have at least 2 options';
      } else if (data.pollOptions.length > 10) {
        errors.pollOptions = 'Poll can have maximum 10 options';
      } else {
        const cleanedOptions = data.pollOptions.map((opt) => opt.trim()).filter(Boolean);
        if (cleanedOptions.length < 2) {
          errors.pollOptions = 'Poll options cannot be empty';
        } else {
          result.pollOptions = cleanedOptions;
        }
      }
    }

    // Validate title (optional)
    if (data.title) {
      const titleResult = validateLength(data.title, 0, 100, 'Title');
      if (!titleResult.isValid) {
        errors.title = titleResult.error || 'Invalid title';
      } else {
        result.title = titleResult.value;
      }
    }

    // Validate description (optional)
    if (data.description) {
      const descResult = validateLength(data.description, 0, 500, 'Description');
      if (!descResult.isValid) {
        errors.description = descResult.error || 'Invalid description';
      } else {
        result.description = descResult.value;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate comment creation
   */
  static validateComment(data: CommentValidatorInput): CommentValidatorOutput {
    const errors: Record<string, string> = {};
    const result: CommentValidatorInput = {};

    // Validate content
    const contentResult = validateRequired(data.content, 'Comment');
    if (!contentResult.isValid) {
      errors.content = contentResult.error || 'Comment is required';
    } else if (data.content && data.content.length > 500) {
      errors.content = 'Comment must be less than 500 characters';
    } else if (data.content && data.content.trim().length === 0) {
      errors.content = 'Comment cannot be empty';
    } else {
      result.content = data.content?.trim();
    }

    // Validate parent ID (optional)
    if (data.parentId) {
      // Validate UUID format
      const uuidResult = validateRegex(
        data.parentId,
        REGEX_PATTERNS.UUID,
        'Invalid parent comment ID'
      );
      if (!uuidResult.isValid) {
        errors.parentId = uuidResult.error || 'Invalid parent comment ID';
      } else {
        result.parentId = uuidResult.value;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: result,
    };
  }

  /**
   * Validate post content
   */
  static validatePostContent(content: string, maxLength: number = 10000): ValidationResult {
    if (!content) {
      return { isValid: false, error: 'Content is required' };
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Content cannot be empty' };
    }

    if (trimmed.length > maxLength) {
      return {
        isValid: false,
        error: `Content must be less than ${maxLength} characters`,
      };
    }

    // Strip HTML tags
    const clean = trimmed.replace(REGEX_PATTERNS.NO_HTML, '');

    return { isValid: true, value: clean };
  }

  /**
   * Validate post type
   */
  static validatePostType(type: string): ValidationResult {
    if (!type) {
      return { isValid: false, error: 'Post type is required' };
    }

    if (!this.validPostTypes.includes(type)) {
      return { isValid: false, error: 'Invalid post type' };
    }

    return { isValid: true, value: type };
  }

  /**
   * Validate poll options
   */
  static validatePollOptions(options: string[], min: number = 2, max: number = 10): ValidationResult {
    if (!options || options.length < min) {
      return { isValid: false, error: `Poll must have at least ${min} options` };
    }

    if (options.length > max) {
      return { isValid: false, error: `Poll can have maximum ${max} options` };
    }

    const cleanedOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanedOptions.length < min) {
      return { isValid: false, error: 'Poll options cannot be empty' };
    }

    // Check for duplicate options
    const uniqueOptions = new Set(cleanedOptions);
    if (uniqueOptions.size !== cleanedOptions.length) {
      return { isValid: false, error: 'Poll options must be unique' };
    }

    return { isValid: true, value: cleanedOptions };
  }

  /**
   * Check if validation has errors
   */
  static hasErrors(output: PostValidatorOutput | CommentValidatorOutput): boolean {
    return !output.isValid;
  }

  /**
   * Get first error message
   */
  static getFirstError(output: PostValidatorOutput | CommentValidatorOutput): string | null {
    const errors = Object.values(output.errors);
    return errors.length > 0 ? errors[0] : null;
  }

  /**
   * Get all error messages as array
   */
  static getAllErrors(output: PostValidatorOutput | CommentValidatorOutput): string[] {
    return Object.values(output.errors);
  }
}

export default PostValidator;