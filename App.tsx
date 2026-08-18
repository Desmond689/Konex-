/**
 * KONEX App
 * Billion Dollar Code - Production Ready
 * 
 * Root application component with providers, navigation, and initialization
 * 
 * Usage:
 * This is the entry point - no manual usage needed
 */

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';

// Providers
import { AppProvider } from './src/providers/AppProvider';
import { ThemeProvider } from './src/context/ThemeContext';
import { ToastProvider } from './src/providers/ToastProvider';

// Store
import { useAuthStore } from './src/store/authStore';
import { useNotificationStore } from './src/store/notificationStore';
import { useUserStore } from './src/store/userStore';

// API - CORRECTED IMPORTS
import { supabase } from './src/api/client/supabase.client';
import { userService } from './src/api/services/user.service'; // ← FIXED: removed /user/

// Core
import { logger } from './src/core/logger/logger.service';
import { initializeAnalytics } from './src/utils/analytics';
import { handleDeepLink } from './src/utils/deepLink';

// Config
import {
  APP_ENVIRONMENT,
  APP_VERSION,
  FEATURES,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  SENTRY_DSN
} from './src/config/env';

// ============================================
// 1. SENTRY CONFIGURATION
// ============================================

if (FEATURES.enableSentry && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENVIRONMENT,
    release: APP_VERSION,
    tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,
    profilesSampleRate: IS_PRODUCTION ? 0.1 : 0.5,
    enableInExpoDevelopment: false,
    enableNative: true,
    enableAutoSessionTracking: true,
    attachScreenshot: true,
    attachViewHierarchy: true,
    maxBreadcrumbs: 100,
  });
}

// ============================================
// 2. REACT QUERY CLIENT
// ============================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404 or 403
        if (error instanceof Error) {
          if (error.message.includes('404') || error.message.includes('403')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// ============================================
// 3. APP CONTENT
// ============================================

const AppContent: React.FC = () => {
  const { isAuthenticated, setAuth, clearAuth, isLoading } = useAuthStore();
  const { setProfile, clear: clearUser } = useUserStore();
  const { initializeNotifications } = useNotificationStore();

  // ============================================
  // APP INITIALIZATION
  // ============================================

  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('🚀 Initializing KONEX', { version: APP_VERSION });

        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          logger.info('✅ Found existing session', { userId: session.user.id });

          // Set auth state
          setAuth(session);

          // Fetch user profile
          try {
            const userProfile = await userService.getProfile(session.user.id);
            setProfile(userProfile as any);

            // Initialize realtime subscriptions
            if (FEATURES.enableRealtime) {
              // Initialize realtime
              logger.info('📡 Realtime enabled');
            }

            // Initialize push notifications
            if (FEATURES.enablePushNotifications) {
              await initializeNotifications();
            }

            // Initialize analytics
            await initializeAnalytics(userProfile.id);

          } catch (profileError) {
            logger.error('❌ Failed to fetch user profile', { error: profileError });
          }
        } else {
          logger.info('ℹ️ No active session found');
          clearAuth();
          clearUser();
        }

        logger.info('✅ App initialization complete');
      } catch (error) {
        logger.error('❌ App initialization failed', { error });
        clearAuth();
        clearUser();
      }
    };

    initializeApp();
  }, []);

  // ============================================
  // DEEP LINK HANDLING
  // ============================================

  useEffect(() => {
    const handleDeepLinkEvent = (url: string) => {
      logger.info('🔗 Deep link received', { url });
      handleDeepLink(url, navigationRef);
    };

    // Subscribe to deep links
    // const subscription = Linking.addEventListener('url', handleDeepLinkEvent);

    // Cleanup
    return () => {
      // subscription?.remove();
    };
  }, []);

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    // Show splash screen
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// ============================================
// 4. ROOT APP
// ============================================

const RootApp: React.FC = () => {
  // DevTools: use Expo dev plugins separately; avoid conditional hooks + web-only Devtools in RN
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// ============================================
// 5. SENTRY WRAPPER
// ============================================

export default FEATURES.enableSentry && SENTRY_DSN
  ? Sentry.wrap(RootApp)
  : RootApp;