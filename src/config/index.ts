/**
 * KONEX Config - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * This file exports all configuration modules including:
 * - Environment variables (env)
 * - Theme configuration (theme)
 * - App constants (constants)
 * - Navigation routes (routes)
 * - Internationalization (i18n)
 * - Sentry configuration (sentry)
 * - Analytics configuration (analytics)
 * 
 * Usage:
 * import { SUPABASE_URL, APP_NAME, LightTheme, ROUTES, getConfig } from '@config';
 */

// ============================================
// 1. EXPORT ENVIRONMENT CONFIGURATION
// ============================================

export {
    APP_ENVIRONMENT, APP_NAME,
    APP_SCHEME, APP_VERSION,
    // Default export
    default as envDefault,
    // Feature flags
    FEATURES, IS_ANDROID, IS_DEVELOPMENT, IS_IOS,
    // Environment flags
    IS_PRODUCTION,
    IS_STAGING, IS_TEST, IS_WEB, ONE_SIGNAL_APP_ID, SENTRY_DSN, SUPABASE_ANON_KEY,
    // Environment variables
    SUPABASE_URL
} from './env';

// ============================================
// 2. EXPORT THEME CONFIGURATION
// ============================================

export {
    // Colors
    Colors,
    // Dark Theme
    DarkTheme, getBorderRadius, getColors, getElevation, getShadows, getSpacing,
    // Theme utilities
    getTheme, getTypography,
    // Light Theme
    LightTheme,
    // Default export
    default as themeDefault
} from './theme';

// ============================================
// 3. EXPORT APP CONSTANTS
// ============================================

export {
    // App constants
    APP_CONSTANTS,
    // Default export
    default as constantsDefault,
    // Regular expressions
    REGEX
} from './constants';

// ============================================
// 4. EXPORT NAVIGATION ROUTES
// ============================================

export {

    // Route helpers
    getRoute,
    getRoutePath, isAdminRoute, isAuthRoute,
    isMainRoute,
    // Auth routes
    ROUTES,
    // Default export
    default as routesDefault
} from './routes';

// ============================================
// 5. EXPORT INTERNATIONALIZATION
// ============================================

export {
    getAvailableLanguages, getCurrentLanguage,
    // I18n instance
    i18n,
    // Default export
    default as i18nDefault, setLanguage,
    // Translation functions
    t,
    translate
} from './i18n';

// ============================================
// 6. EXPORT SENTRY CONFIGURATION
// ============================================

export {
    addBreadcrumb, captureError,
    captureMessage, clearUserContext,
    // Sentry utilities
    initSentry,
    // Sentry configuration
    SENTRY_CONFIG,
    // Default export
    default as sentryDefault, setUserContext
} from './sentry';

// ============================================
// 7. EXPORT ANALYTICS CONFIGURATION
// ============================================

export {
    // Analytics configuration
    ANALYTICS_CONFIG,
    // Default export
    default as analyticsDefault, identifyUser,
    // Analytics utilities
    initAnalytics, resetAnalytics, trackEvent,
    trackScreen,
    trackUserProperty
} from './analytics';

// ============================================
// 8. CONFIGURATION TYPES
// ============================================

export type {

    // Analytics types
    AnalyticsConfig,
    AnalyticsEvent,
    AnalyticsScreen,
    // Constants types
    AppConstants,
    // Env types
    Environment,
    FeatureFlags,
    // I18n types
    Language, RegexPatterns, RouteConfig,
    // Routes types
    Routes,
    // Sentry types
    SentryConfig,
    // Theme types
    Theme, ThemeBorderRadius, ThemeColors, ThemeElevation, ThemeShadows, ThemeSpacing,
    ThemeTypography, TranslationFunction
} from './types';

// ============================================
// 9. CONFIGURATION HELPERS
// ============================================

/**
 * Get the full application configuration
 */
export const getConfig = () => {
  return {
    env: {
      environment: APP_ENVIRONMENT,
      version: APP_VERSION,
      name: APP_NAME,
      isProduction: IS_PRODUCTION,
      isDevelopment: IS_DEVELOPMENT,
    },
    features: FEATURES,
    theme: {
      dark: DarkTheme,
      light: LightTheme,
    },
    routes: ROUTES,
    constants: APP_CONSTANTS,
    i18n: {
      currentLanguage: getCurrentLanguage(),
      availableLanguages: getAvailableLanguages(),
    },
  };
};

/**
 * Get configuration for a specific module
 */
export const getConfigModule = <T extends keyof ReturnType<typeof getConfig>>(
  module: T
): ReturnType<typeof getConfig>[T] => {
  const config = getConfig();
  return config[module];
};

/**
 * Validate configuration
 */
export const validateConfig = () => {
  const errors: string[] = [];

  // Validate Supabase configuration
  if (!SUPABASE_URL) {
    errors.push('SUPABASE_URL is not configured');
  }
  if (!SUPABASE_ANON_KEY) {
    errors.push('SUPABASE_ANON_KEY is not configured');
  }

  // Validate app configuration
  if (!APP_NAME) {
    errors.push('APP_NAME is not configured');
  }
  if (!APP_VERSION) {
    errors.push('APP_VERSION is not configured');
  }

  // Validate feature flags
  if (FEATURES.enableSentry && !SENTRY_DSN) {
    errors.push('SENTRY_DSN is not configured but Sentry is enabled');
  }

  if (FEATURES.enablePushNotifications && !ONE_SIGNAL_APP_ID) {
    errors.push('ONE_SIGNAL_APP_ID is not configured but push notifications are enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    count: errors.length,
  };
};

/**
 * Initialize configuration
 */
export const initConfig = () => {
  // Validate configuration
  const validation = validateConfig();

  if (!validation.isValid) {
    if (IS_PRODUCTION) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    } else {
      console.warn('⚠️ Configuration validation warnings:', validation.errors);
    }
  }

  // Initialize Sentry
  if (FEATURES.enableSentry) {
    initSentry();
  }

  // Initialize Analytics
  if (FEATURES.enableAnalytics) {
    initAnalytics();
  }

  // Log configuration
  if (IS_DEVELOPMENT) {
    console.log('🔧 KONEX Configuration initialized:', {
      environment: APP_ENVIRONMENT,
      version: APP_VERSION,
      features: FEATURES,
      validation,
    });
  }

  return {
    success: true,
    validation,
    config: getConfig(),
  };
};

// ============================================
// 10. DEFAULT EXPORT
// ============================================

export default {
  // Environment
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_ENVIRONMENT,
  APP_VERSION,
  APP_NAME,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  FEATURES,

  // Theme
  LightTheme,
  DarkTheme,
  Colors,

  // Routes
  ROUTES,

  // Constants
  APP_CONSTANTS,

  // I18n
  i18n,
  t,

  // Helpers
  getConfig,
  validateConfig,
  initConfig,
};